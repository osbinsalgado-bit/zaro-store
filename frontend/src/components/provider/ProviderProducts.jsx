// src/components/provider/ProviderProducts.jsx
import React, { useState, useEffect } from 'react';
import { db } from '../../firebase/config';
import { collection, query, where, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { Edit3, Trash2, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { ProductEdit } from './ProductEdit'; // El editor que crearemos abajo

export function ProviderProducts({ user }) {
  const [products, setProducts] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);

  useEffect(() => {
    const q = query(collection(db, 'products'), where('provider_id', '==', user.uid));
    const unsub = onSnapshot(q, (snap) => {
      setProducts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, [user]);

  if (editingProduct) return <ProductEdit product={editingProduct} onBack={() => setEditingProduct(null)} />;

  return (
    <div className="space-y-6 animate-in fade-in">
      <h2 className="text-xl font-black uppercase italic px-2">Mis Artículos</h2>
      
      <div className="grid grid-cols-1 gap-3">
        {products.map(p => (
          <div key={p.id} className="bg-white p-4 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-4">
            <img src={p.images[0]} className="w-16 h-16 rounded-2xl object-cover bg-slate-50" />
            <div className="flex-1 min-w-0">
               <h4 className="font-black text-[11px] uppercase truncate">{p.name}</h4>
               <div className="flex items-center gap-2 mt-1">
                  {p.status === 'active' && <span className="flex items-center gap-1 text-[8px] font-black text-green-500 uppercase"><CheckCircle size={10}/> Publicado</span>}
                  {p.status === 'pending' && <span className="flex items-center gap-1 text-[8px] font-black text-orange-400 uppercase"><Clock size={10}/> Revisión</span>}
                  {p.status === 'rejected' && <span className="flex items-center gap-1 text-[8px] font-black text-red-500 uppercase"><AlertCircle size={10}/> Rechazado</span>}
               </div>
               {p.rejected_reason && (
                 <p className="text-[8px] text-red-400 font-bold mt-1 bg-red-50 p-1 rounded italic">Nota: {p.rejected_reason}</p>
               )}
            </div>
            <div className="flex gap-2">
               <button onClick={() => setEditingProduct(p)} className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:text-blue-600"><Edit3 size={16}/></button>
               <button onClick={() => deleteDoc(doc(db, 'products', p.id))} className="p-3 bg-red-50 text-red-400 rounded-xl"><Trash2 size={16}/></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}