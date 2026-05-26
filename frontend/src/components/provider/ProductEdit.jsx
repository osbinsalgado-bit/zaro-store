import React, { useState, useEffect } from 'react';
import { db, storage } from '../../firebase/config';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { ArrowLeft, Save, Plus, X, Loader2 } from 'lucide-react';

export function ProductEdit({ product, onBack }) {
  const [f, setF] = useState({ ...product });
  const [existingImages, setExistingImages] = useState(product.images || []);
  const [newFiles, setNewFiles] = useState([]);
  const [newPreviews, setNewPreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newSizeInput, setNewSizeInput] = useState({ size: '', qty: '' });
  
  // Nuevo estado para calcular el margen de ganancia en vivo
  const [margin, setMargin] = useState(0.30);

  // Descargar el margen desde las reglas del sistema
  useEffect(() => {
    const fetchRules = async () => {
      const docSnap = await getDoc(doc(db, 'system_rules', 'pricing'));
      if (docSnap.exists() && docSnap.data().admin_margin) {
          setMargin(Number(docSnap.data().admin_margin));
      }
    };
    fetchRules();
  }, []);

  // Cálculo en vivo del precio que verá el público
  const publicPrice = f.base_price ? (Number(f.base_price) * (1 + margin)).toFixed(2) : '0.00';

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (existingImages.length + newFiles.length + files.length > 6) {
      return alert('El límite es de 6 imágenes por producto.');
    }
    const previews = files.map(file => URL.createObjectURL(file));
    setNewPreviews(prev => [...prev, ...previews]);
    setNewFiles(prev => [...prev, ...files]);
  };

  const removeExistingImage = (index) => setExistingImages(prev => prev.filter((_, idx) => idx !== index));
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
    if (existingImages.length + newFiles.length < 3) return alert('Debes mantener al menos 3 imágenes.');

    setLoading(true);
    try {
      const uploadedUrls = newFiles.length > 0 ? await uploadNewImages() : [];
      const finalImages = [...existingImages, ...uploadedUrls];

      await updateDoc(doc(db, 'products', product.id), {
        name: f.name,
        description: f.description,
        category: f.category,
        deliveryTime: f.deliveryTime,
        inventory: f.inventory,
        images: finalImages,
        
        // ACTUALIZAR PRECIOS EN BD
        base_price: Number(f.base_price),
        public_price: Number(publicPrice),

        status: 'pending', // Regresa a revisión
        updated_at: new Date()
      });
      alert('Cambios guardados. El artículo ha sido enviado a revisión nuevamente.');
      onBack();
    } catch (err) {
      alert('Error al actualizar el producto.');
    }
    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in slide-in-from-right font-sans text-slate-900 placeholder-slate-400">
      <button onClick={onBack} className="flex items-center gap-2 text-slate-500 hover:text-slate-800 font-bold text-xs uppercase px-2"><ArrowLeft size={16}/> Volver al Listado</button>
      
      <div className="bg-white p-8 md:p-10 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-6">
        <h3 className="font-black text-2xl text-slate-900 uppercase border-b border-slate-100 pb-4">Editar Artículo</h3>
        
        {/* BLOQUE DE PRECIOS */}
        <div className="flex flex-col md:flex-row gap-4 p-6 bg-slate-900 rounded-[2rem] text-white shadow-lg items-center">
          <div className="flex-1 w-full">
            <label className="text-[10px] font-black text-slate-400 uppercase block mb-1">Tu Ganancia (Precio Base)</label>
            <div className="flex items-center gap-2">
               <span className="text-xl font-black">L</span>
               <input 
                 type="number" 
                 className="w-full bg-transparent font-black text-2xl outline-none border-b border-slate-700 focus:border-blue-500" 
                 value={f.base_price} 
                 onChange={e => setF({...f, base_price: e.target.value})} 
               />
            </div>
          </div>
          <div className="hidden md:block w-px h-12 bg-slate-700 mx-2"></div>
          <div className="flex-1 w-full md:text-right border-t border-slate-700 pt-4 md:border-none md:pt-0">
            <label className="text-[10px] font-black uppercase text-blue-400 block mb-1">Precio Final Público (+{margin * 100}%)</label>
            <p className="text-2xl font-black text-white">L {publicPrice}</p>
          </div>
        </div>

        {/* BLOQUE DATOS PRINCIPALES */}
        <div className="grid md:grid-cols-2 gap-6">
           <div>
              <label className="text-[10px] font-bold uppercase text-slate-500 ml-2 block mb-1">Nombre Comercial</label>
              <input className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-sm outline-none focus:border-blue-500" value={f.name} onChange={e => setF({...f, name: e.target.value})}/>
           </div>
           <div className="grid grid-cols-2 gap-4">
              <div>
                 <label className="text-[10px] font-bold uppercase text-slate-500 ml-2 block mb-1">Categoría</label>
                 <input className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-sm outline-none focus:border-blue-500" value={f.category} onChange={e => setF({...f, category: e.target.value})}/>
              </div>
              <div>
                 <label className="text-[10px] font-bold uppercase text-slate-500 ml-2 block mb-1">Tiempo de Entrega</label>
                 <input className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-sm outline-none focus:border-blue-500" value={f.deliveryTime} onChange={e => setF({...f, deliveryTime: e.target.value})}/>
              </div>
           </div>
        </div>
        
        <div>
           <label className="text-[10px] font-bold uppercase text-slate-500 ml-2 block mb-1">Descripción Detallada</label>
           <textarea className="w-full p-5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium h-32 outline-none focus:border-blue-500" value={f.description} onChange={e => setF({...f, description: e.target.value})}/>
        </div>

        {/* GESTIÓN DE STOCK Y TALLAS */}
        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
           <p className="text-xs font-black text-slate-700 uppercase mb-4">Gestión de Inventario</p>
           
           <div className="space-y-3 mb-4">
              {f.inventory.map((inv, idx) => (
                <div key={idx} className="flex items-center justify-between bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                   <div className="flex gap-4 items-center">
                       <span className="font-black text-sm uppercase text-slate-800 w-16">{inv.size}</span>
                       <span className="text-[10px] font-bold text-slate-400 uppercase">Inicial: {inv.initial_qty || inv.qty}</span>
                   </div>
                   <div className="flex items-center gap-3">
                      <span className="text-[10px] font-bold text-slate-500 uppercase hidden md:inline">Disponible:</span>
                      <button onClick={() => {
                        const newInv = [...f.inventory];
                        newInv[idx].qty = Math.max(0, newInv[idx].qty - 1);
                        setF({...f, inventory: newInv});
                      }} className="p-2 bg-slate-100 rounded-lg text-slate-600 hover:bg-slate-200">-</button>
                      
                      <span className="font-black text-sm w-6 text-center">{inv.qty}</span>
                      
                      <button onClick={() => {
                        const newInv = [...f.inventory];
                        newInv[idx].qty += 1;
                        if(newInv[idx].qty > (newInv[idx].initial_qty || 0)) {
                             newInv[idx].initial_qty = newInv[idx].qty; // Actualizamos el inicial si agrega más
                        }
                        setF({...f, inventory: newInv});
                      }} className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100">+</button>
                   </div>
                </div>
              ))}
           </div>

           <div className="flex gap-2 pt-4 border-t border-slate-200">
              <input value={newSizeInput.size} onChange={e => setNewSizeInput({...newSizeInput, size: e.target.value.toUpperCase()})} className="flex-1 p-3 bg-white rounded-xl border border-slate-200 outline-none font-bold text-sm text-slate-900 placeholder-slate-400" placeholder="Nueva Talla (Ej: XL)"/>
              <input value={newSizeInput.qty} type="number" onChange={e => setNewSizeInput({...newSizeInput, qty: e.target.value})} className="w-24 p-3 bg-white rounded-xl border border-slate-200 outline-none font-bold text-sm text-slate-900 placeholder-slate-400" placeholder="Cant."/>
              <button type="button" onClick={() => {
                  if(newSizeInput.size && Number(newSizeInput.qty) > 0) {
                    setF({...f, inventory: [...f.inventory, { size: newSizeInput.size, qty: Number(newSizeInput.qty), initial_qty: Number(newSizeInput.qty) }]});
                    setNewSizeInput({size: '', qty: ''});
                  }
              }} className="p-3 bg-slate-900 text-white font-bold text-[10px] uppercase rounded-xl transition shadow-md">Agregar</button>
           </div>
        </div>

        {/* FOTOGRAFÍAS */}
        <div className="space-y-4">
          <label className="block w-full py-6 bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-300 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all">
            <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageChange} />
            <div className="text-xs font-black uppercase text-blue-600">Subir Nuevas Fotos</div>
            <div className="text-[10px] text-slate-500 mt-1">Límite total: 6 imágenes</div>
          </label>

          <div className="grid grid-cols-4 md:grid-cols-6 gap-3">
            {existingImages.map((url, index) => (
              <div key={`existing-${index}`} className="relative rounded-xl overflow-hidden border border-slate-200 aspect-square">
                <img src={url} className="w-full h-full object-cover" alt="Actual" />
                <button type="button" onClick={() => removeExistingImage(index)} className="absolute top-1 right-1 p-1 bg-red-500 rounded-md text-white shadow-md hover:bg-red-600"><X size={12} /></button>
              </div>
            ))}
            {newPreviews.map((url, index) => (
              <div key={`new-${index}`} className="relative rounded-xl overflow-hidden border border-blue-200 aspect-square">
                <img src={url} className="w-full h-full object-cover" alt="Nueva" />
                <button type="button" onClick={() => removeNewImage(index)} className="absolute top-1 right-1 p-1 bg-red-500 rounded-md text-white shadow-md hover:bg-red-600"><X size={12} /></button>
              </div>
            ))}
          </div>
        </div>

        <button onClick={handleUpdate} disabled={loading} className="w-full py-5 bg-blue-600 text-white rounded-[1.5rem] font-black text-sm uppercase tracking-widest shadow-lg hover:bg-blue-700 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50">
           {loading ? <><Loader2 className="animate-spin"/> Actualizando...</> : <><Save size={18}/> Guardar y Enviar a Revisión</>}
        </button>
      </div>
    </div>
  );
}