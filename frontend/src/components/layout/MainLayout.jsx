// src/layouts/MainLayout.jsx
import { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, Search, ShoppingBag, X, User, Crown, LayoutDashboard, LogOut, Sparkles, MapPin, Briefcase, Tag } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { db } from '../../firebase/config';
import { doc, onSnapshot } from 'firebase/firestore';

export function MainLayout () {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth(); 
  const { cart } = useCart();
  const navigate = useNavigate();
  
  // ESTADO PARA GUARDAR EL ROL DEL USUARIO
  const [userData, setUserData] = useState(null);

  // Normalizar rol para evitar discrepancias (mayúsculas/minúsculas)
  const userRole = (userData?.role || '').toLowerCase().trim();

  // EFECTO PARA LEER EL ROL DESDE FIREBASE
  useEffect(() => {
    if (!user) {
      setUserData(null);
      return;
    }
    const unsubscribe = onSnapshot(doc(db, 'users', user.uid), (docSnap) => {
      if (docSnap.exists()) setUserData(docSnap.data());
    });
    return () => unsubscribe();
  }, [user]);

  const handleMagicSearchTrigger = (e) => {
    const value = e.target.value.toLowerCase();
    navigate(`/?buscarParam_InaaMagica=${encodeURIComponent(value)}`);
  };

  const cartItemCount = cart.reduce((acc, curr) => acc + curr.quantity, 0);

  const handleLogout = async () => {
    try {
      await logout(); 
      setSidebarOpen(false);
      navigate('/auth', { replace: true });
    } catch (err) {
      console.error("Error cerrando sesión", err);
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen font-sans">
      
      {/* 🔹 HEADER TOP FIXED 🔹 */}
      <header className="sticky top-0 z-[100] bg-white/90 backdrop-blur-md border-b border-slate-100 p-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          
          <button onClick={() => setSidebarOpen(true)} className="p-3 bg-slate-50 text-slate-700 rounded-full hover:bg-slate-100 transition-colors shadow-sm border border-slate-100">
            <Menu size={20} />
          </button>

          <Link to="/" className="text-3xl font-black italic uppercase flex-shrink-0">
            <span className="text-slate-900">ZARO </span><span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-500 to-pink-500">STORE</span>
          </Link>

          {/* BUSCADOR DESKTOP */}
          <div className="hidden md:flex flex-1 max-w-xl mx-8 relative">
             <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-400" size={18}/>
             <input type="text" onChange={handleMagicSearchTrigger} placeholder="Buscar productos, categorías..." className="w-full bg-slate-50 border border-slate-100 py-3.5 pl-12 pr-4 rounded-full font-bold text-xs text-slate-700 outline-none focus:ring-2 ring-purple-300 transition-all placeholder-slate-400"/>
          </div>

          <Link to="/cart" className="p-3 bg-white text-slate-800 rounded-full relative shadow-sm border border-slate-100 hover:scale-105 hover:shadow-purple-500/20 transition-all">
            <ShoppingBag size={20} />
            {cartItemCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-gradient-to-tr from-purple-500 to-pink-500 text-white text-[10px] min-w-5 min-h-5 px-1 flex items-center justify-center rounded-full font-black shadow-sm">
                {cartItemCount}
              </span>
            )}
          </Link>

        </div>
      </header>

      <main className="max-w-7xl mx-auto min-h-[70vh]">
        <Outlet /> 
      </main>

      {/* 🔹 SIDEBAR LATERAL 🔹 */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
              onClick={() => setSidebarOpen(false)} 
              className="fixed inset-0 bg-slate-900/30 backdrop-blur-sm z-[200]" 
            />

            <motion.aside 
              initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }} transition={{ type: "spring", damping: 25 }} 
              className="fixed top-0 left-0 bottom-0 w-[85%] max-w-xs bg-white z-[210] flex flex-col p-6 rounded-r-[3rem] shadow-2xl border-r border-slate-100"
            >
              <div className="flex justify-between items-center mb-8 border-b border-slate-50 pb-4">
                <div className="flex gap-2 items-center text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 font-black italic tracking-widest text-[11px] uppercase">
                  Bienvenido(a) <Sparkles size={14} className="text-purple-400"/>
                </div>
                <button onClick={() => setSidebarOpen(false)} className="p-2 text-slate-400 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 rounded-full transition-colors"><X size={18}/></button>
              </div>

              <nav className="flex flex-col gap-2 flex-1 overflow-y-auto pr-2 scrollbar-hide">
                <SidebarLink to="/" icon={Search} text="Ir a la Tienda" close={() => setSidebarOpen(false)}/>
                <SidebarLink to="/profile" icon={User} text="Mi Perfil" close={() => setSidebarOpen(false)}/>
                <SidebarLink to="/cart" icon={ShoppingBag} text="Mi Carrito de Compras" close={() => setSidebarOpen(false)}/>
                <SidebarLink to="/profile?tab=direcciones" icon={MapPin} text="Mis Direcciones" close={() => setSidebarOpen(false)}/>
                
                {/* 🔴 VALIDACIÓN DE ROLES: Solo aparecen si el usuario tiene los permisos 🔴 */}
                {(userRole === 'admin' || userRole === 'proveedor' || userRole === 'vendedor' || userRole === 'empleado') && (
                  <div className="mt-8 border-t border-slate-100 pt-6 space-y-2">
                    <p className="text-[8px] font-black uppercase text-slate-400 tracking-[0.3em] px-4 pb-2">Administración</p>
                    
                    {userRole === 'admin' && (
                      <SidebarLink to="/admin" icon={LayoutDashboard} text="Panel de Control General" highlight close={() => setSidebarOpen(false)}/>
                    )}

                    {userRole === 'proveedor' && (
                      <SidebarLink to="/provider" icon={Briefcase} text="Gestión de Proveedor" highlight close={() => setSidebarOpen(false)}/>
                    )}

                    {(userRole === 'vendedor' || userRole === 'empleado') && (
                      <SidebarLink to="/seller" icon={Tag} text="Panel de Ventas / Afiliado" highlight close={() => setSidebarOpen(false)}/>
                    )}
                  </div>
                )}
              </nav>

              <div className="pt-4 border-t border-slate-100 mt-auto">
                <button onClick={handleLogout} className="w-full py-4 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center gap-2 font-black text-[10px] uppercase tracking-[0.2em] hover:bg-red-500 hover:text-white transition-colors shadow-sm">
                  <LogOut size={16}/> Cerrar Sesión
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

    </div>
  );
}

function SidebarLink({ to, icon: Icon, text, close, highlight = false }) {
  const navigate = useNavigate();

  return (
    <button 
      onClick={() => {
        navigate(to);
        if (typeof close === 'function') close();
      }} 
      className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all ${highlight ? 'bg-gradient-to-r from-slate-800 to-slate-900 text-white shadow-lg' : 'bg-transparent text-slate-700 hover:bg-slate-100'}`}
    >
      <Icon size={18} className="shrink-0" />
      <span className="font-bold text-[11px] md:text-xs uppercase tracking-tight text-left">{text}</span>
    </button>
  );
}