import React, { useState, useEffect } from 'react';
import { ShoppingBag, User, Flame, LayoutGrid, ShieldCheck, LogIn, Briefcase, Tag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { db } from '../firebase/config';
import { doc, onSnapshot } from 'firebase/firestore';
import { useNavigate, useLocation } from 'react-router-dom';

import { Store } from '../components/home/Store';
import { Discounts } from '../components/home/Discounts';
import { AdminDashboard } from '../components/admin/AdminDashboard';
import { ProviderDashboard } from '../components/provider/ProviderDashboard';
import { SellerDashboard } from '../components/seller/SellerDashboard';

export function Home() {
  const { user, loading } = useAuth();
  const { cart } = useCart();
  const navigate = useNavigate();
  const location = useLocation(); // Esto forzará la lectura de la URL
  
  const [activeTab, setActiveTab] = useState('store');
  const [userData, setUserData] = useState(null);
  const [isVerifyingRole, setIsVerifyingRole] = useState(true);

  // 1. ESCUCHAR LOS CAMBIOS EXACTOS DE LA URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tabFromUrl = params.get('tab');
    
    if (tabFromUrl) {
      setActiveTab(tabFromUrl);
    } else {
      setActiveTab('store');
    }
  }, [location.search]);

  // 2. OBTENER EL ROL DEL USUARIO
  useEffect(() => {
    if (!user) {
      setUserData(null);
      setIsVerifyingRole(false);
      return;
    }
    const unsub = onSnapshot(doc(db, 'users', user.uid), (snap) => {
      if(snap.exists()) {
         setUserData(snap.data());
      }
      setIsVerifyingRole(false);
    });
    return () => unsub();
  }, [user]);

  const handleTabChange = (tab) => {
    navigate(`/?tab=${tab}`);
  };

  // MIENTRAS CARGA LA BASE DE DATOS
  if (user && isVerifyingRole) {
     return <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-400 font-black tracking-widest uppercase animate-pulse">Sincronizando Sistema Zaro...</div>;
  }

  // VALIDACIÓN DE ROLES LIMPIA
  const userRole = (userData?.role || '').toLowerCase().trim();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-24 font-sans">
      
      {/* HEADER PRINCIPAL */}
      <header className="p-4 flex justify-between items-center sticky top-0 bg-white/95 backdrop-blur-xl z-50 border-b border-slate-100 shadow-sm">
        <h1 onClick={() => handleTabChange('store')} className="text-2xl font-black cursor-pointer bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent italic uppercase tracking-tighter">
          ZARO
        </h1>
        
        <div className="flex gap-3 items-center">
          {userRole === 'admin' && (
            <button onClick={() => handleTabChange('admin')} className={`px-4 py-2 rounded-xl shadow-sm text-xs font-black uppercase flex gap-2 items-center transition-all ${activeTab === 'admin' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
              <ShieldCheck size={16} /> <span className="hidden md:inline">Admin</span>
            </button>
          )}
          
          {userRole === 'proveedor' && (
            <button onClick={() => handleTabChange('proveedor')} className={`px-4 py-2 rounded-xl shadow-sm text-xs font-black uppercase flex gap-2 items-center transition-all ${activeTab === 'proveedor' ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-600 hover:bg-blue-100'}`}>
              <Briefcase size={16} /> <span className="hidden md:inline">Mi Panel</span>
            </button>
          )}

          {(userRole === 'vendedor' || userRole === 'empleado') && (
            <button onClick={() => handleTabChange('vendedor')} className={`px-4 py-2 rounded-xl shadow-sm text-xs font-black uppercase flex gap-2 items-center transition-all ${activeTab === 'vendedor' ? 'bg-pink-500 text-white' : 'bg-pink-50 text-pink-500 hover:bg-pink-100'}`}>
              <Tag size={16} /> <span className="hidden md:inline">Ventas</span>
            </button>
          )}

          <button onClick={() => navigate('/cart')} className="relative p-2 bg-white border border-slate-100 rounded-xl text-slate-500 hover:text-slate-900 shadow-sm transition-colors">
            <ShoppingBag size={20} />
            {cart.length > 0 && <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center border-2 border-white shadow-sm">{cart.length}</span>}
          </button>
        </div>
      </header>

      <AnimatePresence mode="wait">
        <motion.main key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-3 max-w-7xl mx-auto">
          
          {/* VISTAS PÚBLICAS */}
          {activeTab === 'store' && <Store />}
          {activeTab === 'discounts' && <Discounts />}
          
          {/* VISTAS PROTEGIDAS Y PANELES */}
          {activeTab === 'admin' && (
             userRole === 'admin' ? <AdminDashboard /> : <AccessDenied />
          )}
          
          {activeTab === 'proveedor' && (
             userRole === 'proveedor' ? <ProviderDashboard user={user} /> : <AccessDenied />
          )}
          
          {activeTab === 'vendedor' && (
             (userRole === 'vendedor' || userRole === 'empleado') ? <SellerDashboard user={user} /> : <AccessDenied />
          )}
        
        </motion.main>
      </AnimatePresence>

      {/* BARRA INFERIOR DE NAVEGACIÓN */}
      <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[92%] max-w-sm bg-white/95 backdrop-blur-lg border border-slate-200 p-2.5 flex justify-around items-center z-50 rounded-full shadow-2xl shadow-slate-200/50">
        <NavButton icon={LayoutGrid} active={activeTab === 'store'} onClick={() => handleTabChange('store')} />
        <NavButton icon={Flame} active={activeTab === 'discounts'} onClick={() => handleTabChange('discounts')} />
        <button onClick={() => navigate('/profile')} className="transition-all p-3 rounded-full text-slate-400 hover:bg-slate-50">
          <User size={20} strokeWidth={2} />
        </button>
      </nav>
    </div>
  );
}

// COMPONENTE DE ACCESO DENEGADO (Para evitar la pantalla en blanco)
function AccessDenied() {
  return (
    <div className="p-20 text-center bg-white rounded-[3rem] border border-slate-100 shadow-sm mt-10">
      <ShieldCheck size={60} className="mx-auto text-red-300 mb-4"/>
      <h2 className="text-xl font-black uppercase text-slate-800">Acceso Restringido</h2>
      <p className="text-sm font-medium text-slate-500 mt-2">No tienes los permisos necesarios para ver este panel corporativo.</p>
    </div>
  )
}

function NavButton({ icon: Icon, active, onClick }) {
  return (
    <button onClick={onClick} className={`transition-all p-3 rounded-full ${active ? 'bg-slate-900 text-white scale-105 shadow-md' : 'text-slate-400 hover:bg-slate-50'}`}>
      <Icon size={20} strokeWidth={active ? 2.5 : 2} />
    </button>
  );
}