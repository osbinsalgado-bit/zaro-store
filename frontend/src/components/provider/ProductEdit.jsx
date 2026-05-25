// src/components/provider/ProductEdit.jsx
import React, { useState } from 'react';
import { db, storage } from '../../firebase/config';
import { doc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { ArrowLeft, Save, Plus, X } from 'lucide-react';

export function ProductEdit({ product, onBack }) {
  const [f, setF] = useState({ ...product });
  const [existingImages, setExistingImages] = useState(product.images || []);
  const [newFiles, setNewFiles] = useState([]);
  const [newPreviews, setNewPreviews] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (existingImages.length + newFiles.length + files.length > 6) {
      return alert('El máximo son 6 imágenes por producto');
    }

    const previews = files.map(file => URL.createObjectURL(file));
    setNewPreviews(prev => [...prev, ...previews]);
    setNewFiles(prev => [...prev, ...files]);
  };

  const removeExistingImage = (index) => {
    setExistingImages(prev => prev.filter((_, idx) => idx !== index));
  };

  const removeNewImage = (index) => {
    setNewFiles(prev => prev.filter((_, idx) => idx !== index));
    setNewPreviews(prev => prev.filter((_, idx) => idx !== index));
  };

  const uploadNewImages = async () => {
    const urls = [];
    for (const file of newFiles) {
      const storageRef = ref(storage, `products/${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      urls.push(url);
    }
    return urls;
  };

  const handleUpdate = async () => {
    if (existingImages.length + newFiles.length === 0) {
      return alert('Debes dejar al menos una imagen del producto');
    }

    setLoading(true);
    try {
      const uploadedUrls = newFiles.length > 0 ? await uploadNewImages() : [];
      const finalImages = [...existingImages, ...uploadedUrls];

      await updateDoc(doc(db, 'products', product.id), {
        ...f,
        images: finalImages,
        status: 'pending', // Vuelve a revisión tras editar
        updated_at: new Date()
      });
      alert('Cambios guardados. El Admin revisará la actualización.');
      onBack();
    } catch (err) {
      console.error(err);
      alert('Error al actualizar');
    }
    setLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in slide-in-from-right">
      <button onClick={onBack} className="flex items-center gap-2 text-slate-400 font-black text-[10px] uppercase"><ArrowLeft size={14}/> Volver</button>
      
      <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 space-y-4 shadow-xl">
        <h3 className="font-black italic uppercase">Editar Artículo</h3>
        {product.status === 'rejected' && product.rejected_reason && (
          <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-2xl text-[10px] font-black uppercase">
            Rechazado: {product.rejected_reason}
          </div>
        )}
        
        <input className="w-full p-4 bg-slate-50 rounded-2xl font-bold text-sm" value={f.name} onChange={e => setF({...f, name: e.target.value})} placeholder="Nombre"/>
        
        <textarea className="w-full p-4 bg-slate-50 rounded-2xl text-xs h-24" value={f.description} onChange={e => setF({...f, description: e.target.value})} placeholder="Descripción"/>

        {/* GESTIÓN DE IMÁGENES */}
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-[10px] font-black text-slate-400 uppercase">Fotos del producto</p>
            <span className="text-[10px] text-slate-500 uppercase">Máx 6</span>
          </div>

          <label className="block w-full p-4 bg-slate-50 rounded-[2rem] border border-dashed border-slate-200 text-center cursor-pointer hover:border-blue-300 hover:bg-blue-50 transition-all">
            <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageChange} />
            <div className="text-[10px] font-black uppercase text-slate-500">Agregar nuevas fotos</div>
            <div className="text-[8px] text-slate-400 mt-1">Puedes agregar hasta {6 - existingImages.length - newFiles.length} fotos más</div>
          </label>

          <div className="grid grid-cols-3 gap-3">
            {existingImages.map((url, index) => (
              <div key={`existing-${index}`} className="relative overflow-hidden rounded-2xl bg-slate-100 aspect-square">
                <img src={url} className="w-full h-full object-cover" alt="Imagen existente" />
                <button type="button" onClick={() => removeExistingImage(index)} className="absolute top-2 right-2 p-2 bg-white/90 rounded-full text-red-500 shadow-sm">
                  <X size={14} />
                </button>
              </div>
            ))}
            {newPreviews.map((url, index) => (
              <div key={`new-${index}`} className="relative overflow-hidden rounded-2xl bg-slate-100 aspect-square">
                <img src={url} className="w-full h-full object-cover" alt="Nueva imagen" />
                <button type="button" onClick={() => removeNewImage(index)} className="absolute top-2 right-2 p-2 bg-white/90 rounded-full text-red-500 shadow-sm">
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* GESTIÓN DE STOCK POR TALLA */}
        <div className="space-y-2">
           <p className="text-[10px] font-black text-slate-400 uppercase ml-2">Inventario disponible</p>
           {f.inventory.map((inv, idx) => (
             <div key={idx} className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl">
                <span className="font-black text-xs w-10">{inv.size}</span>
                <div className="flex items-center gap-2 flex-1">
                   <button onClick={() => {
                     const newInv = [...f.inventory];
                     newInv[idx].qty = Math.max(0, newInv[idx].qty - 1);
                     setF({...f, inventory: newInv});
                   }} className="p-1 bg-white rounded-lg border">-</button>
                   <span className="font-bold text-xs">{inv.qty}</span>
                   <button onClick={() => {
                     const newInv = [...f.inventory];
                     newInv[idx].qty += 1;
                     setF({...f, inventory: newInv});
                   }} className="p-1 bg-white rounded-lg border">+</button>
                </div>
             </div>
           ))}
        </div>

        <button onClick={handleUpdate} disabled={loading} className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2">
           {loading ? 'Guardando...' : <><Save size={16}/> Guardar y Enviar a Revisión</>}
        </button>
      </div>
    </div>
  );
}