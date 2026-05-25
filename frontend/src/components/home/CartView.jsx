import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trash2, Plus, Minus, Check, ChevronRight, MapPin, CreditCard, Banknote, PackageCheck, AlertCircle, ArrowLeft, Send, Tag, Phone } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../firebase/config';
import { collection, addDoc, serverTimestamp, doc, onSnapshot, updateDoc, query, where, getDocs, writeBatch, getDoc } from 'firebase/firestore';

export function CartView() {
  const { cart, removeFromCart, updateQuantity, clearCart } = useCart();
  const { user } = useAuth();

  const [step, setStep] = useState('review');
  const [userData, setUserData] = useState(null);
  const [selectedAddrId, setSelectedAddrId] = useState(null);
  const [rules, setRules] = useState({ shipping: 120, isv_rate: 0.15 });
  const [discountCode, setDiscountCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const [formData, setFormData] = useState({ paymentMethod: 'Efectivo', paymentSplit: '100' });
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);

  // Cargar datos de usuario y reglas del admin
  useEffect(() => {
    if (!user) return;
    onSnapshot(doc(db, 'users', user.uid), (snap) => setUserData(snap.data()));
    onSnapshot(doc(db, 'system_rules', 'pricing'), (snap) => {
      if (snap.exists()) setRules({ shipping: snap.data().shipping_cost || 120, isv_rate: snap.data().isv_rate || 0.15 });
    });
  }, [user]);

  const selectedItems = cart;
  const subtotal = cart.reduce((acc, i) => acc + (i.public_price * i.quantity), 0);
  const isv = subtotal * rules.isv_rate;
  
  // Lógica de descuento
  let discountAmount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.type === 'fixed') discountAmount = appliedCoupon.value;
    else discountAmount = subtotal * (appliedCoupon.value / 100);
  }

  const total = subtotal + isv + rules.shipping - discountAmount;

  const validateCoupon = async () => {
    const q = query(collection(db, 'coupons'), where('code', '==', couponInput.toUpperCase()), where('active', '==', true));
    const snap = await getDocs(q);
    
    if (snap.empty) return alert("Cupón no válido");
    const data = snap.docs[0].data();
    
    if (subtotal < data.minPurchase) return alert(`Mínimo L ${data.minPurchase} para usar este cupón`);
    
    setAppliedCoupon(data);
    alert("Cupón Aplicado!");
  };

  const handleFinishOrder = async () => {
    const address = userData.addresses.find(a => a.id === selectedAddrId);
    if (!address) return alert("Selecciona una dirección");

    const batch = writeBatch(db);
    
    try {
      // 1. Crear el Pedido
      const orderRef = doc(collection(db, 'orders'));
      batch.set(orderRef, {
        client_id: user.uid,
        client_email: user.email,
        items: cart,
        subtotal, // El subtotal real sin ISV
        isv,
        envio: rules.shipping,
        descuento: discountAmount,
        total,
        address,
        status: 'Solicitado',
        payment_status: 'Pendiente',
        created_at: serverTimestamp(),
        order_code: `ZA-${Math.floor(1000 + Math.random() * 9000)}`
      });

      // 2. Reducir Inventario
      for (const item of cart) {
        const productRef = doc(db, 'products', item.id);
        const prodSnap = await getDoc(productRef);
        const currentInventory = prodSnap.data().inventory;
        
        const updatedInventory = currentInventory.map(inv => {
          if (inv.size === item.selectedSize) {
            return { ...inv, qty: inv.qty - item.quantity };
          }
          return inv;
        });

        batch.update(productRef, { inventory: updatedInventory });
      }

      await batch.commit();
      clearCart();
      setStep('success');
    } catch (err) { alert("Error al procesar inventario"); }
  };

  // --- VISTAS ---

  // 1. REVISIÓN DE PRODUCTOS
  if (step === 'review') return (
    <div className="max-w-xl mx-auto space-y-4 pb-20 px-2 animate-in fade-in">
      <div className="flex justify-between items-center px-2">
        <h2 className="text-xl font-black uppercase italic tracking-tighter">Mi Carrito</h2>
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{cart.length} ITEMS</span>
      </div>

      <div className="space-y-2">
        {cart.map(item => (
          <div key={`${item.id}-${item.selectedSize}`} className="bg-white p-3 rounded-[1.5rem] border border-slate-50 flex items-center gap-3 shadow-sm">
            <div className="w-12 h-12 bg-slate-100 rounded-xl overflow-hidden flex-shrink-0">
              <img src={item.images?.[0]} className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-black uppercase text-[10px] truncate leading-tight">{item.name}</h4>
              <p className="text-[8px] font-bold text-blue-500 uppercase">T: {item.selectedSize}</p>
              <div className="flex items-center gap-3 mt-1">
                <div className="flex items-center bg-slate-50 rounded-lg scale-90">
                  <button onClick={() => updateQuantity(item.id, item.selectedSize, -1, 99)} className="p-1 text-slate-400"><Minus size={10}/></button>
                  <span className="font-black text-[10px] w-4 text-center">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.id, item.selectedSize, 1, 99)} className="p-1 text-slate-900"><Plus size={10}/></button>
                </div>
                <button onClick={() => removeFromCart(item.id, item.selectedSize)} className="text-slate-200"><Trash2 size={12}/></button>
              </div>
            </div>
            <p className="font-black text-xs text-slate-900">L {(item.public_price * item.quantity).toFixed(0)}</p>
          </div>
        ))}
      </div>

      {/* Input de Cupón Compacto */}
      <div className="flex gap-2 bg-white p-2 rounded-2xl border border-slate-100">
        <input 
          placeholder="CÓDIGO DE DESCUENTO" 
          className="flex-1 bg-transparent text-[10px] font-black uppercase px-2 outline-none"
          value={couponInput}
          onChange={e => setCouponInput(e.target.value)}
        />
        <button onClick={validateCoupon} className="px-4 py-2 bg-slate-100 rounded-xl text-[9px] font-black uppercase">Aplicar</button>
      </div>

      {/* Factura Desglosada - Google 2027 Style */}
      <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 space-y-2.5">
        <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase">
          <span>Subtotal</span>
          <span>L {subtotal.toFixed(0)}</span>
        </div>
        <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase">
          <span>ISV (15%)</span>
          <span>L {isv.toFixed(0)}</span>
        </div>
        <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase">
          <span>Envío</span>
          <span>L {rules.shipping.toFixed(0)}</span>
        </div>
        {appliedCoupon && (
          <div className="flex justify-between text-[10px] font-black text-green-500 uppercase italic">
            <span>Descuento ({appliedCoupon.code})</span>
            <span>- L {discountAmount.toFixed(0)}</span>
          </div>
        )}
        <div className="flex justify-between items-center pt-3 border-t border-slate-50">
          <span className="text-lg font-black italic uppercase tracking-tighter text-slate-900">Total Final</span>
          <span className="text-xl font-black text-blue-600">L {total.toFixed(0)}</span>
        </div>
        <button onClick={() => setStep('checkout')} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-slate-200">
          Proceder al Pago
        </button>
      </div>
    </div>
  );

  // 2. FORMULARIO DE PAGO Y ENVÍO
  if (step === 'checkout') return (
    <div className="max-w-xl mx-auto space-y-4 pb-20 px-2">
      <button onClick={() => setStep('review')} className="flex items-center gap-2 text-slate-400 font-bold text-[9px] uppercase"><ArrowLeft size={12}/> Volver</button>

      <div className="bg-white p-5 rounded-[2rem] border border-slate-100 space-y-3">
        <h3 className="text-xs font-black uppercase italic tracking-widest text-slate-400">¿Dónde entregamos?</h3>
        <div className="space-y-2">
          {userData?.addresses?.map(addr => (
            <div 
              key={addr.id} 
              onClick={() => setSelectedAddrId(addr.id)}
              className={`p-3 rounded-xl border-2 transition-all cursor-pointer flex justify-between items-center ${selectedAddrId === addr.id ? 'border-blue-500 bg-blue-50':'border-slate-100'}`}
            >
              <div className="text-[10px] font-bold uppercase truncate w-4/5">
                {addr.city}, {addr.street}, {addr.house}
              </div>
              {selectedAddrId === addr.id && <Check size={14} className="text-blue-500"/>}
            </div>
          ))}
          <button onClick={() => window.location.href='/profile'} className="text-[9px] font-black text-blue-500 uppercase">+ Nueva dirección en perfil</button>
        </div>
      </div>

      <div className="bg-white p-5 rounded-[2rem] border border-slate-100 space-y-4">
        <div className="flex justify-between text-[11px] font-bold text-slate-400 uppercase">
          <span>Subtotal</span>
          <span className="text-slate-900 font-black">L {subtotal.toFixed(0)}</span>
        </div>
        <div className="flex justify-between text-[11px] font-bold text-slate-400 uppercase">
          <span>ISV ({(rules.isv_rate * 100).toFixed(0)}%)</span>
          <span className="text-slate-900 font-black">L {isv.toFixed(0)}</span>
        </div>
        <div className="flex justify-between text-[11px] font-bold text-slate-400 uppercase">
          <span>Envío</span>
          <span className="text-slate-900 font-black">L {rules.shipping.toFixed(0)}</span>
        </div>
        <div className="flex justify-between items-center pt-2 border-t border-slate-50">
          <span className="text-lg font-black italic uppercase tracking-tighter">TOTAL</span>
          <span className="text-xl font-black text-blue-600">L {total.toFixed(0)}</span>
        </div>
        <button onClick={handleFinishOrder} className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest">
          Confirmar Pedido
        </button>
      </div>
    </div>
  );

  // 3. PANTALLA DE PROCESAMIENTO
  if (step === 'processing') return (
    <div className="h-[60vh] flex flex-col items-center justify-center space-y-6">
      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full shadow-2xl shadow-blue-100" />
      <p className="text-xs font-black text-slate-400 uppercase tracking-[0.4em] animate-pulse">Generando tu factura única...</p>
    </div>
  );

  if (step === 'success') return <div className="text-center py-20 px-4 space-y-4">
    <div className="w-16 h-16 bg-green-500 text-white rounded-full flex items-center justify-center mx-auto shadow-xl"><PackageCheck size={32}/></div>
    <h2 className="text-2xl font-black uppercase italic">¡Pedido Creado!</h2>
    <p className="text-xs text-slate-400 font-bold uppercase">Sigue tu pedido en la pestaña "Pedidos".</p>
    <button onClick={() => window.location.reload()} className="px-10 py-4 bg-slate-900 text-white rounded-xl font-black text-[10px] uppercase">Entendido</button>
  </div>;
}