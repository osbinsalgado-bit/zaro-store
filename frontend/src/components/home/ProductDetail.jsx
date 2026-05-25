import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Check, ShoppingBag } from 'lucide-react';
import { useCart } from '../../context/CartContext';

export function ProductDetail({ product, onClose }) {
  const [currentImg, setCurrentImg] = useState(0);
  const [selectedSize, setSelectedSize] = useState(null);
  const { addToCart } = useCart();

  const handleAdd = () => {
    if (!selectedSize) return alert("Selecciona una talla");
    addToCart(product, selectedSize.size, 1);
    onClose();
  };

  return (
    <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} className="fixed inset-0 bg-white z-[200] overflow-y-auto">
      {/* HEADER DE NAVEGACIÓN */}
      <nav className="p-4 flex justify-between items-center sticky top-0 bg-white/90 backdrop-blur-md z-10 border-b border-slate-100">
        <button onClick={onClose} className="p-2 bg-slate-50 rounded-full"><ChevronLeft size={20}/></button>
        <h2 className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Detalles</h2>
        <div className="w-8"></div>
      </nav>

      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-6 p-4 md:p-8 pb-24">
        {/* IMÁGENES - OPTIMIZADAS PARA MOBILE */}
        <div className="space-y-3">
           <div className="aspect-square rounded-[2rem] bg-slate-50 overflow-hidden relative group">
              <img src={product.images[currentImg]} className="w-full h-full object-cover transition-transform duration-700" alt=""/>
              
              <button onClick={() => setCurrentImg(prev => (prev > 0 ? prev - 1 : product.images.length - 1))} className="absolute left-3 top-1/2 -translate-y-1/2 p-2 bg-white/90 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110">
                <ChevronLeft size={18}/>
              </button>
              <button onClick={() => setCurrentImg(prev => (prev < product.images.length - 1 ? prev + 1 : 0))} className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-white/90 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110">
                <ChevronRight size={18}/>
              </button>
              
              {/* Indicador de imagen actual */}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-[8px] font-black">
                {currentImg + 1} / {product.images.length}
              </div>
           </div>
           {/* Miniaturas - más pequeñas en mobile */}
           <div className="flex gap-2 overflow-x-auto pb-2">
             {product.images.map((img, i) => (
               <div key={i} onClick={() => setCurrentImg(i)} className={`min-w-16 w-16 h-16 rounded-lg overflow-hidden cursor-pointer border-2 transition-all ${currentImg === i ? 'border-blue-500 scale-105' : 'border-slate-200'}`}>
                 <img src={img} className="w-full h-full object-cover" />
               </div>
             ))}
           </div>
        </div>

        {/* INFORMACIÓN Y COMPRA - COMPACTA */}
        <div className="space-y-5">
           <header>
             <p className="text-blue-600 font-black text-[9px] uppercase tracking-[0.2em] mb-2">{product.storeName}</p>
             <h1 className="text-2xl md:text-3xl font-black text-slate-900 uppercase italic tracking-tighter leading-tight">{product.name}</h1>
             <div className="mt-3 flex items-baseline gap-2">
                <span className="text-3xl md:text-4xl font-black text-slate-900 tracking-tighter">L {product.public_price}</span>
                <span className="text-[8px] font-bold text-slate-400 uppercase">Imp. incluido</span>
             </div>
           </header>

           {/* TALLAS - Responsivo */}
           <div className="space-y-3 border-t border-slate-100 pt-4">
             <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Talla</h4>
             <div className="flex flex-wrap gap-2">
               {product.inventory.map((item, i) => (
                 <button 
                  key={i} 
                  disabled={item.qty === 0}
                  onClick={() => setSelectedSize(item)}
                  className={`px-4 py-3 rounded-xl font-black text-sm transition-all border-2 ${selectedSize?.size === item.size ? 'bg-slate-900 border-slate-900 text-white shadow-lg' : item.qty === 0 ? 'bg-slate-100 border-slate-200 text-slate-300 cursor-not-allowed' : 'bg-white border-slate-100 text-slate-600 hover:border-blue-300'}`}
                 >
                   {item.size}
                   {item.qty < 5 && item.qty > 0 && <span className="text-[8px] block mt-0.5 opacity-60">({item.qty})</span>}
                 </button>
               ))}
             </div>
           </div>

           {/* DESCRIPCIÓN - Más compacta */}
           <div className="bg-slate-50 p-4 rounded-xl space-y-2">
              <h4 className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Descripción</h4>
              <p className="text-xs text-slate-600 leading-relaxed">{product.description}</p>
           </div>

           {/* BOTÓN AÑADIR - Sticky en mobile */}
           <button onClick={handleAdd} className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black text-sm uppercase tracking-tighter shadow-lg hover:bg-blue-700 active:scale-95 transition-all flex items-center justify-center gap-2 md:static">
             <ShoppingBag size={18}/> Añadir a Bolsa
           </button>
        </div>
      </div>
    </motion.div>
  );
}