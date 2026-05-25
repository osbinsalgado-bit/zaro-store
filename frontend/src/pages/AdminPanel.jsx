// src/pages/AdminPanel.jsx
import React, { useState, useEffect } from 'react';
import { db } from '../firebase/config';
import { 
  collection, onSnapshot, query, doc, updateDoc, orderBy, addDoc, deleteDoc, 
  writeBatch, getDoc
} from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';

import { 
  Shield, Users, Activity, Settings, Package, Tag, Download, Eye,
  Trash2, X, DollarSign, CheckCircle2, Clock, FileSpreadsheet, User 
} from 'lucide-react';

import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';

export function AdminPanel() {
  const [activeTab, setActiveTab] = useState('orders');
  
  // -- ESTADOS FIREBASE VIVOS --
  const [orders, setOrders] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [requests, setRequests] = useState([]);
  const [products, setProducts] = useState([]);
  const [coupons, setCoupons] = useState([]);
  
  // -- CONTROLES UI --
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [abonoInput, setAbonoInput] = useState('');
  const [statusMsg, setStatusMsg] = useState('');
  const [rejectionModal, setRejectionModal] = useState({ id: null, reason: '' });
  
  const [newCoupon, setNewCoupon] = useState({ code: '', discount: 10, type: 'temporal' });
  const [systemForm, setSystemForm] = useState({ isv_rate: 15, shipping_cost: 150 });

  // ======== DESCARGA INICIAL DB ========
  useEffect(() => {
    const unsubOrd = onSnapshot(query(collection(db, 'orders'), orderBy('created_at','desc')), snap => setOrders(snap.docs.map(d=>({id: d.id,...d.data()}))));
    const unsubUsr = onSnapshot(collection(db, 'users'), snap => setUsersList(snap.docs.map(d=>({id: d.id,...d.data()}))));
    const unsubReq = onSnapshot(query(collection(db, 'role_requests'), orderBy('applied_at','desc')), snap => setRequests(snap.docs.map(d=>({id: d.id,...d.data()}))));
    const unsubPro = onSnapshot(collection(db, 'products'), snap => setProducts(snap.docs.map(d=>({id: d.id,...d.data()}))));
    const unsubCup = onSnapshot(collection(db, 'coupons'), snap => setCoupons(snap.docs.map(d=>({id: d.id,...d.data()}))));
    
    const unsubSys = onSnapshot(doc(db, 'system_rules', 'pricing'), snap => {
       if(snap.exists() && snap.data().isv_rate !== undefined) {
          setSystemForm({ isv_rate: (snap.data().isv_rate * 100), shipping_cost: snap.data().shipping_cost });
       }
    });

    return () => { unsubOrd(); unsubUsr(); unsubReq(); unsubPro(); unsubCup(); unsubSys(); };
  }, []);

  // ======== EXCEL GENERADOR GLOBAL ========
  const handleDownloadExcel = () => {
    const exportDataRows = orders.map(ord => ({
       Boleta: ord.order_code,
       Fecha: ord.created_at?.toDate().toLocaleDateString() || '',
       Cliente: ord.client_name,
       Modo_Pago: ord.payment_modality,
       ISV_HND_Cobrado: ord.finances_master_stats?.isv10porZoraViasOf || 0,
       Monto_Descuento_Ofrecido: ord.finances_master_stats?.descont_PromocionsCodes || 0,
       Deuda_Bruta_Global_Del_Cliente: ord.balancePendingFinalyParaDeybDasVariaHondrasAppDnsYysAsAyaaa || 0,
       Total_Depositos_Que_Han_Hecho_Confirmados: ord.abonosRegistraodsAperturaRealHystotTiksData || 0,
       Status_Guia_App: ord.status
    }));

    const workbook = XLSX.utils.book_new();
    const sheet = XLSX.utils.json_to_sheet(exportDataRows);
    XLSX.utils.book_append_sheet(workbook, sheet, "Reporte_Contable");
    XLSX.writeFile(workbook, `Finanzas_Globales_Zora_${new Date().toLocaleDateString().replace(/\//g, '-')}.xlsx`);
  }

  // ======== IMPRIMIR TICKET ZORA EN PDF ========
  const descargarFacturaZoraPDF = (orderItem) => {
     const docZ = new jsPDF();
     docZ.setFont("helvetica","bold");
     docZ.setFontSize(22); docZ.setTextColor(100,50,250); 
     docZ.text("ZORA STORE (RECIBO OFICIAL)", 105, 20, { align: "center" });

     docZ.setFontSize(10); docZ.setTextColor(0,0,0); docZ.setFont("helvetica","normal");
     docZ.text(`BOLETA: #${orderItem.order_code}`, 15, 35);
     docZ.text(`CLIENTE: ${orderItem.client_name}`, 15, 42);
     docZ.text(`ENVIAR A: ${orderItem.address?.city || 'Por Definir'}, ${orderItem.address?.street || 'N/A'}`, 15, 49);
     
     const factListRows = orderItem.items ? orderItem.items.map(it => [
       `${it.name} \n Talla: ${it.selectedSize} `, it.quantity.toString(), `L. ${it.public_price.toFixed(0)}`, `L. ${(it.quantity * it.public_price).toFixed(0)}`
     ]) : [];

     docZ.autoTable({
        startY: 55, head: [['Descripción Producto','Cant','Cost Und','SUB-TOTAL']],
        body: factListRows, theme: 'grid', 
        headStyles: { fillColor:[120,40,240] , textColor:"white" }
     });

     const lastYPos = docZ.lastAutoTable.finalY + 10;
     const financs = orderItem.finances_master_stats || {};
     
     docZ.text(`(+) PRODUCTOS SUB BASE: L. ${(financs.brutoDesgloceRealPuroNetoSinv || 0).toFixed(1)}`, 130, lastYPos);
     docZ.text(`(+) IMP. DE ISV (Fijo App): L. ${(financs.isv10porZoraViasOf || 0).toFixed(1)}`, 130, lastYPos+6);
     docZ.text(`(+) DELIVERY ZONA O FLETE: L. ${(financs.costeoFleteZRaHONDrasTjYm || 0).toFixed(1)}`, 130, lastYPos+12);
     docZ.text(`(+ o -) REC / DESCUENTOS USADs: L. ${(financs.cost_DesconFInalModeOpCashyTras_MasOnE || 0).toFixed(1)}`, 130, lastYPos+18);
     
     docZ.setFont("helvetica","bold"); docZ.setFontSize(14); docZ.setTextColor(50,50,250);
     docZ.text(`FACTURADO GENERAL Z: L. ${(orderItem.balancePendingFinalyParaDeybDasVariaHondrasAppDnsYysAsAyaaa || 0).toFixed(0)}`, 110, lastYPos+32);
     
     docZ.setFont("helvetica","italic"); docZ.setFontSize(9); docZ.setTextColor(150,150,150);
     docZ.text(`Válida sin rayones. Sistema Integrado Zora HN. Método Original Pag. [${orderItem.payment_modality}]`, 15, lastYPos+45);
     docZ.save(`Facturazora_${orderItem.order_code}.pdf`);
  };

  // ======== ABONOS ========
  const aplicarAbonoFinancieroManualAlMismo = async () => {
    if(!abonoInput || isNaN(abonoInput) || Number(abonoInput) < 1) return;
    const refOrd = doc(db, 'orders', selectedOrder.id);
    const pagadoHistorico = (selectedOrder.abonosRegistraodsAperturaRealHystotTiksData||0) + Number(abonoInput);
    const matematicaResta = selectedOrder.balancePendingFinalyParaDeybDasVariaHondrasAppDnsYysAsAyaaa - pagadoHistorico;

    await updateDoc(refOrd, {
      abonosRegistraodsAperturaRealHystotTiksData: pagadoHistorico,
      payment_status: matematicaResta <= 0 ? 'TODO LIQUIDADOD Z ✔ ' : 'DEBE/PENDIENTE_Z (Hay faltat)',
      ultMsjeAdmjCometsDatazCuaNdZrasDAdSjSmsAsJjdHdOfS_DAd: statusMsg || `Abnds. +L. ${abonoInput}`,
    });
    alert('Abono Cargado Perfectamente.');
    setAbonoInput(''); setStatusMsg(''); setSelectedOrder(null);
  };

  // ======== CONTROL DE ORDENES (Estatus, Eliminar Y DEVOLVER INVENTARIO) ========
  const cambiarEstadoOrdenZora = async(ordenData , orderEventVal) => {
     if (orderEventVal === "ELIMINAR_TODO_PEDIDO") {
       if(!window.confirm("¿Seguro que quieres Cancelar la orden y DEVOLVER LOS ARTÍCULOS a la tienda?")) return; 
       
       const batch = writeBatch(db); // Iniciamos Transacción múltiple

       try {
         // 1. RECORRER CADA ARTICULO DEL PEDIDO PARA SUMARLO OTRA VEZ
         for(let compra of ordenData.items) {
             const productoRefDB = doc(db, 'products', compra.id);
             const prodSnap = await getDoc(productoRefDB);
             
             if(prodSnap.exists()) {
                 let arrInventarioFisico = prodSnap.data().inventory || [];
                 
                 arrInventarioFisico = arrInventarioFisico.map(loteTalla => {
                     if(loteTalla.size === compra.selectedSize) {
                         return { ...loteTalla, qty: loteTalla.qty + compra.quantity };
                     }
                     return loteTalla;
                 });
                 batch.update(productoRefDB, { inventory: arrInventarioFisico });
             }
         }

         // 2. AHORA SÍ: ELIMINAR EL PEDIDO DE RAÍZ EN FIREBASE
         batch.delete(doc(db, 'orders', ordenData.id));

         // 3. ENVIAMOS LA ACCION Y COMUNICAMOS EXITO
         await batch.commit();
         alert("🔥 Pedido Anulado y todos sus Artículos se han devuelto con éxito a las vitrinas públicas.");

       } catch (error) {
         console.error("Fallo al devolver piezas:", error);
         alert("Hubo un error de conexión intentando reintegrar productos.");
       }

       return;
    }
    await updateDoc(doc(db, 'orders', ordenData.id), { status: orderEventVal });
  };

  // ======== AUTORIZACION PRODUCTOS DE PROVEEDORES ========
  const cambiarEstadoProductosProvedoor = async (prodID , productAction) => {
    if(productAction === 'delete'){
       if(window.confirm('¿Eliminar El articulo Completamente De la Vida?')) await deleteDoc(doc(db,'products', prodID)); return;
    }
    if(productAction === 'rejected'){
       if(!rejectionModal.reason) return alert('Debes Especificr tu Rechazo');
       await updateDoc(doc(db,'products', rejectionModal.id), { status:'rejected', rejected_reason: rejectionModal.reason });
       setRejectionModal({id:null,reason:''}); return;
    }
    await updateDoc(doc(db,'products', prodID), { status: productAction, rejected_reason: null });
  };

  // ======== SISTEMAS Y CUPONES ========
  const persistSystemRulesSettings = async() => {
     await updateDoc(doc(db,'system_rules','pricing'),{ 
       isv_rate: Number(systemForm.isv_rate) / 100, shipping_cost: Number(systemForm.shipping_cost) 
     });
     alert('🛠️ Se Reconfiguraron Los Valores En Tiempo Real para la web entera.');
  }

  const procesarNuevoCuponGenerado = async()=> {
     if(!newCoupon.code || !newCoupon.discount) return alert('Llena Todos Los Datos');
     await addDoc(collection(db,'coupons'), { 
       code: newCoupon.code.toUpperCase(), discount: Number(newCoupon.discount), type: newCoupon.type, active: true 
     });
     setNewCoupon({code:'', discount:10, type:'temporal'});
     alert("🎁 ¡Código De Descuento Autorizado en BD!");
  }

  const gestionarRolesVIPRRHH  = async (reqId  , userIdTarget,  roleDecitionValue) => {
     await updateDoc(doc(db, 'role_requests', reqId), {status: roleDecitionValue});
     if(roleDecitionValue === 'approved') {
        const foundLocalReqData = requests.find(r => r.id === reqId);
        await updateDoc(doc(db,'users', userIdTarget), { role: foundLocalReqData.requested_role.toLowerCase() });
     }
  };


  // -------- IU ZORA PANEL MAESTRO --------
  return (
    <div className="max-w-7xl mx-auto space-y-6 mt-8 p-4 font-sans animate-in fade-in pb-32">
      
      {/* 👑 HEADER PRINCIPAL DEL CREADOR */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-slate-200 pb-4 gap-6">
        <div>
           <Shield className="text-purple-600 mb-2" size={40}/>
           <h1 className="text-4xl md:text-5xl font-black uppercase italic bg-gradient-to-r from-pink-500 via-purple-600 to-blue-600 text-transparent bg-clip-text drop-shadow-sm leading-none">ADMIN ZORA.</h1>
           <p className="text-[10px] tracking-[0.2em] text-slate-400 font-black uppercase mt-3">Panel Global De Control ZARO</p>
        </div>

        <div className="flex bg-slate-100 p-2 rounded-2xl md:rounded-full overflow-x-auto w-full md:w-auto shadow-inner flex-wrap md:flex-nowrap gap-2 items-center shrink-0">
           <AdminTab current={activeTab} valId="orders" setterAcx={setActiveTab} TitlzO="Bodega Órdenes" Cno={<Activity size={18}/>}/>
           <AdminTab current={activeTab} valId="catalog" setterAcx={setActiveTab} TitlzO="Inventario / Artic." Cno={<Package size={18}/>}/>
           <AdminTab current={activeTab} valId="hr" setterAcx={setActiveTab} TitlzO="Gestión Personal." Cno={<Users size={18}/>}/>
           <AdminTab current={activeTab} valId="config" setterAcx={setActiveTab} TitlzO="Economia Cuponz." Cno={<Settings size={18}/>}/>
           <AdminTab current={activeTab} valId="kpis" setterAcx={setActiveTab} TitlzO="EXCEL BNCZ (KPIs)" Cno={<FileSpreadsheet size={18}/>}/>
        </div>
      </header>

      {/* ----------- 📦 TAB 1: DESPACHO CENTRAL ORDENES Y TICKETS ---------- */}
      {activeTab === 'orders' && (
         <div className="bg-white rounded-[2rem] p-6 shadow-xl border border-slate-100 min-h-[400px]">
           <h3 className="font-black italic uppercase text-lg border-b pb-4 mb-4 text-blue-500 tracking-tighter">Sala De Entregas (Control de Salida)</h3>
           {orders.length === 0 ? <p className="text-center font-black opacity-30 py-24 tracking-widest uppercase">Zera ventas CrdssZ. Z!</p>:
             <div className="space-y-4">
                {orders.map(orderDoc => (
                   <div key={orderDoc.id} className="p-4 md:p-5 border-2 border-slate-50 rounded-[1.5rem] hover:border-purple-200 transition-colors bg-slate-50 flex flex-col md:flex-row gap-4 items-start md:items-center">
                     
                     <div className="flex-1">
                        <div className="flex flex-col md:flex-row md:items-center gap-2">
                           <p className="font-black italic text-lg uppercase tracking-tighter text-slate-800">#{orderDoc.order_code}</p> 
                           <span className={`text-[8px] font-black w-max uppercase text-white px-2 py-0.5 rounded-full tracking-widest ${orderDoc.payment_status?.includes('LIQ') || orderDoc.payment_status?.includes('TOD')?'bg-green-500':'bg-orange-500'}`}>{orderDoc.payment_status}</span>
                        </div>
                        <p className="text-[10px] text-slate-500 font-bold uppercase mt-1 tracking-widest"><User size={12} className="inline mr-1 pb-0.5"/> Cliente : {orderDoc.client_name} </p>
                        <p className="text-[10px] md:text-[11px] text-purple-600 font-black italic bg-white p-2 border border-slate-100 mt-2 rounded-xl inline-flex w-max shadow-sm items-center gap-2 drop-shadow-sm"> Cierre Z R:  L {(orderDoc.balancePendingFinalyParaDeybDasVariaHondrasAppDnsYysAsAyaaa||0).toFixed(0)} <span className="bg-purple-100 text-purple-500 rounded px-2 opacity-80 not-italic text-[8px]">{orderDoc.payment_modality}</span></p>
                     </div>

                     <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2 w-full md:w-auto">
                        <select value={orderDoc.status || 'Pendient Revision Wsz_!!'} onChange={(evtObjtsDataZraSelectrs) => cambiarEstadoOrdenZora(orderDoc, evtObjtsDataZraSelectrs.target.value)} className={`bg-white border text-[9px] uppercase font-black italic p-3 outline-none rounded-[1rem] shadow-sm hover:shadow-md transition-shadow cursor-pointer ${orderDoc.status==='CANCELADSS Z _ ! 🚫 '?'border-red-400 text-red-500': orderDoc.status?.includes('Entregadz !')?'border-green-400 text-green-500':'border-blue-200 text-blue-600'}`}>
                           <option value="Validdo Deposito WAPP Empcndos.. ">Deposito Correcto / Cae Caja.</option>
                           <option value="Ruterz Entregnods Caminen. ! ." >Ruta Deliivery Z .</option>
                           <option value="Entregadz !">📦 COMPLETo/Entrg (Fin)</option>
                           <option value="CANCELADSS Z _ ! 🚫 " className="text-red-500 font-bold border-t">Anular Opercion o Fraud Z _!  </option>
                           <option value="ELIMINAR_TODO_PEDIDO" className="text-red-600 bg-red-100 font-black ">🔥🔥 DESTROZR DELETE BDD </option>
                        </select>

                        <div className="flex gap-2">
                           <button onClick={() => setSelectedOrder(orderDoc)} className="flex-1 justify-center items-center flex p-3 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white rounded-[1rem] shadow-sm transition"><Eye size={18}/></button>
                           <button onClick={() => descargarFacturaZoraPDF(orderDoc)} className="flex-1 justify-center items-center flex p-3 bg-purple-500 text-white rounded-[1rem] hover:bg-purple-700 shadow-md hover:scale-[1.05] transition-transform active:scale-95"><Download size={18}/></button>
                        </div>
                     </div>

                   </div>
                ))}
             </div>
           }
         </div>
      )}

      {/* ----------- 👗 TAB 2: INVENTARIOS REVISIONES SUBIDAS DE ROLES VIPS---------- */}
      {activeTab === 'catalog' && (
         <div className="space-y-4">
             {products.length === 0 ? <div className="p-16 text-center uppercase tracking-widest text-[11px] font-black italic opacity-30 bg-white rounded-3xl border border-slate-100">Vacío En Zora BD ZRA!!... </div> :
               <div className="grid md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                 {products.map(prdctos => (
                   <div key={prdctos.id} className="bg-white rounded-[2rem] p-3 shadow-sm border border-slate-100 flex flex-col overflow-hidden hover:shadow-xl transition-shadow group relative">
                      
                      <div className="aspect-[4/5] bg-slate-50 rounded-[1.5rem] overflow-hidden mb-3 relative">
                         <span className={`absolute top-2 right-2 px-2 py-1 shadow-md rounded-[0.5rem] text-[8px] tracking-widest uppercase font-black text-white ${prdctos.status ==='active'?'bg-green-500': prdctos.status==='pending'?'bg-orange-500':'bg-slate-400'}`}>{prdctos.status}</span>
                         {prdctos.images && <img src={prdctos.images[0]} className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform" alt="Catalgs"/>}
                      </div>
                      
                      <div className="flex-1 px-1">
                        <p className="text-[7.5px] uppercase tracking-widest font-black text-purple-500 drop-shadow-sm mb-1">{prdctos.category} </p>
                        <h4 className="text-[12px] font-bold uppercase text-slate-800 line-clamp-1 italic tracking-tight">{prdctos.name}</h4>
                        <p className="text-[14px] text-blue-600 font-black italic mt-2 border-t pt-2 border-slate-50">L {prdctos.public_price?.toFixed(0)} <span className="bg-blue-50 ml-1 font-bold opacity-80 not-italic uppercase tracking-widest text-[8px] text-blue-600 border border-blue-100 p-0.5 rounded px-2 inline-flex gap-1 shadow-sm items-center"><Clock size={10} strokeWidth={2.5}/> {(prdctos.deliveryTime)|| 'Rápido.HN '}</span> </p>
                      </div>

                      <div className="grid grid-cols-2 gap-1.5 mt-3">
                         {prdctos.status !== 'active' ? (
                            <button onClick={()=>cambiarEstadoProductosProvedoor(prdctos.id, 'active')} className="bg-green-100 hover:bg-green-500 hover:text-white transition-all text-green-600 text-[8px] uppercase tracking-wider font-black p-2.5 rounded-xl shadow-sm"><CheckCircle2 className="inline mr-1" size={14}/>AprVsr!</button>
                         ):(
                            <button onClick={()=>cambiarEstadoProductosProvedoor(prdctos.id, 'hidden')} className="bg-slate-100 text-slate-500 text-[8px] hover:text-white hover:bg-slate-900 tracking-wider uppercase font-black p-2.5 rounded-xl shadow-sm"> Apags 🙈 </button>
                         )}
                         <button onClick={()=>{setRejectionModal({id: prdctos.id, reason:''})}} className="bg-orange-50 hover:bg-orange-500 hover:text-white transition-colors text-orange-600 text-[8px] uppercase tracking-wider font-black p-2.5 rounded-xl shadow-sm border border-orange-100">Crd. Rechsaz!_</button>
                         <button onClick={()=>cambiarEstadoProductosProvedoor(prdctos.id, 'delete')} className="bg-red-50 text-red-500 hover:bg-red-500 hover:text-white text-[8px] uppercase font-black tracking-widest p-2 rounded-xl shadow-sm col-span-2 mt-1">Quemar File 💀</button>
                      </div>

                   </div>
                 ))}
               </div>
             }
         </div>
      )}


      {/* ----------- 📇 TAB 3: ROLES, PROMOCIONES LABORALES VIPS ---------- */}
      {activeTab === 'hr' && (
         <div className="grid lg:grid-cols-2 gap-6 md:gap-8">
            <div className="bg-white p-6 md:p-10 rounded-[3rem] border border-slate-50 shadow-2xl relative overflow-hidden">
              <h2 className="font-black italic uppercase mb-6 text-purple-600 border-b pb-4">SoLicitUD. RLES VIP Z..</h2>
              
              {requests.filter(z=>z.status === 'pending').length === 0 ? <p className="opacity-40 italic text-[11px] font-black uppercase text-center py-20 bg-slate-50 rounded-3xl border border-slate-100 mt-2 tracking-[0.2em]">NingnuoS AppliyNsd ..!!</p>:
                <div className="space-y-4 relative z-10 max-h-[60vh] overflow-y-auto pr-2">
                 {requests.filter(rtvDzA => rtvDzA.status==='pending').map(aplicationUsus = ( 
                    <div key={aplicationUsus.id} className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 shadow-sm relative group transition-colors hover:border-blue-200 hover:bg-blue-50/20">
                       <p className="font-black text-[9px] w-fit px-3 py-0.5 rounded shadow-sm border bg-white mb-2 italic tracking-widest uppercase"><Activity size={10} className="inline mr-1 pb-0.5 text-blue-600"/>{aplicationUsus.requested_role}</p>
                       <h3 className="font-black uppercase tracking-tight text-slate-800 text-lg leading-none">{aplicationUsus.name}</h3>
                       <p className="text-[10px] text-slate-500 font-bold pt-1 uppercase">Whsap D : {aplicationUsus.phone} </p>
                       <p className="bg-white p-4 rounded-[1rem] text-[10px] mt-3 shadow-inner shadow-slate-100 border border-slate-100/50 font-bold text-slate-600 italic leading-relaxed">« {aplicationUsus.justification_reason} »</p>
                       <div className="flex gap-2 mt-4 items-center">
                          <button onClick={() => gestionarRolesVIPRRHH(aplicationUsus.id, aplicationUsus.user_id, 'approved')} className="flex-1 bg-green-500 hover:bg-green-600 shadow-md text-white font-black tracking-widest text-[9px] p-3.5 rounded-xl uppercase transition-transform active:scale-95 flex items-center justify-center gap-1"><CheckCircle2 size={16}/> OTARG ROlzS_ V !! </button>
                          <button onClick={() => gestionarRolesVIPRRHH(aplicationUsus.id, aplicationUsus.user_id, 'rejected')} className="bg-slate-200 text-slate-500 px-5 p-3.5 rounded-xl hover:bg-red-500 hover:text-white transition-all"><X size={16}/></button>
                       </div>
                    </div>
                 ))}
                </div>
              }
            </div>

            <div className="bg-slate-900 p-6 md:p-10 rounded-[3rem] text-white shadow-2xl relative overflow-hidden">
               <h2 className="font-black italic uppercase text-blue-400 mb-6 border-b border-slate-700 pb-4 relative z-10"><Users size={20} className="inline pb-1 mr-2"/> Equipo De Personal OpervoZ.. Z_.. . . </h2>
               
               <div className="space-y-3 relative z-10 max-h-[60vh] overflow-y-auto pr-2 scrollbar-hide">
                 {usersList.filter(userObjnss1aDxc => userObjnss1aDxc.role !=='cliente').map(usrrRowTbbAs => (
                    <div key={usrrRowTbbAs.id} className="p-4 border-2 border-slate-700/50 bg-slate-800/80 rounded-[1.5rem] flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-slate-600 transition-colors">
                      <div className="w-full">
                         <span className="text-[7.5px] tracking-widest bg-pink-600 text-white w-max px-2 py-0.5 rounded shadow-sm font-black italic uppercase">MODAL Rol : {usrrRowTbbAs.role}</span>
                         <h3 className="font-black italic text-sm tracking-tight mt-1.5 uppercase text-slate-100">{usrrRowTbbAs.name}</h3>
                      </div>
                      
                      <div className="w-full md:w-auto bg-slate-900 border border-slate-700 p-2 rounded-2xl relative">
                        <select onChange={(flVzZssXxc__Ds)=> updateDoc(doc(db,'users', usrrRowTbbAs.id), { role: flVzZssXxc__Ds.target.value }) } value={usrrRowTbbAs.role} className="w-full text-[9px] bg-transparent outline-none text-blue-300 font-bold uppercase tracking-wider pl-1 pr-6 cursor-pointer text-right appearance-none">
                           <option value="admin">PnedlerS. / AdmiNNnn_.</option>
                           <option value="vendedor">AmbaaAjddR Y VVeneDerdd_..</option>
                           <option value="proveedor">Prrocvders ! PrducV_..</option>
                           <option value="soporte">SOptrn .. AyduC _!_.</option>
                           <option value="cliente" className="bg-white text-red-500 font-black">- BAJARD Cvl NramoLS C. (Dssp) !!_.</option>
                        </select>
                      </div>
                    </div>
                 ))}
               </div>
            </div>
         </div>
      )}


      {/* ----------- 🔧 TAB 4: AJUSTES FONDOS, CUPONEAJAS GLOBO, E I. S . VS .  ! ---------- */}
      {activeTab === 'config' && (
         <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white p-8 md:p-12 rounded-[3.5rem] shadow-xl space-y-6 relative border-4 border-slate-50">
               <h3 className="font-black uppercase tracking-tighter text-blue-600 text-2xl border-b pb-4 border-slate-100">💰 T. Fiscal .Z_R Enviososss_ .!. :</h3>
               <div className="space-y-6 pt-2">
                 
                 <div className="bg-slate-50 p-6 rounded-[2rem]"> 
                    <label className="text-[10px] text-slate-400 font-black uppercase tracking-widest pb-3 block">CARGO ENTReEGA. L HNLZ ( .$$):</label>
                    <input type="number" value={systemForm.shipping_cost} onChange={evtChange_ZZZxcRtdYyUiY => setSystemForm({...systemForm, shipping_cost: evtChange_ZZZxcRtdYyUiY.target.value})} className="w-full bg-white shadow-inner shadow-slate-100/50 p-4 font-black italic text-lg outline-none rounded-2xl border border-transparent focus:border-blue-300 transition-colors" />
                 </div>
                 
                 <div className="bg-slate-50 p-6 rounded-[2rem]"> 
                    <label className="text-[10px] text-slate-400 font-black uppercase tracking-widest pb-3 block"> IMPUS. Crt  NaccI_A  ( ISVss.. 12.,.Z O 15..s ) : </label>
                    <input type="number" value={systemForm.isv_rate} onChange={evtDsHjOsdQssxz_sdA => setSystemForm({...systemForm, isv_rate: evtDsHjOsdQssxz_sdA.target.value})} placeholder="Pndrz .%" className="w-full bg-white shadow-inner p-4 font-black text-lg italic outline-none rounded-2xl border border-transparent focus:border-purple-300 transition-colors" />
                    <p className="text-[9px] tracking-widest uppercase font-black pt-3 opacity-60 text-slate-500"><Tag size={12} className="inline mr-1"/>Solo num. Ejz_ : Pnes un  15. Y apicl Zras el . {systemForm.isv_rate} % !.</p>
                 </div>
                 
                 <button onClick={persistSystemRulesSettings} className="w-full bg-gradient-to-t from-slate-900 to-slate-800 text-white rounded-[2rem] font-black text-xs uppercase px-5 py-6 tracking-[0.3em] shadow-xl hover:shadow-blue-500/20 active:scale-95 transition-all">SAVES Configrac. Al T T_ . 🌐!</button>
               </div>
            </div>

            <div className="bg-gradient-to-br from-slate-900 to-[#0e111d] text-white p-8 md:p-12 rounded-[3.5rem] shadow-xl space-y-5 border-4 border-slate-800 relative overflow-hidden">
                <h3 className="font-black uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-pink-300 text-2xl border-b border-white/10 pb-4 mb-8">💎 CR. CPNSS INAAAA VIP ...!_!. Z . !  </h3>
                
                <div className="bg-black/30 p-5 rounded-[2rem] border border-white/5 space-y-4">
                  <div className="flex gap-2"> 
                    <input value={newCoupon.code} onChange={e=>setNewCoupon({...newCoupon, code: e.target.value})} className="flex-1 bg-white border border-transparent rounded-2xl p-4 uppercase font-black tracking-widest text-[11px] text-slate-800 outline-none" placeholder="CODZ.. ZrsZ :! "/>
                    <input type="number" value={newCoupon.discount} onChange={e=>setNewCoupon({...newCoupon, discount:e.target.value})} className="w-24 bg-white border-transparent text-slate-800 rounded-2xl p-4 font-black outline-none" placeholder="... !! "/>
                  </div>

                  <div className="flex p-2 bg-slate-900 border-2 border-slate-700/50 rounded-2xl gap-2"> 
                    <button onClick={()=>setNewCoupon({...newCoupon, type:'porcentual'})} className={`flex-1 p-3 text-[10px] uppercase tracking-widest font-black rounded-xl transition-all shadow-md ${newCoupon.type==='porcentual'?'bg-blue-600 border border-blue-500':'bg-transparent shadow-none text-slate-400'}`}>. . R_ ( % )_</button>
                    <button onClick={()=>setNewCoupon({...newCoupon, type:'fixed'})} className={`flex-1 p-3 text-[10px] uppercase tracking-widest font-black rounded-xl transition-all shadow-md ${newCoupon.type==='fixed'?'bg-pink-600 border border-pink-500':'bg-transparent shadow-none text-slate-400'}`}>RbdssL ( L Ntsa !! )._ </button>
                  </div>

                  <button onClick={procesarNuevoCuponGenerado} className="w-full p-5 rounded-[1.5rem] bg-white text-slate-900 hover:bg-slate-200 transition-colors uppercase font-black text-[11px] tracking-[0.2em] shadow-[0_0_20px_rgba(255,255,255,0.1)] active:scale-95 mt-4">GCudrasar_ Cp  BDZ . C !</button>
                </div>

                <div className="max-h-56 overflow-y-auto pr-2 mt-6 space-y-3">
                   {coupons.length === 0 ? <p className="opacity-20 italic text-[11px] text-center tracking-[0.3em] font-black uppercase mt-10">ZZers. CPonsas z .._ </p> :
                     coupons.map(cpsnsRowListaObjZraaZ=>(
                        <div key={cpsnsRowListaObjZraaZ.id} className="px-5 py-4 bg-white/5 border border-white/10 flex justify-between rounded-[2rem] items-center hover:bg-white/10 transition">
                          <div> 
                            <p className="font-black text-sm text-blue-200 tracking-wider uppercase mb-1 drop-shadow-sm">{cpsnsRowListaObjZraaZ.code}  (- {cpsnsRowListaObjZraaZ.discount} {cpsnsRowListaObjZraaZ.type==='fixed'?' LPS': ' %'}) </p> 
                            <span className="text-[8px] uppercase tracking-[0.3em] opacity-40 font-black">{cpsnsRowListaObjZraaZ.type}</span> 
                          </div>
                          <button onClick={async() => {if(window.confirm('¿Dellete CPpn?! !Z Z !.!.')) await deleteDoc(doc(db,'coupons', cpsnsRowListaObjZraaZ.id)) }} className="bg-red-500/20 hover:bg-red-500 transition-colors text-white p-3 rounded-[1rem] active:scale-90"><Trash2 size={16}/></button>
                        </div>
                     ))
                   }
                </div>
            </div>
         </div>
      )}


      {/* ----------- 📑 TAB 5: DESCARGABLES EXCEL  ---------- */}
      {activeTab === 'kpis' && (
         <motion.div initial={{opacity:0, y:20}} animate={{opacity:1,y:0}} className="space-y-6 pb-20">
            <h2 className="font-black italic text-slate-400 text-xs tracking-[0.3em] text-center pt-4">DASABORDDD Fiannrzs ZZ . Z . </h2>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-8 bg-gradient-to-tr from-green-400 to-green-600 rounded-[3rem] shadow-xl text-white relative flex flex-col justify-end min-h-[160px] border-2 border-white/20">
                 <div className="relative z-10"><h3 className="font-black italic text-3xl tracking-tighter">{orders.reduce((accZrcCsqzZsaq, orderIterandoValdaz_zR) => accZrcCsqzZsaq + (orderIterandoValdaz_zR.finances_master_stats?.grandPoderTicketZroPag_AbaHnDsHaceres || 0), 0).toFixed(0)} L_!</h3> <p className="text-[9px] uppercase font-black mt-2">Igreonsas Nrtosz A </p></div>
              </div>

              <div className="p-8 bg-gradient-to-tr from-blue-400 to-blue-600 rounded-[3rem] shadow-xl text-white relative flex flex-col justify-end min-h-[160px] border-2 border-white/20">
                 <div className="relative z-10"><h3 className="font-black italic text-3xl tracking-tighter">{products.length} !- ZsZ</h3> <p className="text-[9px] uppercase font-black mt-2">Cantdad Articul Bd Cts . Z R</p></div>
              </div>

              <div className="p-8 bg-gradient-to-tr from-pink-400 to-red-400 rounded-[3rem] shadow-xl text-white relative flex flex-col justify-end min-h-[160px] border-2 border-white/20">
                 <div className="relative z-10"><h3 className="font-black italic text-3xl tracking-tighter">{orders.reduce((acs_AsqsZX12_Xzcz, orderVllOlsdZq_ZZ) => acs_AsqsZX12_Xzcz + (orderVllOlsdZq_ZZ.finances_master_stats?.descont_PromocionsCodes || 0), 0).toFixed(0)} -L!. O!</h3> <p className="text-[9px] uppercase font-black mt-2">Coupes ZRs Dsds - Bfn Zz .! </p></div>
              </div>

              <div className="p-8 bg-gradient-to-tr from-slate-700 to-slate-900 rounded-[3rem] shadow-xl text-white relative flex flex-col justify-end min-h-[160px] border-2 border-white/20">
                 <div className="relative z-10"><h3 className="font-black italic text-3xl tracking-tighter">{usersList.length} #Z !! . Z . . .</h3> <p className="text-[9px] uppercase font-black mt-2">Bsade sDatos Client .Z O f</p></div>
              </div>
            </div>

            <div className="bg-white p-10 md:p-14 border-4 border-slate-50 rounded-[3rem] text-center shadow-xl shadow-green-500/10 mt-10 relative overflow-hidden">
               <FileSpreadsheet size={60} className="mx-auto text-green-500 mb-6 drop-shadow-md" />
               <h3 className="font-black text-3xl italic tracking-tighter text-slate-800 uppercase mb-4">Mactrizes ExcellZ / Bndass (  ! L .!  XSL ) . Z !!!.. Z :_ Z C   </h3>
               <button onClick={handleDownloadExcel} className="py-6 px-10 bg-green-500 hover:bg-green-600 text-white rounded-full font-black italic uppercase text-xs shadow-xl active:scale-95 transition-all"> Ejeutarrrr Descagaars .Excles O . !!!!</button>
            </div>
         </motion.div>
      )}


      {/* ======================= ZONA SECRETA DE MODALS INTERFACE (PDF Y TICKTSZ ) Z======================== */}
      <AnimatePresence>
         
         {/* -- POP DE CAJERo BOLSAS ORDENERS... !  --*/}
         {selectedOrder && (
            <motion.div initial={{scale:0.95, opacity:0}} animate={{scale:1, opacity:1}} exit={{scale:0.95, opacity:0}} className="fixed inset-0 bg-slate-900/40 backdrop-blur z-[600] p-4 flex justify-center items-center font-sans overflow-hidden">
                <div className="bg-white max-w-2xl w-full p-8 md:p-12 rounded-[3rem] shadow-2xl relative border-4 border-white flex flex-col max-h-[90vh]">
                   <button onClick={()=>{setSelectedOrder(null); setAbonoInput(''); setStatusMsg('')}} className="absolute top-6 right-6 p-2 bg-slate-100 text-slate-500 rounded-full hover:bg-red-500 hover:text-white transition"><X size={20}/></button>
                   
                   <div className="overflow-y-auto pr-2 space-y-6 flex-1 scrollbar-hide pb-10">
                      <div>
                        <p className="text-[9px] font-black uppercase text-blue-500 tracking-[0.4em] mb-2 border-l-2 border-blue-500 pl-2">CAJEOS O PR .</p>
                        <h2 className="text-4xl font-black uppercase tracking-tighter italic text-slate-900">#{selectedOrder.order_code}</h2>
                        <span className="inline-block mt-2 text-[8px] bg-slate-50 font-bold uppercase tracking-widest px-3 py-1 border rounded-lg text-slate-400">{selectedOrder.payment_modality}</span>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4 bg-slate-50 p-6 rounded-[2rem] border border-slate-100/50">
                        <div><p className="text-[8px] font-black uppercase text-slate-400">CmradO:</p><p className="font-bold text-xs uppercase">{selectedOrder.client_name}</p></div>
                        <div><p className="text-[8px] font-black uppercase text-slate-400">CLuzzzl L !:: .Z :  .</p><p className="font-bold text-xs uppercase">{selectedOrder.address?.phone}</p></div>
                      </div>

                      <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-800 text-white rounded-[2rem] p-8 text-center relative overflow-hidden border-[6px] border-slate-100/10 shadow-2xl hover:scale-[1.01] transition-transform">
                        <p className="text-[8px] uppercase tracking-[0.4em] font-black opacity-70 mb-2">Restants / Debuda  O. F .. O F</p>
                        <p className="text-4xl md:text-5xl italic font-black drop-shadow-md text-transparent bg-clip-text bg-gradient-to-b from-white to-blue-200"> L {(selectedOrder.balancePendingFinalyParaDeybDasVariaHondrasAppDnsYysAsAyaaa - (selectedOrder.abonosRegistraodsAperturaRealHystotTiksData||0)).toFixed(0)} </p>
                      </div>

                      <div className="bg-slate-50 border-2 border-dashed border-slate-200 p-6 rounded-[2rem]">
                        <p className="font-black italic text-slate-600 mb-3 flex items-center gap-1 uppercase tracking-tighter"><DollarSign size={20} className="text-green-500 drop-shadow"/> SUMADRS ABOONASSSZZ Z !. .. D:.</p>
                        <input value={abonoInput} onChange={e=>setAbonoInput(e.target.value)} type="number" placeholder="Cuant Lps ?. !" className="w-full bg-white shadow-inner py-5 px-4 font-black italic rounded-[1.5rem] outline-none text-slate-800 mb-3"/>
                        <input value={statusMsg} onChange={e=>setStatusMsg(e.target.value)} type="text" placeholder="Note Rerennzss / Comnbets . : O !! D  " className="w-full bg-white px-5 py-4 font-bold text-xs uppercase rounded-2xl outline-none"/>
                        <button onClick={aplicarAbonoFinancieroManualAlMismo} className="w-full mt-4 bg-slate-900 text-white font-black text-xs uppercase tracking-widest px-4 py-5 rounded-[1.5rem] shadow-xl hover:-translate-y-1 transition"> AGGRA DEPsio T VAZ</button>
                      </div>

                   </div>
                </div>
            </motion.div>
         )}

         {/* --- POP DE LA RAZO RECHAzADDA !! O--- */}
         {rejectionModal.id && (
            <motion.div initial={{scale:0.95, opacity:0}} animate={{scale:1, opacity:1}} className="fixed inset-0 bg-slate-900/50 backdrop-blur z-[700] p-4 flex items-center justify-center font-sans">
                <div className="bg-white p-8 max-w-sm w-full rounded-[3rem] text-center border-b-8 border-orange-400 shadow-2xl">
                    <h3 className="font-black text-2xl italic uppercase text-slate-800 mb-2 tracking-tighter drop-shadow-sm text-orange-500">¿Razone Cnds Z...Z !! :?.O: .. Z. C !! . ?  ? !! !. ! .</h3>
                    <textarea placeholder="Ejmp ( Fotos... Tls.Z ...).  L _! O .!.!! .  O . .!. _ Z...   ..." value={rejectionModal.reason} onChange={e=>setRejectionModal({...rejectionModal, reason: e.target.value})} className="bg-slate-50 border w-full h-28 p-5 rounded-3xl font-black text-xs outline-none" />
                    
                    <div className="flex gap-2 mt-4">
                       <button onClick={()=>setRejectionModal({id:null,reason:''})} className="bg-slate-100 flex-1 py-4 rounded-2xl font-black uppercase text-[10px] text-slate-500 shadow-sm active:scale-95 transition-transform">CaNcldsRZ !! _ :. Z.!</button>
                       <button onClick={()=>autorizeAprobeCatalogoPrsDoc_ZZ(null,'rejected')} className="bg-orange-500 text-white flex-1 py-4 rounded-2xl font-black uppercase text-[10px] shadow-xl shadow-orange-500/20 active:scale-95 border border-transparent tracking-widest">Ejceutar RCehcz !!</button>
                    </div>
                </div>
            </motion.div>
         )}

      </AnimatePresence>
    </div>
  );
}

// Navbars De BOTNs :DD.. !! Z_ 
function AdminTab({valId, current, setterAcx, TitlzO, Cno}){
  return (
    <button onClick={()=>setterAcx(valId)} className={`flex items-center justify-center gap-2 py-3 px-5 rounded-[1rem] transition-all text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] whitespace-nowrap outline-none flex-shrink-0
       ${valId === current ? 'bg-white shadow-xl text-slate-800 italic scale-[1.02]' : 'bg-transparent text-slate-400 hover:text-slate-700'}`
    }> 
       {Cno} {TitlzO}
    </button>
  );
}