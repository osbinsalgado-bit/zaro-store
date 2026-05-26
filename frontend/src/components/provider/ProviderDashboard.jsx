import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext'; // IMPORTAMOS USEAUTH
import { motion, AnimatePresence } from 'framer-motion';
import { Package, UploadCloud, Briefcase } from 'lucide-react';

import { ProductUpload } from './ProductUpload'; 
import { ProviderProducts } from './ProviderProducts'; 

// Ya no pedimos el { user } como prop, lo buscamos nosotros mismos.
export function ProviderDashboard() {
  const [internalTab, setInternalTab] = useState('inventory'); 
  
  // EXTRAEMOS EL USUARIO DIRECTAMENTE DESDE EL CONTEXTO
  const { user } = useAuth();

  // Si el usuario aún no carga, mostramos un mensaje para evitar el error rojo
  if (!user) {
    return <div className="p-20 text-center font-black animate-pulse text-slate-400 uppercase tracking-widest">Autenticando Proveedor...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 mt-4 pb-20 font-sans">
      
      <header className="bg-white p-6 md:p-8 rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
          <h2 className="text-3xl font-black uppercase tracking-tight text-slate-900 flex items-center gap-3">
             <Briefcase className="text-blue-600"/> Mi Oficina Virtual
          </h2>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Gestión de Catálogo y Envíos a Tienda</p>
        </div>

        <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200 w-full md:w-auto">
          <button 
            onClick={() => setInternalTab('inventory')} 
            className={`flex-1 md:flex-none px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${internalTab === 'inventory' ? 'bg-white shadow-sm text-slate-900 border border-slate-200' : 'text-slate-500 hover:bg-slate-200/50'}`}
          >
            <Package size={16} /> Mis Artículos
          </button>
          
          <button 
            onClick={() => setInternalTab('upload')} 
            className={`flex-1 md:flex-none px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${internalTab === 'upload' ? 'bg-blue-600 shadow-sm text-white border border-blue-700' : 'text-slate-500 hover:bg-slate-200/50'}`}
          >
            <UploadCloud size={16} /> Publicar Nuevo
          </button>
        </div>
      </header>

      <AnimatePresence mode="wait">
        {internalTab === 'inventory' && (
          <motion.div key="inv" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            {/* Le pasamos el user ya verificado a los sub-componentes */}
            <ProviderProducts user={user} />
          </motion.div>
        )}

        {internalTab === 'upload' && (
          <motion.div key="up" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <ProductUpload user={user} onSuccess={() => setInternalTab('inventory')} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}