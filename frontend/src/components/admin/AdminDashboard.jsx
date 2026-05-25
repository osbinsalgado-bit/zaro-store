import React, { useState, useEffect } from 'react';
import { db } from '../../firebase/config';
import { 
  collection, onSnapshot, query, where, doc, updateDoc, 
  setDoc, getDoc, orderBy, addDoc, serverTimestamp, deleteDoc 
} from 'firebase/firestore';
import { 
  Check, X, Settings, Package, ShoppingCart, TrendingUp, 
  Download, Eye, EyeOff, Clock, User, Tag, Ticket, Plus, Trash2, 
  MessageSquare, CreditCard, Image as ImageIcon, MapPin, Phone
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('orders'); 
  const [pendingProducts, setPendingProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [heroSlides, setHeroSlides] = useState([]);
  const [rules, setRules] = useState({ admin_margin: 0, shipping_cost: 0, isv_rate: 0.15 });
  
  // Estados de Modales y Acción
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [rejection, setRejection] = useState({ id: null, reason: '' });
  const [manualPay, setManualPay] = useState({ id: null, amount: '' });
  const [newCoupon, setNewCoupon] = useState({ code: '', type: 'fixed', value: 0, minPurchase: 0 });

  useEffect(() => {
    // 1. Reglas de Sistema (Precios, ISV, Envío)
    onSnapshot(doc(db, 'system_rules', 'pricing'), (snap) => {
      if (snap.exists()) setRules(snap.data());
    });

    // 2. Productos Pendientes
    const qProd = query(collection(db, 'products'), where('status', '==', 'pending'));
    onSnapshot(qProd, (snap) => setPendingProducts(snap.docs.map(d => ({ id: d.id, ...d.data() }))));

    // 3. Pedidos
    const qOrd = query(collection(db, 'orders'), orderBy('created_at', 'desc'));
    onSnapshot(qOrd, (snap) => setOrders(snap.docs.map(d => ({ id: d.id, ...d.data() }))));

    // 4. Cupones
    onSnapshot(collection(db, 'coupons'), snap => setCoupons(snap.docs.map(d => ({ id: d.id, ...d.data() }))));

    // 5. Todos los Productos
    onSnapshot(collection(db, 'products'), snap => setAllProducts(snap.docs.map(d => ({ id: d.id, ...d.data() }))));

    // 6. Slides del Hero
    onSnapshot(collection(db, 'hero_slides'), snap => setHeroSlides(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
  }, []);

  // --- LÓGICA DE PDF (FACTURA DINÁMICA) ---
  const downloadInvoice = (order) => {
    const doc = new jsPDF();
    doc.setFont("helvetica", "bold");
    doc.text("ZARO STORE - FACTURA OFICIAL", 105, 20, { align: "center" });
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Código de Orden: ${order.order_code}`, 20, 40);
    doc.text(`Fecha: ${new Date(order.created_at?.seconds * 1000).toLocaleDateString()}`, 20, 45);
    doc.text(`Cliente: ${order.client_email}`, 20, 50);
    doc.text(`Dirección: ${order.address.city}, ${order.address.street}`, 20, 55);

    const tableData = order.items.map(i => [i.name, i.quantity, `L ${i.public_price}`, `L ${i.public_price * i.quantity}`]);
    
    doc.autoTable({
      startY: 65,
      head: [['Producto', 'Cant', 'Precio Unit.', 'Subtotal']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillStyle: '#000' }
    });

    const finalY = doc.lastAutoTable.finalY + 10;
    doc.text(`Subtotal: L ${order.subtotal.toFixed(2)}`, 140, finalY);
    doc.text(`ISV (15%): L ${order.isv.toFixed(2)}`, 140, finalY + 5);
    doc.text(`Envío: L ${order.envio.toFixed(2)}`, 140, finalY + 10);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text(`TOTAL: L ${order.total.toFixed(2)}`, 140, finalY + 20);

    doc.save(`Factura_ZARO_${order.order_code}.pdf`);
  };

  // --- LÓGICA DE PRODUCTOS ---
  const approveProduct = async (id) => await updateDoc(doc(db, 'products', id), { status: 'active', rejected_reason: null });
  
  const rejectProduct = async () => {
    if (!rejection.reason) return alert("Escribe un motivo");
    const productToReject = pendingProducts.find(p => p.id === rejection.id);
    await updateDoc(doc(db, 'products', rejection.id), { status: 'rejected', rejected_reason: rejection.reason });
    if (productToReject) {
      await notifyProvider(productToReject.provider_id, `Tu producto "${productToReject.name}" ha sido rechazado: ${rejection.reason}`);
    }
    setRejection({ id: null, reason: '' });
  };

  const deleteCoupon = async (id) => await deleteDoc(doc(db, 'coupons', id));
  
  const restrictProduct = async (id, status) => {
    await updateDoc(doc(db, 'products', id), { status: status }); // active o restricted
  };

  const notifyProvider = async (providerId, message) => {
    if (!providerId) return;
    const userSnap = await getDoc(doc(db, 'users', providerId));
    if (!userSnap.exists()) return;

    await addDoc(collection(db, 'mail'), {
      to: userSnap.data().email,
      message: {
        subject: 'Actualización de tu Producto - Zaro Store',
        text: message,
        html: `<b>ZARO STORE</b><p>${message}</p>`
      }
    });
  };

  // --- LÓGICA DE PAGOS MANUALES ---
  const addPayment = async () => {
    const orderRef = doc(db, 'orders', manualPay.id);
    const orderSnap = await getDoc(orderRef);
    const currentPaid = orderSnap.data().paid_amount || 0;
    const newTotalPaid = currentPaid + Number(manualPay.amount);
    
    await updateDoc(orderRef, { 
      paid_amount: newTotalPaid,
      payment_status: newTotalPaid >= orderSnap.data().total ? 'Pagado' : 'Abono Parcial'
    });
    setManualPay({ id: null, amount: '' });
  };

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-32 px-4">
      <header className="flex flex-col md:flex-row justify-between items-center gap-6">
        <h1 className="text-4xl font-black italic uppercase tracking-tighter text-slate-900">ZARO <span className="text-blue-600">CONTROL</span></h1>
        <div className="flex bg-slate-100 p-1.5 rounded-[2rem] gap-1 overflow-x-auto w-full md:w-auto">
           <TabBtn active={activeTab==='orders'} label="Pedidos" icon={ShoppingCart} count={orders.length} onClick={()=>setActiveTab('orders')}/>
           <TabBtn active={activeTab==='approvals'} label="Revisar" icon={Clock} onClick={()=>setActiveTab('approvals')}/>
           <TabBtn active={activeTab==='inventory'} label="Catálogo" icon={Package} onClick={()=>setActiveTab('inventory')}/>
           <TabBtn active={activeTab==='coupons'} label="Cupones" icon={Ticket} onClick={()=>setActiveTab('coupons')}/>
           <TabBtn active={activeTab==='design'} label="Ruleta" icon={ImageIcon} onClick={()=>setActiveTab('design')}/>
           <TabBtn active={activeTab==='config'} label="Ajustes" icon={Settings} onClick={()=>setActiveTab('config')}/>
        </div>
      </header>

      <AnimatePresence mode="wait">
        {/* PESTAÑA PEDIDOS */}
        {activeTab === 'orders' && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} className="space-y-4">
            {orders.map(order => (
              <div key={order.id} className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="flex gap-4 items-center flex-1">
                   <div className="p-4 bg-slate-50 rounded-2xl text-slate-400"><Package/></div>
                   <div>
                      <h4 className="font-black text-sm uppercase italic">#{order.order_code}</h4>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{order.client_email}</p>
                      <div className="flex gap-2 mt-2">
                        <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase ${order.payment_status === 'Pagado' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                          L {order.paid_amount || 0} / L {order.total}
                        </span>
                      </div>
                   </div>
                </div>

                <div className="flex gap-2">
                   <button onClick={() => setSelectedOrder(order)} className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:text-blue-600"><Eye size={20}/></button>
                   <button onClick={() => setManualPay({id: order.id, amount: ''})} className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:text-green-600"><CreditCard size={20}/></button>
                   <button onClick={() => downloadInvoice(order)} className="p-3 bg-slate-900 text-white rounded-xl"><Download size={20}/></button>
                </div>

                <select value={order.status} onChange={(e) => updateDoc(doc(db, 'orders', order.id), { status: e.target.value })} className="p-3 bg-slate-100 rounded-xl text-[10px] font-black uppercase outline-none">
                   <option value="Solicitado">Solicitado</option>
                   <option value="Empacado">Empacado</option>
                   <option value="En Camino">En Camino</option>
                   <option value="Entregado">Entregado</option>
                </select>
              </div>
            ))}
          </motion.div>
        )}

        {/* PESTAÑA REVISIONES */}
        {activeTab === 'approvals' && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pendingProducts.map(p => (
              <div key={p.id} className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-4">
                 <div className="flex gap-4">
                    <img src={p.images[0]} className="w-20 h-20 rounded-2xl object-cover border" />
                    <div>
                       <h4 className="font-black text-sm uppercase italic leading-tight">{p.name}</h4>
                       <p className="text-[9px] font-black text-blue-500 uppercase">{p.category}</p>
                       <p className="text-[10px] font-black text-slate-400 mt-2 uppercase">Costo: L {p.base_price}</p>
                    </div>
                 </div>
                 <div className="flex gap-2">
                    <button onClick={() => approveProduct(p.id)} className="flex-1 py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase">Aprobar</button>
                    <button onClick={() => setRejection({id: p.id, reason: ''})} className="px-6 py-4 bg-red-50 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all"><X/></button>
                 </div>
              </div>
            ))}
          </motion.div>
        )}

        {/* PESTAÑA: CATALOGO GLOBAL */}
        {activeTab === 'inventory' && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} className="space-y-4">
            <div className="grid grid-cols-1 gap-2">
              {allProducts.map(p => (
                <div key={p.id} className="bg-white p-3 rounded-2xl border border-slate-100 flex justify-between items-center shadow-sm">
                  <div className="flex gap-3 items-center">
                    <img src={p.images[0]} className="w-10 h-10 rounded-lg object-cover" />
                    <div>
                      <h4 className="font-black text-[11px] uppercase truncate w-32">{p.name}</h4>
                      <p className="text-[8px] font-bold text-slate-400 uppercase">{p.status}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => restrictProduct(p.id, p.status === 'active' ? 'restricted' : 'active')} className={`p-2 rounded-xl ${p.status === 'active' ? 'bg-orange-50 text-orange-600':'bg-green-50 text-green-600'}`}>
                       {p.status === 'active' ? <EyeOff size={16}/> : <Eye size={16}/>}
                    </button>
                    <button onClick={async () => {
                      await deleteDoc(doc(db, 'products', p.id));
                      await notifyProvider(p.provider_id, `Tu producto "${p.name}" ha sido eliminado por el administrador.`);
                    }} className="p-2 bg-red-50 text-red-500 rounded-xl"><Trash2 size={16}/></button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* PESTAÑA: RULETA (HERO SLIDER) */}
        {activeTab === 'design' && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} className="space-y-4">
             <div className="bg-white p-6 rounded-[2rem] border border-slate-100">
                <h3 className="font-black text-sm uppercase mb-4">Nueva Publicidad Ruleta</h3>
                <input id="slideImg" placeholder="URL de Imagen Alargada" className="w-full p-4 bg-slate-50 rounded-xl mb-2 text-xs" />
                <button onClick={() => {
                  const url = document.getElementById('slideImg').value;
                  addDoc(collection(db, 'hero_slides'), { url, active: true });
                }} className="w-full py-3 bg-blue-600 text-white rounded-xl font-black text-[10px] uppercase">Agregar a Ruleta</button>
             </div>
             <div className="grid grid-cols-2 gap-2">
                {heroSlides.map(s => (
                  <div key={s.id} className="relative rounded-xl overflow-hidden aspect-video">
                    <img src={s.url} className="w-full h-full object-cover" />
                    <button onClick={() => deleteDoc(doc(db, 'hero_slides', s.id))} className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-lg"><X size={14}/></button>
                  </div>
                ))}
             </div>
          </motion.div>
        )}

        {/* PESTAÑA AJUSTES (ISV, ENVÍO, MARGEN) */}
        {activeTab === 'config' && (
          <motion.div initial={{opacity:0, y:20}} animate={{opacity:1}} className="grid md:grid-cols-2 gap-8">
             <div className="bg-white p-10 rounded-[3rem] border border-slate-100 space-y-6">
                <h3 className="text-xl font-black uppercase italic tracking-tighter">Parámetros Fiscales</h3>
                <ConfigInput label="Impuesto ISV (Decimal)" val={rules.isv_rate} onChange={(v) => updateDoc(doc(db, 'system_rules', 'pricing'), { isv_rate: Number(v) })} />
                <ConfigInput label="Costo Envío (L.)" val={rules.shipping_cost} onChange={(v) => updateDoc(doc(db, 'system_rules', 'pricing'), { shipping_cost: Number(v) })} />
                <ConfigInput label="Margen Tienda (Decimal)" val={rules.admin_margin} onChange={(v) => updateDoc(doc(db, 'system_rules', 'pricing'), { admin_margin: Number(v) })} />
             </div>

             <div className="bg-white p-10 rounded-[3rem] border border-slate-100 space-y-6">
                <h3 className="text-xl font-black uppercase italic tracking-tighter">Gestión de Cupones</h3>
                <div className="space-y-4">
                  <input id="couponCode" placeholder="Código del Cupón" className="w-full p-4 bg-slate-50 rounded-xl text-sm" />
                  <input id="couponDiscount" type="number" placeholder="Descuento (%)" className="w-full p-4 bg-slate-50 rounded-xl text-sm" />
                  <button onClick={() => {
                    const code = document.getElementById('couponCode').value;
                    const discount = Number(document.getElementById('couponDiscount').value);
                    addDoc(collection(db, 'coupons'), { code: code.toUpperCase(), discount, active: true });
                  }} className="w-full py-4 bg-green-600 text-white rounded-xl font-black text-sm uppercase">Crear Cupón</button>
                </div>
                <div className="space-y-2">
                  {coupons.map(c => (
                    <div key={c.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
                      <div>
                        <p className="font-black text-sm uppercase">{c.code}</p>
                        <p className="text-xs text-slate-500">{c.discount}% descuento</p>
                      </div>
                      <button onClick={() => deleteCoupon(c.id)} className="p-2 bg-red-50 text-red-500 rounded-lg"><Trash2 size={16}/></button>
                    </div>
                  ))}
                </div>
             </div>
             <div className="bg-blue-600 rounded-[3rem] p-10 text-white flex flex-col justify-center">
                <TrendingUp size={48} className="mb-4 opacity-50"/>
                <h3 className="text-3xl font-black uppercase italic">Dashboard Analytics</h3>
                <p className="mt-4 text-sm font-bold opacity-80 uppercase leading-relaxed">Configura los valores globales. Los cambios afectan a nuevos productos y carritos en tiempo real.</p>
             </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- MODAL DETALLE DE PEDIDO --- */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
          <motion.div initial={{scale:0.9, opacity:0}} animate={{scale:1, opacity:1}} className="bg-white w-full max-w-2xl rounded-[3rem] p-10 max-h-[90vh] overflow-y-auto space-y-8">
            <header className="flex justify-between items-center border-b pb-6">
               <h3 className="text-2xl font-black uppercase italic tracking-tighter">Detalle de Envío</h3>
               <button onClick={()=>setSelectedOrder(null)} className="p-2 bg-slate-100 rounded-full"><X/></button>
            </header>
            
            <div className="grid md:grid-cols-2 gap-8">
               <div className="space-y-4">
                  <div className="flex items-center gap-3 text-blue-600"><User/> <p className="text-sm font-black uppercase">{selectedOrder.address.name}</p></div>
                  <div className="flex items-center gap-3 text-slate-500"><MapPin/> <p className="text-xs font-bold uppercase">{selectedOrder.address.city}, {selectedOrder.address.street}, {selectedOrder.address.house}</p></div>
                  <div className="flex items-center gap-3 text-slate-500"><Phone/> <p className="text-xs font-bold uppercase">{selectedOrder.address.phone}</p></div>
                  <div className="p-4 bg-slate-50 rounded-2xl text-[10px] font-bold text-slate-400 uppercase leading-relaxed italic border border-slate-100">Ref: {selectedOrder.address.ref}</div>
               </div>
               
               <div className="space-y-4">
                  <h4 className="text-[10px] font-black uppercase text-slate-300 tracking-widest">Artículos en la Orden</h4>
                  {selectedOrder.items.map((item, idx) => (
                    <div key={idx} className="flex gap-4 items-center bg-slate-50 p-3 rounded-2xl">
                       <div className="w-12 h-12 bg-white rounded-xl border p-1 overflow-hidden">
                          <img src={item.images[0]} className="w-full h-full object-cover rounded-lg" />
                       </div>
                       <p className="text-[10px] font-black uppercase flex-1">{item.name} <br/> <span className="text-blue-500">Talla: {item.selectedSize} | Cant: {item.quantity}</span></p>
                    </div>
                  ))}
               </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* MODAL PAGO MANUAL */}
      {manualPay.id && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
          <div className="bg-white p-10 rounded-[3rem] w-full max-w-sm space-y-6">
            <h3 className="text-xl font-black uppercase italic text-center">Registrar Abono</h3>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-4">Monto a abonar (L)</label>
              <input type="number" className="w-full p-5 bg-slate-50 rounded-2xl font-black text-2xl outline-none" value={manualPay.amount} onChange={(e)=>setManualPay({...manualPay, amount: e.target.value})} />
            </div>
            <div className="flex gap-3 pt-4">
              <button onClick={()=>setManualPay({id:null, amount:''})} className="flex-1 py-4 bg-slate-100 rounded-2xl font-black text-xs uppercase">Cancelar</button>
              <button onClick={addPayment} className="flex-1 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase">Guardar Pago</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL RECHAZO */}
      {rejection.id && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
          <div className="bg-white p-10 rounded-[3rem] w-full max-w-md space-y-4">
            <h3 className="text-xl font-black uppercase italic">¿Por qué rechazas este producto?</h3>
            <textarea className="w-full p-5 bg-slate-50 rounded-2xl h-32 outline-none text-sm font-medium" placeholder="Ej: Las fotos están borrosas..." value={rejection.reason} onChange={(e)=>setRejection({...rejection, reason: e.target.value})} />
            <div className="flex gap-3">
              <button onClick={()=>setRejection({id:null, reason:''})} className="flex-1 py-4 bg-slate-100 rounded-2xl font-black text-xs uppercase">Cancelar</button>
              <button onClick={rejectProduct} className="flex-1 py-4 bg-red-500 text-white rounded-2xl font-black text-xs uppercase">Confirmar Rechazo</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

// --- SUB-COMPONENTES UI ---

function TabBtn({ label, icon: Icon, active, count, onClick }) {
  return (
    <button onClick={onClick} className={`px-6 py-3 rounded-full flex items-center gap-3 transition-all relative whitespace-nowrap ${active ? 'bg-white text-slate-900 shadow-xl font-black' : 'text-slate-400 font-bold'}`}>
       <Icon size={18} strokeWidth={active ? 3 : 2} />
       <span className="text-[10px] uppercase tracking-widest">{label}</span>
       {count > 0 && <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-[8px] w-5 h-5 rounded-full flex items-center justify-center border-2 border-white">{count}</span>}
    </button>
  );
}

function StatusBtn({ label, active, onClick }) {
  return (
    <button onClick={onClick} className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${active ? 'bg-slate-900 text-white shadow-md' : 'bg-slate-50 text-slate-400'}`}>
      {label}
    </button>
  );
}

function ConfigInput({ label, val, onChange }) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-black text-slate-400 uppercase ml-4">{label}</label>
      <input type="number" step="0.01" className="w-full p-5 bg-slate-50 rounded-2xl font-black outline-none border border-transparent focus:border-blue-500" value={val} onChange={(e)=>onChange(e.target.value)} />
    </div>
  );
}