import { useState, useEffect } from 'react';
import { db } from '../firebase/config';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import { ProductDetail } from '../components/store/ProductDetail';
import { useCart } from '../context/CartContext'; 

export function StorePage () {
  const[products, setProducts] = useState([]);
  const [slides, setSlides] = useState([]);
  const[loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const { cart } = useCart();

  // Variable de la búsqueda
  const [params] = useSearchParams();
  const searchParam = params.get('q') || "";

  // Contador del carrito
  const cartItemCount = cart.reduce((acc, curr) => acc + curr.quantity, 0);

  useEffect(() => {
    const q = query(collection(db, 'products'), where('status', '==', 'active'));
    const unsub = onSnapshot(q, (snap) => {
      let items = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      
      // FILTRO ESTRICTO 1: Que tengan Stock > 0
      items = items.filter(p => p.inventory?.reduce((acc, curr) => acc + curr.qty, 0) > 0);
      setProducts(items);
      setLoading(false);
    });
    return () => unsub();
  },[]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'hero_slides'), snap => setSlides(snap.docs.map(d => d.data().url)));
    return () => unsub();
  },[]);

  // FILTRO MAGICO DEL BUSCADOR: 
  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchParam.toLowerCase()) || 
    (p.category && p.category.toLowerCase().includes(searchParam.toLowerCase()))
  );

  if (loading) return (
     <div className="pt-20 text-center font-black italic uppercase text-slate-300 animate-pulse tracking-[0.4em] text-sm">
        Construyendo Tienda Zora...
     </div>
  );

  return (
    <div className="space-y-6 w-full animate-in fade-in duration-700 px-4 md:px-8 mt-6">
      
      {slides.length > 0 && !searchParam && (
        <div className="w-full h-36 md:h-[40vh] max-h-[350px] rounded-[2rem] overflow-hidden shadow-xl border-4 border-white bg-slate-100 relative group">
          <motion.div animate={{ x:[`0%`, `-${(slides.length - 1) * 100}%`, `0%`] }}
            transition={{ duration: slides.length * 5, repeat: Infinity, ease: 'linear' }}
            className="flex h-full w-full"
          >
            {slides.map((url, i) => (
              <img key={i} src={url} className="min-w-full h-full object-cover" alt="Oferta Zora" loading="lazy"/>
            ))}
          </motion.div>
        </div>
      )}

      {/* Titulo con contador carrito */}
      {searchParam && (
        <div className="flex items-center justify-between">
          <h2 className="font-black italic text-slate-400 text-lg uppercase tracking-widest pt-2">
            Buscando: <span className="text-blue-500">"{searchParam}"</span>
          </h2>
          {cartItemCount > 0 && (
            <div className="flex items-center gap-2 bg-blue-50 px-3 py-2 rounded-full border border-blue-100">
              <span className="text-[10px] font-black uppercase text-blue-600">Carrito</span>
              <span className="bg-blue-600 text-white text-xs font-black px-2 py-0.5 rounded-full">{cartItemCount}</span>
            </div>
          )}
        </div>
      )}

      {/* Grid del Catálogo Inaa/Zora */}
      {filteredProducts.length === 0 ? (
         <div className="py-24 text-center opacity-40 font-black uppercase tracking-widest text-slate-500">
           {searchParam ? 'Lo siento, no tenemos de este estilo. Prueba otra palabra.' : 'Aún no hay productos publicados...'}
         </div>
      ) : (
         <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-5 pb-20 mt-4">
           {filteredProducts.map(product => (
             <motion.div key={product.id} whileTap={{ scale: 0.95 }}
               className="bg-white p-3 rounded-[2rem] shadow-sm shadow-slate-200/50 border border-slate-100 hover:shadow-2xl hover:border-blue-200 transition-all cursor-pointer relative flex flex-col h-full group"
               onClick={() => setSelectedProduct(product)}
             >
               {product.sticker && (
                 <div className="absolute top-4 left-4 z-10 bg-gradient-to-r from-orange-400 to-pink-500 text-white text-[7.5px] font-black px-2 py-0.5 rounded-md uppercase tracking-[0.2em] shadow-md shadow-pink-500/20">
                   {product.sticker}
                 </div>
               )}

               <div className="aspect-[4/5] bg-slate-50 rounded-[1.2rem] overflow-hidden mb-3">
                 <img src={product.images[0]} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt={product.name} loading="lazy" />
               </div>

               <div className="flex-1 flex flex-col justify-end">
                 <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest mb-0.5 truncate leading-none">{product.category}</p>
                 <h3 className="text-[10px] md:text-xs font-bold text-slate-900 uppercase leading-snug line-clamp-2 min-h-[30px]">{product.name}</h3>
                 
                 <div className="mt-2 flex justify-between items-center pt-2 border-t border-slate-50">
                    <p className="text-sm font-black text-blue-600 tracking-tighter italic">L {product.public_price.toFixed(0)}</p>
                    <div className="w-7 h-7 bg-gradient-to-tr from-purple-500 to-pink-500 text-white rounded-full flex items-center justify-center font-bold text-sm pb-0.5 shadow-sm opacity-70 group-hover:opacity-100 group-hover:shadow-lg group-hover:scale-110 transition-all cursor-pointer">+</div>
                 </div>
               </div>
             </motion.div>
           ))}
         </div>
      )}

      {/* MODAL DETALLE DE PRODUCTO */}
      <AnimatePresence>
        {selectedProduct && (
           <ProductDetail 
              product={selectedProduct} 
              onClose={() => setSelectedProduct(null)} 
           />
        )}
      </AnimatePresence>
    </div>
  );
}