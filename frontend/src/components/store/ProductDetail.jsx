// src/components/home/ProductDetail.jsx
import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ShoppingBag, Plus, Minus, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { useCart } from '../../context/CartContext';

export function ProductDetail({ product, onClose }) {
  const [currentImg, setCurrentImg] = useState(0);
  const [selectedSize, setSelectedSize] = useState(() => {
    // Inicializar con la primera talla si solo hay una disponible
    if (product.inventory?.length === 1 && product.inventory[0].qty > 0) {
      return product.inventory[0];
    }
    return null;
  });
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();

  const maxDisp = selectedSize ? selectedSize.qty : 0;

  const increase = () => setQuantity(prev => (prev < maxDisp ? prev + 1 : prev));
  const decrease = () => setQuantity(prev => (prev > 1 ? prev - 1 : 1));

  const handleAdd = () => {
    if (!selectedSize) return alert("Hey! Debes seleccionar una talla para empacártelo 🎀");
    if (quantity > maxDisp) return alert("Lo sentimos, no hay suficientes existencias ahorita.");
    
    addToCart(product, selectedSize.size, quantity);
    // Efectito al botón o alerta local
    onClose();
  };

  return (
    <motion.div 
      initial={{ x: '100%', opacity: 0 }} 
      animate={{ x: 0, opacity: 1 }} 
      exit={{ x: '100%', opacity: 0 }} 
      transition={{ type: "spring", damping: 25, stiffness: 200 }}
      className="fixed inset-0 z-[300] bg-slate-50 overflow-y-auto flex flex-col font-sans"
    >
      
      {/* 🔹 HEADER TRASLÚCIDO FLOTANTE */}
      <nav className="fixed top-0 w-full p-4 flex justify-between items-center bg-white/95 backdrop-blur-xl z-[310] border-b border-slate-100 shadow-md">
        <button onClick={onClose} className="p-2.5 bg-slate-900 shadow-sm border border-slate-800 rounded-full text-white hover:bg-black transition-colors">
          <ArrowLeft size={18}/>
        </button>
        <h2 className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-800">
          Detalles Zora
        </h2>
        <div className="w-10"></div> {/* Spacer balance */}
      </nav>

      {/* 🔹 IMAGEN Y CARRUSEL TIPO AMAZON COMPACTO */}
      <div className="pt-16 md:pt-20 px-3 md:px-4 max-w-5xl mx-auto w-full pb-32">
        <div className="grid md:grid-cols-2 gap-4 md:gap-8">
          
          <div className="space-y-2 md:space-y-4">
             <div className="aspect-[3/4] md:aspect-[4/5] bg-white rounded-2xl md:rounded-[2.5rem] shadow-lg shadow-blue-900/5 overflow-hidden relative group border-2 md:border-4 border-white">
                
                {product.sticker && (
                 <div className="absolute top-3 md:top-6 left-3 md:left-6 z-10 bg-gradient-to-tr from-purple-500 to-pink-500 text-white text-[7px] md:text-[8px] font-black px-2 md:px-3 py-0.5 md:py-1 rounded-full uppercase tracking-widest shadow-lg shadow-purple-500/20">
                   {product.sticker}
                 </div>
                )}

                <img 
                   src={product.images[currentImg]} 
                   className="w-full h-full object-cover select-none transition-transform duration-500 group-hover:scale-[1.02]" 
                   alt={product.name} 
                />
                
                {/* Controladores Foto Manual (Aparecen PC o Movil Touch) */}
                <button onClick={(e) => { e.stopPropagation(); setCurrentImg(prev => (prev > 0 ? prev - 1 : product.images.length - 1))}} className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 p-2 md:p-3 bg-white/80 backdrop-blur-sm rounded-full text-slate-600 shadow-md md:opacity-0 group-hover:opacity-100 transition-all hover:bg-white hover:text-blue-500 active:scale-90"><ChevronLeft size={16} className="md:w-5 md:h-5"/></button>
                <button onClick={(e) => { e.stopPropagation(); setCurrentImg(prev => (prev < product.images.length - 1 ? prev + 1 : 0))}} className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 p-2 md:p-3 bg-white/80 backdrop-blur-sm rounded-full text-slate-600 shadow-md md:opacity-0 group-hover:opacity-100 transition-all hover:bg-white hover:text-blue-500 active:scale-90"><ChevronRight size={16} className="md:w-5 md:h-5"/></button>
             </div>

             {/* Tiras Fotográficas Abajo (Miniaturas) */}
             <div className="flex gap-2 md:gap-3 overflow-x-auto scrollbar-hide py-1 md:py-2 px-0.5 md:px-1">
               {product.images.map((imgUrl, idx) => (
                 <button key={idx} onClick={()=>setCurrentImg(idx)} className={`w-12 md:w-16 h-12 md:h-16 flex-shrink-0 rounded-lg md:rounded-[1rem] overflow-hidden transition-all border-3 md:border-4 ${currentImg === idx ? 'border-purple-300 scale-105 shadow-md':'border-transparent bg-white shadow-sm'}`}>
                   <img src={imgUrl} className="w-full h-full object-cover" alt="" />
                 </button>
               ))}
             </div>
          </div>

          {/* 🔹 DATOS MAESTROS DEL ZORA PRODUCT - MOBILE OPTIMIZADO */}
          <div className="flex flex-col pt-2 md:pt-4 md:space-y-6">
             <span className="text-[8px] md:text-[10px] font-black uppercase text-blue-500 tracking-[0.2em] mb-1 md:mb-2">{product.category || 'Tendencia INAA'} <Sparkles size={10} className="inline text-yellow-400 pb-0.5"/></span>
             <h1 className="text-xl md:text-5xl font-black italic text-slate-900 uppercase tracking-tighter leading-snug md:leading-[0.95] mb-2 md:mb-4 drop-shadow-sm">{product.name}</h1>
             
             <div className="flex items-baseline gap-2 mb-3 md:mb-6">
                <span className="text-2xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 tracking-tighter italic">
                  L {product.public_price.toFixed(0)}
                </span>
                <span className="text-[8px] md:text-[10px] font-black uppercase text-slate-400 bg-white px-2 py-0.5 md:py-1 rounded-full shadow-sm">INC IVA</span>
             </div>

             {/* 🔹 SELECTORES ZORA ESTÉTICOS DE TALLA Y STOCK */}
             <div className="space-y-3 md:space-y-6 flex-1">
                <div>
                  <h4 className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 md:mb-3">Talla y Disponibilidad:</h4>
                  <div className="flex flex-wrap gap-1.5 md:gap-2 md:gap-3">
                     {product.inventory?.map((inv, idx) => (
                       <button 
                         key={idx} 
                         disabled={inv.qty < 1}
                         onClick={() => { setSelectedSize(inv); setQuantity(1); }}
                         className={`px-3 md:px-5 py-2 md:py-3.5 rounded-lg md:rounded-[1.5rem] font-black text-[9px] md:text-xs uppercase tracking-wider transition-all relative overflow-hidden ${
                            inv.qty < 1 
                               ? 'bg-slate-100 text-slate-300 border-2 border-slate-50 cursor-not-allowed line-through decoration-slate-400 decoration-2' 
                               : selectedSize?.size === inv.size 
                                  ? 'bg-slate-900 text-white shadow-xl shadow-slate-900/20 scale-[1.03]' 
                                  : 'bg-white border-2 border-slate-100 text-slate-600 hover:border-purple-200 shadow-sm hover:shadow-purple-500/10'
                         }`}
                       >
                         {inv.size}
                         {/* Indicador Micro stock al escoger */}
                         {inv.qty > 0 && inv.qty <= 5 && <span className={`absolute top-0 right-0 ${selectedSize?.size === inv.size ? 'bg-red-500':'bg-purple-100 text-purple-600'} text-white text-[6px] md:text-[7px] px-1 md:px-1.5 rounded-bl-lg font-black`}>{inv.qty}</span>}
                       </button>
                     ))}
                  </div>
                </div>

                {/* AREA PREPARACION CANTIDAD con presets - VISIBLE EN MOVIL LUEGO DE TALLA */}
                <div className={`transition-opacity duration-300 ${!selectedSize ? 'opacity-30 pointer-events-none' : 'opacity-100'}`}>
                   <h4 className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 md:mb-3">Cantidad:</h4>
                   <div className="space-y-2">
                     {/* Selector Manual */}
                     <div className="flex bg-white w-max p-1.5 md:p-2 rounded-xl md:rounded-[2rem] border border-slate-100 shadow-sm shadow-blue-500/5 items-center">
                       <button onClick={decrease} className="p-2 md:p-3 bg-slate-50 text-slate-400 hover:text-red-500 rounded-lg md:rounded-2xl active:scale-95"><Minus size={14} className="md:w-4 md:h-4"/></button>
                       <span className="w-8 md:w-12 text-center text-base md:text-lg font-black text-slate-800">{quantity}</span>
                       <button onClick={increase} className="p-2 md:p-3 bg-blue-50 text-blue-500 hover:bg-blue-500 hover:text-white rounded-lg md:rounded-2xl active:scale-95 transition-all"><Plus size={14} className="md:w-4 md:h-4"/></button>
                     </div>
                     {/* Presets rápidos */}
                     <div className="flex gap-1.5 flex-wrap">
                       {[1, 2, 3, 5].map(num => (
                         num <= maxDisp && (
                           <button 
                             key={num}
                             onClick={() => setQuantity(num)}
                             className={`px-2.5 md:px-4 py-1 md:py-2 rounded-lg text-[7px] md:text-[9px] font-black uppercase transition-all ${
                               quantity === num 
                                 ? 'bg-purple-500 text-white shadow-md'
                                 : 'bg-slate-100 text-slate-600 hover:bg-purple-50 hover:text-purple-600'
                             }`}
                           >
                             {num} {num === 1 ? 'Un' : 'x'}
                           </button>
                         )
                       ))}
                     </div>
                   </div>
                </div>

                {/* INFO BOX - SOLO EN DESKTOP, EN MOVIL VA DESPUÉS DEL BOTÓN */}
                <div className="hidden md:block p-3 md:p-5 bg-white rounded-xl md:rounded-[2rem] border border-slate-100 shadow-sm space-y-1 md:space-y-2">
                   <p className="text-[8px] md:text-[9px] font-black uppercase text-slate-400 tracking-widest border-b border-slate-50 pb-1 md:pb-2">Información:</p>
                   <p className="text-[9px] md:text-xs text-slate-600 font-bold leading-relaxed">{product.description}</p>
                </div>
             </div>

          </div>
        </div>
      </div>

      {/* 🔹 BOTTOM BAR PEGADA INAA PARA DISPARO CÁRTELES MAGICO */}
      <div className="fixed bottom-0 left-0 right-0 p-3 md:p-4 bg-white/95 backdrop-blur-xl border-t border-slate-100 flex flex-col md:flex-row items-center gap-2 md:gap-4 shadow-[0_-10px_40px_rgba(0,0,0,0.03)] z-[320] md:relative md:bg-transparent md:border-t-0 md:p-0 md:pt-3 md:mt-auto md:shadow-none">
         
         {/* TOTAL EN DESKTOP */}
         <div className="hidden md:flex flex-col text-right w-1/3">
           <span className="text-[10px] font-black text-slate-400 tracking-widest uppercase">Total</span>
           <span className="text-xl font-black italic tracking-tighter text-blue-600 leading-none">L {selectedSize ? (product.public_price * quantity).toFixed(0) : '0'}</span>
         </div>
         
         <button onClick={handleAdd} className={`flex-1 md:flex-initial py-3 md:py-5 px-4 md:px-6 rounded-xl md:rounded-[2rem] text-white flex items-center justify-center gap-1 md:gap-3 uppercase font-black tracking-widest text-[9px] md:text-sm shadow-2xl transition-all active:scale-[0.98] ${!selectedSize ? 'bg-slate-300' : 'bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 shadow-purple-500/30'}`}>
            {!selectedSize ? '👈 Talla' : <><ShoppingBag size={16} className="md:w-5 md:h-5"/> Carrito (x{quantity}) </>}
         </button>
      </div>

      {/* DESCRIPCION EN MOVIL - DESPUÉS DEL BOTÓN */}
      <div className="md:hidden px-3 pb-24 pt-4 space-y-3">
        <div className="p-3 bg-white rounded-xl border border-slate-100 shadow-sm space-y-1">
           <p className="text-[8px] font-black uppercase text-slate-400 tracking-widest border-b border-slate-50 pb-1">Información del Producto:</p>
           <p className="text-[9px] text-slate-600 font-bold leading-relaxed">{product.description}</p>
        </div>
      </div>

    </motion.div>
  );
}