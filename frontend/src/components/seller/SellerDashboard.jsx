import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext'; // IMPORTAMOS USEAUTH
import { db } from '../../firebase/config';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { Tag, TrendingUp, Users, Share2, Copy, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

// Quitamos el prop { user } y lo declaramos nosotros adentro
export function SellerDashboard() {
  const [myCoupon, setMyCoupon] = useState(null);
  const [copied, setCopied] = useState(false);
  const { user } = useAuth(); // EXTRAEMOS EL USUARIO DIRECTO

  useEffect(() => {
    // Si no hay usuario, no hacer nada para evitar que colapse
    if (!user) return;

    // Buscar el cupón donde el owner_id sea igual al ID de este usuario
    const q = query(collection(db, 'coupons'), where('owner_id', '==', user.uid));
    const unsub = onSnapshot(q, (snap) => {
      if (!snap.empty) {
        setMyCoupon({ id: snap.docs[0].id, ...snap.docs[0].data() });
      }
    });
    return () => unsub();
  }, [user]); // Agregamos user a las dependencias

  const copyToClipboard = () => {
    if (!myCoupon) return;
    navigator.clipboard.writeText(myCoupon.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareWhatsApp = () => {
    if (!myCoupon) return;
    const msg = `¡Hola! Compra en Zaro Store usando mi código de descuento *${myCoupon.code}* y obtén un ${myCoupon.discount}% de descuento en tu compra total. 🛒✨`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`, '_blank');
  };

  // Pantalla de carga si user no existe
  if (!user) {
    return <div className="p-20 text-center font-black animate-pulse text-slate-400 uppercase tracking-widest">Autenticando Ventas...</div>;
  }

  if (!myCoupon) {
    return (
      <div className="p-20 text-center bg-white rounded-[3rem] border border-slate-100 shadow-sm mt-8">
        <TrendingUp size={60} className="text-slate-200 mx-auto mb-4" />
        <h2 className="text-xl font-black uppercase text-slate-800">Panel de Ventas</h2>
        <p className="text-sm text-slate-500 mt-2">Aún no se te ha asignado un código de vendedor. Contacta a un administrador.</p>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto space-y-8 mt-4 pb-20 font-sans">
      
      {/* CABECERA */}
      <header className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-8 md:p-10 rounded-[3rem] shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-10 opacity-10 pointer-events-none">
          <Tag size={150} />
        </div>
        
        <div className="relative z-10">
          <h2 className="text-3xl md:text-4xl font-black italic uppercase tracking-tighter mb-1">Programa de Afiliados</h2>
          <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Comparte tu código y genera ventas</p>
        </div>
      </header>

      <div className="grid md:grid-cols-2 gap-6">
        
        {/* TARJETA DEL CÓDIGO */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-lg shadow-pink-500/5 text-center flex flex-col items-center justify-center">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Tu Código de Descuento Oficial</p>
          
          <div className="bg-pink-50 border-2 border-dashed border-pink-200 text-pink-600 px-8 py-6 rounded-3xl w-full mb-6 relative group">
            <h1 className="text-5xl font-black uppercase tracking-widest">{myCoupon.code}</h1>
            <p className="text-xs font-bold mt-2 text-pink-400 uppercase">Da {myCoupon.discount}% de descuento al cliente</p>
          </div>

          <div className="flex gap-3 w-full">
            <button onClick={copyToClipboard} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-4 rounded-2xl font-black text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2">
              {copied ? <><CheckCircle size={16} className="text-green-500"/> Copiado</> : <><Copy size={16}/> Copiar</>}
            </button>
            <button onClick={shareWhatsApp} className="flex-1 bg-green-500 hover:bg-green-600 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2 shadow-lg shadow-green-500/20">
              <Share2 size={16}/> Compartir
            </button>
          </div>
        </div>

        {/* TARJETA DE RENDIMIENTO */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl space-y-6">
          <h3 className="font-black uppercase text-slate-800 italic border-b border-slate-100 pb-4 flex items-center gap-2">
            <TrendingUp className="text-blue-500"/> Rendimiento de Ventas
          </h3>

          <div className="flex items-center gap-6 bg-slate-50 p-6 rounded-3xl border border-slate-100">
            <div className="bg-blue-100 p-4 rounded-2xl text-blue-600">
              <Users size={32} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Veces Utilizado</p>
              <p className="text-4xl font-black text-slate-800 italic">{myCoupon.usage_count || 0}</p>
            </div>
          </div>

          <div className="bg-slate-900 text-white p-6 rounded-3xl space-y-2 relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -mr-10 -mt-10"></div>
             <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Estatus de la Cuenta</p>
             <p className="text-lg font-black italic text-green-400 uppercase flex items-center gap-2"><CheckCircle size={18}/> Activo y Comisionando</p>
             <p className="text-xs text-slate-400 mt-2 font-medium">Sigue compartiendo tu código. Los administradores revisarán tus métricas para el pago de tus comisiones o beneficios.</p>
          </div>
        </div>

      </div>
    </motion.div>
  );
}