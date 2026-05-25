import React, { useState, useEffect } from 'react';
import { db } from '../../firebase/config';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { ProductDetail } from './ProductDetail';
import { motion, AnimatePresence } from 'framer-motion';

export function Store() {
  const [products, setProducts] = useState([]);
  const [slides, setSlides] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    const q = query(collection(db, 'products'), where('status', '==', 'active'));
    const unsub = onSnapshot(q, (snap) => {
      const items = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setProducts(items.filter(p => p.inventory?.reduce((acc, curr) => acc + curr.qty, 0) > 0));
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'hero_slides'), snap => {
      setSlides(snap.docs.map(d => d.data().url));
    });
    return () => unsub();
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      {slides.length > 0 && (
        <div className="w-full h-32 md:h-56 rounded-[2rem] overflow-hidden shadow-lg shadow-blue-100/50 border border-white bg-slate-100">
          <motion.div
            animate={{ x: [`0%`, `-${(slides.length - 1) * 100}%`, `0%`] }}
            transition={{ duration: slides.length * 5, repeat: Infinity, ease: 'easeInOut' }}
            className="flex h-full"
          >
            {slides.map((url, i) => (
              <img key={i} src={url} className="min-w-full h-full object-cover" alt="Oferta Zaro" />
            ))}
          </motion.div>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-5">
        {products.map(product => (
          <motion.div
            key={product.id}
            whileTap={{ scale: 0.98 }}
            onClick={() => setSelectedProduct(product)}
            className="bg-white p-2 rounded-[1.8rem] shadow-sm border border-slate-100 hover:shadow-md transition-all cursor-pointer"
          >
            <div className="aspect-[3/4] bg-slate-100 rounded-[1.4rem] overflow-hidden relative">
              <img src={product.images[0]} className="w-full h-full object-cover" alt="" />
              {product.sticker && (
                <div className="absolute top-2 left-2 bg-blue-600 text-white text-[7px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter shadow-lg">
                  {product.sticker}
                </div>
              )}
            </div>
            <div className="mt-2 px-1">
              <h3 className="text-[10px] font-bold text-slate-800 uppercase truncate tracking-tighter">{product.name}</h3>
              <p className="text-xs font-black text-slate-900 mt-0.5">L {product.public_price}</p>
              <p className="text-[7px] font-black text-blue-500 uppercase mt-1 opacity-60 truncate">{product.storeName}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {selectedProduct && <ProductDetail product={selectedProduct} onClose={() => setSelectedProduct(null)} />}
      </AnimatePresence>
    </div>
  );
}