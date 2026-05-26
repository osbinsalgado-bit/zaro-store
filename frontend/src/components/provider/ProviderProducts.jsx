import React, { useState, useEffect } from 'react';
import { db } from '../../firebase/config';
import { collection, query, where, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { Edit3, Trash2, AlertCircle, CheckCircle, Clock, FileText } from 'lucide-react';
import { ProductEdit } from './ProductEdit'; 

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

  if (products.length === 0) {
      return (
          <div className="bg-white p-16 rounded-[2rem] border border-slate-200 text-center shadow-sm">
             <FileText size={48} className="mx-auto text-slate-300 mb-4"/>
             <h3 className="font-black text-lg text-slate-800 uppercase">Aún no tienes artículos</h3>
             <p className="text-sm text-slate-500 mt-2">Ve a la pestaña "Publicar Nuevo" para comenzar a vender.</p>
          </div>
      );
  }

  return (
    <div className="space-y-4 animate-in fade-in">
      <div className="grid grid-cols-1 gap-4">
        {products.map(p => {
          // Calculamos total actual vs total inicial
          const totalQty = p.inventory?.reduce((acc, curr) => acc + curr.qty, 0) || 0;
          const totalInitial = p.inventory?.reduce((acc, curr) => acc + (curr.initial_qty || curr.qty), 0) || 0;

          return(
          <div key={p.id} className="bg-white p-5 rounded-[2rem] border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center gap-6 hover:border-blue-300 transition-colors">
            
            <img src={p.images[0]} className="w-24 h-24 rounded-2xl object-cover border border-slate-100 shrink-0" alt="Producto"/>
            
            <div className="flex-1 min-w-0 w-full space-y-2">
               <div className="flex items-center gap-2 mb-1">
                  {p.status === 'active' && <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-[10px] font-black uppercase flex items-center gap-1"><CheckCircle size={12}/> Publicado</span>}
                  {p.status === 'pending' && <span className="bg-orange-100 text-orange-700 px-2 py-0.5 rounded text-[10px] font-black uppercase flex items-center gap-1"><Clock size={12}/> En Revisión</span>}
                  {p.status === 'rejected' && <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded text-[10px] font-black uppercase flex items-center gap-1"><AlertCircle size={12}/> Rechazado</span>}
                  {p.status === 'hidden' && <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[10px] font-black uppercase">Oculto</span>}
               </div>
               
               <h4 className="font-black text-base uppercase text-slate-900 truncate">{p.name}</h4>
               
               <div className="flex flex-wrap gap-4 text-xs font-bold text-slate-600">
                  <p>Precio Base: <span className="text-slate-900">L {p.base_price}</span></p>
                  <p>Stock: <span className={totalQty === 0 ? 'text-red-500' : 'text-blue-600'}>{totalQty} / {totalInitial}</span> unid.</p>
               </div>

               {p.status === 'rejected' && p.rejected_reason && (
                 <div className="bg-red-50 border border-red-200 p-3 rounded-xl mt-2">
                    <p className="text-[10px] font-black uppercase text-red-600 mb-1">Motivo del Rechazo del Administrador:</p>
                    <p className="text-xs text-red-800 font-medium">{p.rejected_reason}</p>
                 </div>
               )}
            </div>

            <div className="flex gap-2 w-full md:w-auto border-t md:border-t-0 border-slate-100 pt-4 md:pt-0">
               <button onClick={() => setEditingProduct(p)} className="flex-1 md:flex-none p-3 md:px-5 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white rounded-xl text-xs font-bold uppercase transition flex items-center justify-center gap-2"><Edit3 size={16}/> Editar</button>
               <button onClick={async () => { if(window.confirm('¿Deseas eliminar permanentemente este producto?')) await deleteDoc(doc(db, 'products', p.id)); }} className="p-3 bg-red-50 text-red-500 hover:bg-red-500 hover:text-white rounded-xl transition"><Trash2 size={18}/></button>
            </div>

          </div>
        )})}
      </div>
    </div>
  );
}