import React, { useState, useEffect } from 'react';
import { ShoppingBag, User, Search, Flame, LayoutGrid, ShieldCheck, UploadCloud, Package } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { db } from '../firebase/config';
import { doc, onSnapshot } from 'firebase/firestore';

// IMPORTACIÓN DE MÓDULOS
import { Store } from '../components/home/Store';
import { Discounts } from '../components/home/Discounts';
import { Profile } from '../components/home/Profile';
import { CartView } from '../components/home/CartView';
import { AdminDashboard } from '../components/admin/AdminDashboard';
import { ProductUpload } from '../components/provider/ProductUpload';
import { ProviderProducts } from '../components/provider/ProviderProducts';

export function Home() {
  const { user } = useAuth();
  const { cart } = useCart();
  const [activeTab, setActiveTab] = useState('store');
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    if (!user) return;
    const unsub = onSnapshot(doc(db, 'users', user.uid), (snap) => {
      setUserData(snap.data());
    });
    return () => unsub();
  }, [user]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-24 font-sans">
      <header className="p-3 flex justify-between items-center sticky top-0 bg-white/90 backdrop-blur-md z-50 border-b border-slate-100 px-4 shadow-sm">
        <h1 className="text-xl font-black bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent italic uppercase tracking-tighter">
          ZARO STORE
        </h1>
        <div className="flex gap-2">
          {userData?.role === 'admin' && (
            <button onClick={() => setActiveTab('admin')} className={`p-2 rounded-xl shadow-sm ${activeTab === 'admin' ? 'bg-slate-900 text-white' : 'bg-white text-slate-400'}`}>
              <ShieldCheck size={18} />
            </button>
          )}
          {userData?.role === 'proveedor' && (
            <>
              <button onClick={() => setActiveTab('my_products')} className={`p-2 rounded-xl shadow-sm ${activeTab === 'my_products' ? 'bg-slate-900 text-white' : 'bg-white text-slate-400'}`}>
                <Package size={18} />
              </button>
              <button onClick={() => setActiveTab('upload')} className={`p-2 rounded-xl shadow-sm ${activeTab === 'upload' ? 'bg-blue-600 text-white' : 'bg-white text-slate-400'}`}>
                <UploadCloud size={18} />
              </button>
            </>
          )}
          <button onClick={() => setActiveTab('cart')} className="relative p-2 bg-white rounded-xl text-slate-400 shadow-sm">
            <ShoppingBag size={18} />
            {cart.length > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[8px] font-black rounded-full flex items-center justify-center border-2 border-white">{cart.length}</span>}
          </button>
        </div>
      </header>

      <AnimatePresence mode="wait">
        <motion.main key={activeTab} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="p-3 max-w-7xl mx-auto">
          {activeTab === 'store' && <Store />}
          {activeTab === 'discounts' && <Discounts />}
          {activeTab === 'profile' && <Profile />}
          {activeTab === 'cart' && <CartView />}
          {activeTab === 'orders' && <Profile initialView="orders" />}
          {activeTab === 'admin' && userData?.role === 'admin' && <AdminDashboard />}
          {activeTab === 'upload' && userData?.role === 'proveedor' && <ProductUpload user={user} />}
          {activeTab === 'my_products' && userData?.role === 'proveedor' && <ProviderProducts user={user} />}
        </motion.main>
      </AnimatePresence>

      <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[92%] max-w-md bg-white/90 backdrop-blur-lg border border-slate-200 p-2 flex justify-around items-center z-50 rounded-[2rem] shadow-2xl shadow-slate-200">
        <NavButton icon={LayoutGrid} active={activeTab === 'store'} onClick={() => setActiveTab('store')} />
        <NavButton icon={Flame} active={activeTab === 'discounts'} onClick={() => setActiveTab('discounts')} />
        <NavButton icon={Package} active={activeTab === 'orders'} onClick={() => setActiveTab('orders')} />
        <NavButton icon={User} active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} />
      </nav>
    </div>
  );
}

function NavButton({ icon: Icon, active, onClick }) {
  return (
    <button onClick={onClick} className={`transition-all ${active ? 'text-blue-600 scale-110' : 'text-slate-300'}`}>
      <Icon size={24} strokeWidth={active ? 3 : 2} />
    </button>
  );
}