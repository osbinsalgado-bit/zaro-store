import { useState } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, Search, ShoppingBag, X, User, Crown, LayoutDashboard, LogOut, Sparkles, MapPin } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

export function MainLayout () {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { logout } = useAuth(); // Importamos logout nativo del contexto
  const { cart } = useCart();
  const navigate = useNavigate();

  const handleMagicSearchTrigger = (e) => {
    const value = e.target.value.toLowerCase();
    navigate(`/?buscarParam_InaaMagica=${encodeURIComponent(value)}`);
  };

  // Contador real de artículos en bolsa (Suma cantidades, no solo items distintos)
  const cartItemCount = cart.reduce((acc, curr) => acc + curr.quantity, 0);

  // LOGOUT FLUIDO Y REDIRECCIÓN
  const handleLogout = async () => {
    try {
      await logout(); // Cierra Firebase Auth y limpia cache local si tienes
      setSidebarOpen(false);
      navigate('/auth', { replace: true });
    } catch (err) {
      console.error("Error saliendo", err);
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen font-sans">
      
      {/* 🔹 HEADER TOP FIXED (SIEMPRE ARRIBA) 🔹 */}
      <header className="sticky top-0 z-[100] bg-white/90 backdrop-blur-md border-b border-slate-100 p-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          
          <button onClick={() => setSidebarOpen(true)} className="p-3 bg-slate-50 text-slate-700 rounded-full hover:bg-slate-100 transition-colors shadow-sm border border-slate-100">
            <Menu size={20} />
          </button>

          <Link to="/" className="text-3xl font-black italic uppercase flex-shrink-0">
            <span className="text-slate-900">ZORA </span><span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-500 to-pink-500">STORE</span>
          </Link>

          {/* BUSCADOR DESKTOP */}
          <div className="hidden md:flex flex-1 max-w-xl mx-8 relative">
             <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-400" size={18}/>
             <input type="text" onChange={handleMagicSearchTrigger} placeholder="Búsqueda Zora... cosméticos, prendas" className="w-full bg-slate-50 border border-slate-100 py-3.5 pl-12 pr-4 rounded-full font-bold text-xs text-slate-700 outline-none focus:ring-2 ring-purple-300 transition-all"/>
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

      {/* BUSCADOR MOBILE FLOTANTE */}
      <div className="p-4 md:hidden">
        <div className="relative group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-purple-400" size={18}/>
          <input type="text" onChange={handleMagicSearchTrigger} placeholder="¿Qué andas buscando?" className="w-full bg-white shadow-sm shadow-blue-900/5 py-4 pl-12 pr-4 rounded-[1.5rem] font-bold text-[11px] outline-none border border-white focus:border-purple-200 transition-all text-slate-700 placeholder:text-slate-400"/>
        </div>
      </div>

      {/* ÁREA CENTRAL DINÁMICA (Aquí el Router dibuja Tienda o Perfil) */}
      <main className="max-w-7xl mx-auto min-h-[70vh]">
        <Outlet /> 
      </main>

      {/* 🔹 SIDEBAR MAGICO Y FLUÍDO 🔹 */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            {/* FONDO DESENFOCADO DEL PANEL */}
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
              onClick={() => setSidebarOpen(false)} 
              className="fixed inset-0 bg-slate-900/30 backdrop-blur-sm z-[200]" 
            />

            {/* PANEL BLANCO REDONDEADO IZQUIERDA */}
            <motion.aside 
              initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }} transition={{ type: "spring", damping: 25 }} 
              className="fixed top-0 left-0 bottom-0 w-[85%] max-w-xs bg-white z-[210] flex flex-col p-6 rounded-r-[3rem] shadow-2xl border-r border-slate-100"
            >
              <div className="flex justify-between items-center mb-8 border-b border-slate-50 pb-4">
                <div className="flex gap-2 items-center text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 font-black italic tracking-widest text-[11px] uppercase">
                  Bienvenido(a) a Zora <Sparkles size={14} className="text-purple-400"/>
                </div>
                <button onClick={() => setSidebarOpen(false)} className="p-2 text-slate-400 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 rounded-full transition-colors"><X size={18}/></button>
              </div>

              {/* LISTA DE ENLACES DEL MENÚ LATERAL */}
              <nav className="flex flex-col gap-2 flex-1 overflow-y-auto pr-2 scrollbar-hide">
                <SidebarLink to="/" icon={Search} text="Ir a la Tienda" close={() => setSidebarOpen(false)}/>
                <SidebarLink to="/profile" icon={User} text="Mi Perfil" close={() => setSidebarOpen(false)}/>
                <SidebarLink to="/cart" icon={ShoppingBag} text="Mi Carrito / Bolsa" close={() => setSidebarOpen(false)}/>
                <SidebarLink to="/profile" icon={MapPin} text="Direcciones" close={() => setSidebarOpen(false)}/>
                
                {/* 🔴 Aquí es donde mostramos secciones de VENDEDOR Y ADMIN 🔴
                    Lo dejamos estructurado. Se habilita con logicas que programaremos 
                    en Context según Role o base de datos.
                */}
                <div className="mt-8 border-t border-slate-100 pt-6 space-y-2">
                  <p className="text-[8px] font-black uppercase text-slate-400 tracking-[0.3em] px-4 pb-2">Secciones Especiales</p>
                  
                  {/* Este es de ejemplo de los VIP (Podría ser validado así: si role==='vendedor') */}
                  <SidebarLink to="/zora-productions" icon={Crown} text="Zora Productions" highlight close={() => setSidebarOpen(false)}/>
                  <SidebarLink to="/admin" icon={LayoutDashboard} text="Zora Control Base" close={() => setSidebarOpen(false)}/>
                </div>
              </nav>

              {/* BOTÓN ANCLADO CERRAR SESIÓN (AL FONDO COMO LO PEDISTE) */}
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

// 🔸 Enlace re-utilizable ultra estilizado (Efectos Inaa / Modernos) 🔸
function SidebarLink({ to, icon: Icon, text, close, highlight = false }) {
  return (
    <Link to={to} onClick={close} className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all ${highlight ? 'bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 text-white shadow-xl shadow-purple-500/20' : 'bg-transparent text-slate-700 hover:bg-purple-50 hover:text-purple-700'}`}>
      <Icon size={18} />
      <span className="font-black text-[11px] md:text-xs uppercase italic tracking-tighter">{text}</span>
    </Link>
  );
}