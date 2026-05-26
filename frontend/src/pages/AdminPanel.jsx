import React, { useState, useEffect } from 'react';
import { db } from '../firebase/config';
import { 
  collection, onSnapshot, query, doc, updateDoc, orderBy, addDoc, deleteDoc, 
  writeBatch, getDoc 
} from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';

import { 
  Shield, Users, Activity, Settings, Package, Tag, Download, Eye,
  Trash2, X, DollarSign, CheckCircle2, FileSpreadsheet, User, Clock, AlertCircle, ShoppingCart 
} from 'lucide-react';

import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';

export function AdminPanel() {
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // -- ESTADOS DE BASE DE DATOS --
  const [orders, setOrders] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [products, setProducts] = useState([]);
  const [coupons, setCoupons] = useState([]);
  
  // -- CONFIGURACIÓN GLOBAL --
  const [systemForm, setSystemForm] = useState({ isv_rate: 15, shipping_cost: 150, employee_discount: 10 });

  // -- CONTROLES DE INTERFAZ (MODALES) --
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [paymentModal, setPaymentModal] = useState({ id: null, amount: '', note: '' });
  const [rejectionModal, setRejectionModal] = useState({ id: null, reason: '' });
  const [newCoupon, setNewCoupon] = useState({ code: '', discount: 10, type: 'porcentual' });

  // ======== 1. CARGA DE DATOS ========
  useEffect(() => {
    const unsubOrd = onSnapshot(query(collection(db, 'orders'), orderBy('created_at','desc')), snap => setOrders(snap.docs.map(d=>({id: d.id,...d.data()}))));
    const unsubUsr = onSnapshot(collection(db, 'users'), snap => setUsersList(snap.docs.map(d=>({id: d.id,...d.data()}))));
    const unsubPro = onSnapshot(collection(db, 'products'), snap => setProducts(snap.docs.map(d=>({id: d.id,...d.data()}))));
    const unsubCup = onSnapshot(collection(db, 'coupons'), snap => setCoupons(snap.docs.map(d=>({id: d.id,...d.data()}))));
    
    const unsubSys = onSnapshot(doc(db, 'system_rules', 'pricing'), snap => {
       if(snap.exists()) {
          const data = snap.data();
          setSystemForm({ 
            isv_rate: (data.isv_rate * 100) || 15, 
            shipping_cost: data.shipping_cost || 150,
            employee_discount: data.employee_discount || 10
          });
       }
    });

    return () => { unsubOrd(); unsubUsr(); unsubPro(); unsubCup(); unsubSys(); };
  }, []);

  // ======== 2. FUNCIONES DE PEDIDOS ========
  const handleOrderStatusChange = async (order, newStatus) => {
     if (newStatus === "CANCELADO_DEVOLVER") {
       if(!window.confirm("¿Seguro que deseas CANCELAR este pedido? Los artículos serán devueltos al inventario público.")) return; 
       
       const batch = writeBatch(db);
       try {
         // 1. Devolver artículos al inventario
         for(let item of order.items) {
             const productRef = doc(db, 'products', item.id);
             const prodSnap = await getDoc(productRef);
             if(prodSnap.exists()) {
                 let inventory = prodSnap.data().inventory || [];
                 inventory = inventory.map(stock => {
                     if(stock.size === item.selectedSize) return { ...stock, qty: stock.qty + item.quantity };
                     return stock;
                 });
                 batch.update(productRef, { inventory });
             }
         }
         // 2. Actualizar estado de la orden (No la eliminamos para guardar historial)
         batch.update(doc(db, 'orders', order.id), { status: 'Cancelado', payment_status: 'Reembolsado/Anulado' });
         await batch.commit();
         alert("Pedido anulado y artículos devueltos al inventario con éxito.");
       } catch (error) {
         alert("Error al intentar reintegrar productos. Revisa tu conexión.");
       }
       return;
    }
    
    if (newStatus === "ELIMINAR_DB") {
        if(!window.confirm("¿ELIMINAR PERMANENTEMENTE? Se borrará el registro completo (No devuelve inventario automáticamente).")) return;
        await deleteDoc(doc(db, 'orders', order.id));
        return;
    }

    await updateDoc(doc(db, 'orders', order.id), { status: newStatus });
  };

  const handleManualPayment = async () => {
    if(!paymentModal.amount || Number(paymentModal.amount) <= 0) return alert("Ingresa un monto válido");
    
    const orderRef = doc(db, 'orders', paymentModal.id);
    const orderSnap = await getDoc(orderRef);
    if(!orderSnap.exists()) return;

    const currentData = orderSnap.data();
    const totalPaid = (currentData.amountPaid || 0) + Number(paymentModal.amount);
    const remaining = (currentData.total || 0) - totalPaid;

    await updateDoc(orderRef, {
      amountPaid: totalPaid,
      payment_status: remaining <= 0 ? 'Pagado Completamente' : 'Abono Parcial Registrado',
      admin_notes: paymentModal.note || currentData.admin_notes || ''
    });

    alert('Pago registrado correctamente.');
    setPaymentModal({ id: null, amount: '', note: '' });
  };

  const downloadInvoicePDF = (order) => {
     const docZ = new jsPDF();
     docZ.setFont("helvetica","bold");
     docZ.setFontSize(18); 
     docZ.text("ZARO STORE - FACTURA OFICIAL", 105, 20, { align: "center" });

     docZ.setFontSize(10); docZ.setFont("helvetica","normal");
     docZ.text(`ORDEN: #${order.order_code}`, 15, 35);
     docZ.text(`CLIENTE: ${order.client_name}`, 15, 42);
     docZ.text(`TELÉFONO: ${order.address?.phone || 'N/A'}`, 15, 49);
     docZ.text(`DIRECCIÓN: ${order.address?.city || 'Por Definir'}, ${order.address?.street || 'N/A'}`, 15, 56);
     
     const tableData = order.items ? order.items.map(it => [
       `${it.name} \n Talla: ${it.selectedSize} `, it.quantity.toString(), `L. ${it.public_price.toFixed(2)}`, `L. ${(it.quantity * it.public_price).toFixed(2)}`
     ]) : [];

     docZ.autoTable({
        startY: 65, head: [['Descripción', 'Cant.', 'Precio Unit.', 'Subtotal']],
        body: tableData, theme: 'grid', 
        headStyles: { fillColor: [15, 23, 42] } // Slate-900
     });

     const lastYPos = docZ.lastAutoTable.finalY + 10;
     const finances = order.financial_resume || {};
     
     docZ.text(`Subtotal: L. ${(finances.subtotal || 0).toFixed(2)}`, 130, lastYPos);
     docZ.text(`ISV (15%): L. ${(finances.isv_amount || 0).toFixed(2)}`, 130, lastYPos+7);
     docZ.text(`Envío: L. ${(finances.shipping_fee || 0).toFixed(2)}`, 130, lastYPos+14);
     
     const totalDiscounts = (finances.store_discount || 0) + (finances.seller_discount || 0);
     if(totalDiscounts > 0) {
         docZ.text(`Descuentos Aplicados: - L. ${totalDiscounts.toFixed(2)}`, 130, lastYPos+21);
     }
     
     docZ.setFont("helvetica","bold"); docZ.setFontSize(12);
     docZ.text(`TOTAL FACTURADO: L. ${(order.total || 0).toFixed(2)}`, 130, lastYPos+32);
     docZ.text(`MONTO ABONADO: L. ${(order.amountPaid || 0).toFixed(2)}`, 130, lastYPos+39);
     
     docZ.save(`Factura_Zaro_${order.order_code}.pdf`);
  };

  // ======== 3. FUNCIONES DE PRODUCTOS ========
  const handleProductAction = async (prodId, action) => {
    if(action === 'delete'){
       if(window.confirm('¿Eliminar este artículo permanentemente de la base de datos?')) await deleteDoc(doc(db,'products', prodId)); 
       return;
    }
    if(action === 'rejected'){
       if(!rejectionModal.reason) return alert('Debes especificar la razón del rechazo para notificar al proveedor.');
       await updateDoc(doc(db,'products', rejectionModal.id), { status:'rejected', rejected_reason: rejectionModal.reason });
       setRejectionModal({id:null,reason:''}); 
       return;
    }
    await updateDoc(doc(db,'products', prodId), { status: action, rejected_reason: null });
  };

  // ======== 4. FUNCIONES DE RRHH Y CUPONES ========
  const handleRoleChange = async (userId, newRole) => {
     let updates = { role: newRole };
     if (newRole === 'vendedor' || newRole === 'empleado') {
        const generatedCode = `AFF-${Math.floor(1000 + Math.random() * 9000)}`;
        updates.employee_code = generatedCode;
        
        await addDoc(collection(db, 'coupons'), {
            code: generatedCode,
            type_creator: newRole,
            discount: systemForm.employee_discount,
            active: true,
            usage_count: 0,
            owner_id: userId
        });
        alert(`Se ha generado el código de afiliado: ${generatedCode} para este usuario.`);
     }
     await updateDoc(doc(db,'users', userId), updates);
  };

  const handleCreateCoupon = async()=> {
     if(!newCoupon.code || !newCoupon.discount) return alert('Por favor, completa el código y el descuento.');
     await addDoc(collection(db,'coupons'), { 
       code: newCoupon.code.toUpperCase(), discount: Number(newCoupon.discount), type: newCoupon.type, active: true, usage_count: 0
     });
     setNewCoupon({code:'', discount:10, type:'porcentual'});
     alert("Cupón creado y activado exitosamente.");
  };

  const saveGlobalSettings = async() => {
     await updateDoc(doc(db,'system_rules','pricing'),{ 
       isv_rate: Number(systemForm.isv_rate) / 100, 
       shipping_cost: Number(systemForm.shipping_cost),
       employee_discount: Number(systemForm.employee_discount)
     });
     alert('Configuración guardada. Los cambios aplicarán a nuevas compras.');
  };

  // ======== 5. DESCARGA EXCEL ========
  const handleDownloadExcel = () => {
    const exportData = orders.map(ord => ({
       'Número de Orden': ord.order_code,
       'Fecha': ord.created_at?.toDate().toLocaleDateString() || '',
       'Cliente': ord.client_name,
       'Modalidad de Pago': ord.payment_modality,
       'Estado del Pedido': ord.status,
       'Subtotal (L)': ord.financial_resume?.subtotal || 0,
       'ISV Cobrado (L)': ord.financial_resume?.isv_amount || 0,
       'Envío Cobrado (L)': ord.financial_resume?.shipping_fee || 0,
       'Descuentos Aplicados (L)': (ord.financial_resume?.store_discount || 0) + (ord.financial_resume?.seller_discount || 0),
       'Total Facturado (L)': ord.total || 0,
       'Monto Pagado/Abonado (L)': ord.amountPaid || 0,
       'Código Afiliado Usado': ord.financial_resume?.seller_discount > 0 ? 'Sí' : 'No'
    }));

    const workbook = XLSX.utils.book_new();
    const sheet = XLSX.utils.json_to_sheet(exportData);
    XLSX.utils.book_append_sheet(workbook, sheet, "Reporte_General");
    XLSX.writeFile(workbook, `Reporte_ZaroStore_${new Date().toLocaleDateString().replace(/\//g, '-')}.xlsx`);
  }

  // ======== RENDERIZADO DE INTERFAZ ========
  return (
    <div className="max-w-7xl mx-auto space-y-6 mt-8 p-4 font-sans animate-in fade-in pb-32">
      
      {/* HEADER PRINCIPAL */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-200 pb-6 gap-6 bg-white p-8 rounded-[2rem] shadow-sm">
        <div>
           <h1 className="text-3xl font-black uppercase tracking-tight text-slate-900 flex items-center gap-3">
             <Shield className="text-blue-600"/> Panel Administrativo
           </h1>
           <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-2">Control General Zaro Store</p>
        </div>

        <div className="flex bg-slate-100 p-2 rounded-2xl overflow-x-auto w-full md:w-auto shadow-inner gap-2 items-center">
           <TabButton current={activeTab} valId="dashboard" setter={setActiveTab} label="Métricas (KPI)" icon={<Activity size={16}/>}/>
           <TabButton current={activeTab} valId="orders" setter={setActiveTab} label="Pedidos" icon={<ShoppingCart size={16}/>}/>
           <TabButton current={activeTab} valId="catalog" setter={setActiveTab} label="Catálogo" icon={<Package size={16}/>}/>
           <TabButton current={activeTab} valId="users" setter={setActiveTab} label="RRHH" icon={<Users size={16}/>}/>
           <TabButton current={activeTab} valId="config" setter={setActiveTab} label="Marketing & Ajustes" icon={<Settings size={16}/>}/>
        </div>
      </header>

      {/* ----------- 1. TAB: DASHBOARD (MÉTRICAS Y EXCEL) ---------- */}
      {activeTab === 'dashboard' && (
         <motion.div initial={{opacity:0}} animate={{opacity:1}} className="space-y-8">
            <div className="grid md:grid-cols-4 gap-4">
              <StatCard title="Ingresos Brutos" value={`L ${orders.reduce((acc, o) => acc + (o.total || 0), 0).toFixed(0)}`} color="bg-slate-900"/>
              <StatCard title="Total Artículos" value={products.length} color="bg-blue-600"/>
              <StatCard title="Descuentos Otorgados" value={`L ${orders.reduce((acc, o) => acc + ((o.financial_resume?.store_discount || 0) + (o.financial_resume?.seller_discount || 0)), 0).toFixed(0)}`} color="bg-pink-600"/>
              <StatCard title="Usuarios Registrados" value={usersList.length} color="bg-purple-600"/>
            </div>

            <div className="bg-white p-10 rounded-[3rem] border border-slate-200 text-center shadow-sm">
               <FileSpreadsheet size={60} className="mx-auto text-green-500 mb-4" />
               <h3 className="font-black text-2xl text-slate-800 uppercase tracking-tight mb-2">Exportar Base de Datos Contable</h3>
               <p className="text-sm text-slate-500 mb-6">Genera un reporte detallado en Excel de todas las ventas, impuestos y descuentos.</p>
               <button onClick={handleDownloadExcel} className="py-4 px-10 bg-green-500 hover:bg-green-600 text-white rounded-full font-black uppercase text-xs shadow-lg shadow-green-500/20 active:scale-95 transition-all"> 
                  Descargar Excel (.xlsx)
               </button>
            </div>
         </motion.div>
      )}

      {/* ----------- 2. TAB: GESTIÓN DE PEDIDOS ---------- */}
      {activeTab === 'orders' && (
         <div className="space-y-4">
            {orders.length === 0 ? <p className="text-center font-bold text-slate-400 py-10">No hay pedidos registrados.</p> :
              orders.map(order => (
                 <div key={order.id} className="bg-white p-6 border border-slate-200 rounded-[2rem] shadow-sm flex flex-col md:flex-row gap-6 items-start md:items-center hover:border-blue-300 transition-colors">
                   
                   <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                         <h4 className="font-black text-lg uppercase text-slate-900">Orden #{order.order_code}</h4> 
                         <span className={`text-[10px] font-bold uppercase px-3 py-1 rounded-full ${order.payment_status?.includes('Pagado') ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                           {order.payment_status || 'Pendiente'}
                         </span>
                      </div>
                      <p className="text-xs font-medium text-slate-600 uppercase mb-2">Cliente: {order.client_name}</p>
                      <p className="text-[11px] font-bold text-slate-800 bg-slate-50 px-3 py-2 rounded-xl inline-block border border-slate-100"> 
                        Total: L {(order.total || 0).toFixed(0)} | Abonado: L {(order.amountPaid || 0).toFixed(0)}
                      </p>
                   </div>

                   <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
                      <select value={order.status || 'Verificando Pago'} onChange={(e) => handleOrderStatusChange(order, e.target.value)} className="bg-slate-50 border border-slate-200 text-[10px] font-bold uppercase p-3 rounded-xl outline-none focus:border-blue-500">
                         <option value="Verificando Pago">Verificando Pago</option>
                         <option value="Preparando">Preparando Paquete</option>
                         <option value="En Ruta">En Ruta / Despachado</option>
                         <option value="Entregado">Completado / Entregado</option>
                         <option value="CANCELADO_DEVOLVER" className="text-orange-600 font-black">❌ Cancelar y Devolver Inv.</option>
                         <option value="ELIMINAR_DB" className="text-red-600 font-black">🗑️ Eliminar Registro Permanente</option>
                      </select>

                      <div className="flex gap-2">
                         <button onClick={() => setSelectedOrder(order)} className="p-3 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white rounded-xl transition" title="Ver Detalles"><Eye size={18}/></button>
                         <button onClick={() => setPaymentModal({id: order.id, amount: '', note: ''})} className="p-3 bg-green-50 text-green-600 hover:bg-green-600 hover:text-white rounded-xl transition" title="Abonar Pago"><DollarSign size={18}/></button>
                         <button onClick={() => downloadInvoicePDF(order)} className="p-3 bg-slate-900 text-white rounded-xl hover:scale-105 transition" title="Descargar Factura"><Download size={18}/></button>
                      </div>
                   </div>
                 </div>
              ))
            }
         </div>
      )}

      {/* ----------- 3. TAB: CATÁLOGO Y REVISIÓN DE PROVEEDORES ---------- */}
      {activeTab === 'catalog' && (
         <div className="grid md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
             {products.length === 0 ? <p className="col-span-full text-center py-10 font-bold text-slate-400">Catálogo vacío.</p> :
               products.map(product => (
                 <div key={product.id} className="bg-white rounded-2xl p-3 shadow-sm border border-slate-200 flex flex-col group relative overflow-hidden">
                    
                    <div className="aspect-[4/5] bg-slate-50 rounded-xl overflow-hidden mb-3 relative">
                       <span className={`absolute top-2 right-2 px-2 py-1 rounded-md text-[9px] font-black uppercase text-white shadow-sm ${product.status ==='active'?'bg-green-500': product.status==='pending'?'bg-orange-500':'bg-slate-500'}`}>
                         {product.status === 'pending' ? 'En Revisión' : product.status}
                       </span>
                       {product.images && <img src={product.images[0]} className="w-full h-full object-cover group-hover:scale-105 transition-transform" alt="Producto"/>}
                    </div>
                    
                    <div className="flex-1 px-1">
                      <p className="text-[9px] font-black uppercase text-blue-500 tracking-wider mb-1">{product.category}</p>
                      <h4 className="text-xs font-bold text-slate-800 line-clamp-1">{product.name}</h4>
                      <p className="text-sm font-black text-slate-900 mt-2">L {product.public_price?.toFixed(0)}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-100">
                       {product.status !== 'active' ? (
                          <button onClick={()=>handleProductAction(product.id, 'active')} className="bg-green-100 text-green-700 hover:bg-green-600 hover:text-white text-[9px] font-black uppercase py-2 rounded-lg transition">Aprobar</button>
                       ):(
                          <button onClick={()=>handleProductAction(product.id, 'hidden')} className="bg-slate-100 text-slate-600 hover:bg-slate-800 hover:text-white text-[9px] font-black uppercase py-2 rounded-lg transition">Ocultar</button>
                       )}
                       <button onClick={()=>setRejectionModal({id: product.id, reason:''})} className="bg-orange-50 text-orange-600 hover:bg-orange-500 hover:text-white text-[9px] font-black uppercase py-2 rounded-lg transition border border-orange-100">Rechazar</button>
                       <button onClick={()=>handleProductAction(product.id, 'delete')} className="col-span-2 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white text-[9px] font-black uppercase py-2 rounded-lg transition">Eliminar Definitivo</button>
                    </div>
                 </div>
               ))
             }
         </div>
      )}

      {/* ----------- 4. TAB: RRHH Y USUARIOS ---------- */}
      {activeTab === 'users' && (
         <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm p-6 overflow-x-auto text-slate-500 placeholder-slate-400">
            <h2 className="font-black text-xl text-slate-800 uppercase mb-6 border-b border-slate-100 pb-4">Gestión de Personal y Clientes</h2>
            <table className="w-full text-left border-collapse min-w-[600px]">
                <thead>
                    <tr className="text-[10px] uppercase font-black text-slate-400 border-b border-slate-100">
                        <th className="py-4 px-2">Nombre del Usuario</th>
                        <th className="py-4 px-2">Datos de Contacto</th>
                        <th className="py-4 px-2">Rol en el Sistema</th>
                        <th className="py-4 px-2">Código Asignado (Afiliado)</th>
                    </tr>
                </thead>
                <tbody>
                    {usersList.map(u => (
                        <tr key={u.id} className="border-b border-slate-50 hover:bg-slate-50 transition">
                            <td className="py-4 px-2 font-bold text-xs uppercase text-slate-800">{u.name}</td>
                            <td className="py-4 px-2 text-[11px] text-slate-500 font-medium">{u.email} <br/>{u.phone}</td>
                            <td className="py-4 px-2">
                                <select value={u.role || 'cliente'} onChange={(e) => handleRoleChange(u.id, e.target.value)} className="bg-white border border-slate-200 text-[10px] font-bold uppercase rounded p-2 outline-none focus:border-blue-500">
                                    <option value="cliente">Cliente Regular</option>
                                    <option value="proveedor">Proveedor / Mayorista</option>
                                    <option value="empleado">Vendedor / Afiliado</option>
                                    <option value="admin">Administrador</option>
                                </select>
                            </td>
                            <td className="py-4 px-2 text-xs font-black text-blue-600">{u.employee_code || '-'}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
         </div>
      )}

      {/* ----------- 5. TAB: MARKETING Y AJUSTES GLOBALES ---------- */}
      {activeTab === 'config' && (
         <div className="grid md:grid-cols-2 gap-8">
            
            {/* PARAMETROS GLOBALES */}
            <div className="bg-white p-8 md:p-10 rounded-[3rem] shadow-sm border border-slate-200 space-y-6">
               <h3 className="font-black uppercase tracking-tight text-slate-800 text-xl border-b pb-4 border-slate-100">Configuración Financiera Global</h3>
               <div className="space-y-4">
                 
                 <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100"> 
                    <label className="text-[10px] text-slate-500 font-bold uppercase tracking-widest pb-2 block">Tasa de Impuesto (ISV %)</label>
                    <input type="number" value={systemForm.isv_rate} onChange={e => setSystemForm({...systemForm, isv_rate: e.target.value})} className="w-full bg-white p-4 font-bold text-sm outline-none rounded-xl border border-slate-200 focus:border-blue-500 transition-colors" />
                 </div>
                 
                 <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100"> 
                    <label className="text-[10px] text-slate-500 font-bold uppercase tracking-widest pb-2 block">Costo de Envío Estándar (L)</label>
                    <input type="number" value={systemForm.shipping_cost} onChange={e => setSystemForm({...systemForm, shipping_cost: e.target.value})} className="w-full bg-white p-4 font-bold text-sm outline-none rounded-xl border border-slate-200 focus:border-blue-500 transition-colors" />
                 </div>

                 <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100"> 
                    <label className="text-[10px] text-slate-500 font-bold uppercase tracking-widest pb-2 block">Descuento Base Empleados (%)</label>
                    <input type="number" value={systemForm.employee_discount} onChange={e => setSystemForm({...systemForm, employee_discount: e.target.value})} className="w-full bg-white p-4 font-bold text-sm outline-none rounded-xl border border-slate-200 focus:border-blue-500 transition-colors" />
                    <p className="text-[9px] font-medium text-slate-400 mt-2">Este % se asignará automáticamente a los nuevos códigos creados al promover un usuario a Vendedor/Empleado.</p>
                 </div>
                 
                 <button onClick={saveGlobalSettings} className="w-full bg-slate-900 text-white rounded-2xl font-black text-xs uppercase py-5 tracking-widest shadow-lg hover:bg-slate-800 active:scale-95 transition-all">
                   Guardar Parámetros
                 </button>
               </div>
            </div>

            {/* GESTIÓN DE CUPONES */}
            <div className="bg-slate-900 text-white p-8 md:p-10 rounded-[3rem] shadow-xl border border-slate-800 space-y-6">
                <h3 className="font-black uppercase tracking-tight text-white text-xl border-b border-slate-700 pb-4">Gestión de Cupones</h3>
                
                <div className="bg-slate-800/50 p-6 rounded-3xl border border-slate-700 space-y-4">
                  <div className="flex gap-2"> 
                    <input value={newCoupon.code} onChange={e=>setNewCoupon({...newCoupon, code: e.target.value})} className="flex-1 bg-slate-900 border border-slate-700 rounded-xl p-4 uppercase font-bold text-xs text-white outline-none focus:border-blue-500" placeholder="Código (Ej: VERANO20)"/>
                    <input type="number" value={newCoupon.discount} onChange={e=>setNewCoupon({...newCoupon, discount:e.target.value})} className="w-24 bg-slate-900 border border-slate-700 text-white rounded-xl p-4 font-bold outline-none focus:border-blue-500" placeholder="Valor"/>
                  </div>

                  <div className="flex bg-slate-900 rounded-xl p-1 gap-1 border border-slate-700"> 
                    <button onClick={()=>setNewCoupon({...newCoupon, type:'porcentual'})} className={`flex-1 p-3 text-[10px] uppercase font-bold rounded-lg transition-all ${newCoupon.type==='porcentual'?'bg-blue-600 text-white':'text-slate-400 hover:bg-slate-800'}`}>Porcentaje (%)</button>
                    <button onClick={()=>setNewCoupon({...newCoupon, type:'fixed'})} className={`flex-1 p-3 text-[10px] uppercase font-bold rounded-lg transition-all ${newCoupon.type==='fixed'?'bg-pink-600 text-white':'text-slate-400 hover:bg-slate-800'}`}>Monto Fijo (L)</button>
                  </div>

                  <button onClick={handleCreateCoupon} className="w-full py-4 rounded-xl bg-white text-slate-900 hover:bg-slate-200 transition-colors uppercase font-black text-xs">Crear Cupón</button>
                </div>

                <div className="max-h-64 overflow-y-auto pr-2 space-y-3 scrollbar-hide">
                   {coupons.map(coupon =>(
                      <div key={coupon.id} className="p-4 bg-slate-800 border border-slate-700 flex justify-between rounded-2xl items-center">
                        <div> 
                          <p className="font-bold text-sm text-white uppercase">{coupon.code}</p> 
                          <p className="text-[10px] text-slate-400 font-medium mt-1">
                             Descuento: <span className="text-pink-400 font-bold">{coupon.discount}{coupon.type==='fixed'?' L':'%'}</span> | Usos: {coupon.usage_count || 0}
                          </p>
                        </div>
                        <button onClick={async() => {if(window.confirm('¿Eliminar este cupón?')) await deleteDoc(doc(db,'coupons', coupon.id)) }} className="text-slate-500 hover:text-red-400 transition-colors p-2"><Trash2 size={18}/></button>
                      </div>
                   ))}
                </div>
            </div>
         </div>
      )}


      {/* ======================= MODALES DE INTERFAZ ======================== */}
      <AnimatePresence>
         
         {/* MODAL: VER DETALLE DEL PEDIDO */}
         {selectedOrder && (
            <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[600] p-4 flex justify-center items-center font-sans overflow-hidden">
                <div className="bg-white max-w-2xl w-full p-8 rounded-[2rem] shadow-2xl relative max-h-[90vh] flex flex-col">
                   <button onClick={()=>setSelectedOrder(null)} className="absolute top-6 right-6 p-2 bg-slate-100 text-slate-500 rounded-full hover:bg-slate-200 transition"><X size={20}/></button>
                   
                   <h2 className="text-2xl font-black uppercase text-slate-900 border-b border-slate-100 pb-4 mb-6">Detalle de Orden #{selectedOrder.order_code}</h2>
                   
                   <div className="overflow-y-auto pr-2 space-y-6 flex-1 scrollbar-hide">
                      
                      {/* DATOS DEL CLIENTE */}
                      <div className="grid md:grid-cols-2 gap-4 bg-slate-50 p-5 rounded-2xl border border-slate-200">
                        <div><p className="text-[10px] font-bold uppercase text-slate-500 mb-1">Cliente</p><p className="font-bold text-sm text-slate-800">{selectedOrder.client_name}</p></div>
                        <div><p className="text-[10px] font-bold uppercase text-slate-500 mb-1">Teléfono</p><p className="font-bold text-sm text-slate-800">{selectedOrder.address?.phone}</p></div>
                        <div className="md:col-span-2"><p className="text-[10px] font-bold uppercase text-slate-500 mb-1">Dirección de Entrega</p><p className="font-bold text-sm text-slate-800">{selectedOrder.address?.city}, {selectedOrder.address?.street}</p></div>
                      </div>

                      {/* DATOS DE AFILIADO / CUPÓN SI EXISTE */}
                      {(selectedOrder.financial_resume?.store_discount > 0 || selectedOrder.financial_resume?.seller_discount > 0) && (
                         <div className="bg-pink-50 p-4 rounded-xl border border-pink-100 flex items-center gap-3">
                            <Tag className="text-pink-500"/>
                            <div>
                               <p className="text-[10px] font-bold uppercase text-pink-600">Descuento / Código de Vendedor Aplicado</p>
                               <p className="text-sm font-black text-pink-700">Ahorro otorgado: L {(selectedOrder.financial_resume.store_discount + selectedOrder.financial_resume.seller_discount).toFixed(2)}</p>
                            </div>
                         </div>
                      )}

                      {/* LISTA DE ARTÍCULOS */}
                      <div className="space-y-3">
                         <h3 className="font-black text-xs uppercase text-slate-400 tracking-widest mb-3">Artículos Solicitados</h3>
                         {selectedOrder.items.map((item, idx) => (
                             <div key={idx} className="flex gap-4 items-center bg-white border border-slate-200 p-3 rounded-xl">
                                 <img src={item.images[0]} className="w-14 h-14 rounded-lg object-cover border border-slate-100" />
                                 <div className="flex-1">
                                     <p className="text-sm font-bold text-slate-800">{item.name}</p>
                                     <p className="text-[11px] font-medium text-slate-500 mt-1">Talla: {item.selectedSize} | Cantidad: {item.quantity}</p>
                                 </div>
                                 <p className="font-black text-slate-900">L {(item.public_price * item.quantity).toFixed(0)}</p>
                             </div>
                         ))}
                      </div>
                   </div>
                </div>
            </motion.div>
         )}

         {/* MODAL: ABONOS / PAGOS */}
         {paymentModal.id && (
            <motion.div initial={{opacity:0}} animate={{opacity:1}} className="fixed inset-0 bg-slate-900/60 backdrop-blur z-[700] p-4 flex justify-center items-center font-sans">
                <div className="bg-white p-8 max-w-sm w-full rounded-[2rem] shadow-2xl relative">
                   <h3 className="font-black text-lg uppercase text-slate-900 mb-4 text-center">Registrar Ingreso</h3>
                   
                   <div className="space-y-4">
                      <div>
                         <label className="text-[10px] font-bold text-slate-500 uppercase ml-2 mb-1 block">Monto Depositado (L)</label>
                         <input value={paymentModal.amount} onChange={e=>setPaymentModal({...paymentModal, amount: e.target.value})} type="number" placeholder="0.00" className="w-full bg-slate-50 border border-slate-200 p-4 font-black text-xl rounded-xl outline-none focus:border-green-500 text-slate-800"/>
                      </div>
                      <div>
                         <label className="text-[10px] font-bold text-slate-500 uppercase ml-2 mb-1 block">Nota Interna (Opcional)</label>
                         <input value={paymentModal.note} onChange={e=>setPaymentModal({...paymentModal, note: e.target.value})} type="text" placeholder="Ej: Depósito Ficohsa" className="w-full bg-slate-50 border border-slate-200 p-4 font-bold text-xs rounded-xl outline-none focus:border-green-500"/>
                      </div>

                      <div className="flex gap-2 pt-2">
                         <button onClick={()=>setPaymentModal({id:null, amount:'', note:''})} className="flex-1 py-3 bg-slate-100 text-slate-600 font-bold uppercase text-xs rounded-xl hover:bg-slate-200 transition">Cancelar</button>
                         <button onClick={handleManualPayment} className="flex-1 py-3 bg-green-500 text-white font-bold uppercase text-xs rounded-xl shadow-md hover:bg-green-600 transition">Guardar</button>
                      </div>
                   </div>
                </div>
            </motion.div>
         )}

         {/* MODAL: RECHAZO DE PRODUCTOS */}
         {rejectionModal.id && (
            <motion.div initial={{opacity:0}} animate={{opacity:1}} className="fixed inset-0 bg-slate-900/60 backdrop-blur z-[700] p-4 flex items-center justify-center font-sans">
                <div className="bg-white p-8 max-w-sm w-full rounded-[2rem] text-center shadow-2xl">
                    <AlertCircle size={50} className="text-orange-500 mx-auto mb-4"/>
                    <h3 className="font-black text-xl uppercase text-slate-800 mb-2">Rechazar Producto</h3>
                    <p className="text-xs text-slate-500 mb-4">El proveedor recibirá este mensaje explicando por qué no se aprobó su artículo.</p>
                    
                    <textarea placeholder="Ej: Las fotos tienen mala resolución, por favor sube imágenes claras..." value={rejectionModal.reason} onChange={e=>setRejectionModal({...rejectionModal, reason: e.target.value})} className="bg-slate-50 border border-slate-200 w-full h-32 p-4 rounded-xl font-medium text-sm outline-none focus:border-orange-400 mb-4" />
                    
                    <div className="flex gap-2">
                       <button onClick={()=>setRejectionModal({id:null,reason:''})} className="bg-slate-100 flex-1 py-3 rounded-xl font-bold uppercase text-xs text-slate-600 hover:bg-slate-200 transition">Cancelar</button>
                       <button onClick={()=>handleProductAction(rejectionModal.id, 'rejected')} className="bg-orange-500 text-white flex-1 py-3 rounded-xl font-bold uppercase text-xs shadow-md hover:bg-orange-600 transition">Rechazar Artículo</button>
                    </div>
                </div>
            </motion.div>
         )}

      </AnimatePresence>
    </div>
  );
}

// COMPONENTE SECUNDARIO PARA BOTONES DE PESTAÑAS
function TabButton({valId, current, setter, label, icon}){
  return (
    <button onClick={()=>setter(valId)} className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl transition-all text-[10px] font-black uppercase tracking-wider whitespace-nowrap outline-none flex-shrink-0
       ${valId === current ? 'bg-white shadow-sm text-slate-900 border border-slate-200' : 'bg-transparent text-slate-500 hover:bg-slate-200/50'}`
    }> 
       {icon} {label}
    </button>
  );
}

// COMPONENTE SECUNDARIO PARA LAS TARJETAS DEL DASHBOARD
function StatCard({ title, value, color }) {
    return (
        <div className={`${color} text-white p-6 rounded-3xl shadow-lg relative overflow-hidden`}>
            <p className="text-[10px] font-bold uppercase tracking-widest opacity-80 mb-2">{title}</p>
            <h3 className="text-3xl font-black italic">{value}</h3>
        </div>
    )
}