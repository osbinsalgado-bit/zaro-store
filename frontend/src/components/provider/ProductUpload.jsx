import React, { useState, useEffect } from 'react';
import { db, storage } from '../../firebase/config';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, doc, getDoc } from 'firebase/firestore';
import { Upload, X, Loader2, Plus, Info, Package } from 'lucide-react';

export function ProductUpload({ user, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [margin, setMargin] = useState(0.30); // 30% por defecto
  
  const [form, setForm] = useState({ name: '', basePrice: '', category: '', description: '', deliveryTime: '' });
  const [imageFiles, setImageFiles] = useState([]); 
  const [previews, setPreviews] = useState([]); 
  const [sizeInput, setSizeInput] = useState({ size: '', qty: '' });
  const [inventory, setInventory] = useState([]);

  useEffect(() => {
    const fetchRules = async () => {
      const docSnap = await getDoc(doc(db, 'system_rules', 'pricing'));
      if (docSnap.exists() && docSnap.data().admin_margin) {
          setMargin(Number(docSnap.data().admin_margin));
      }
    };
    fetchRules();
  }, []);

  const publicPrice = form.basePrice ? (Number(form.basePrice) * (1 + margin)).toFixed(2) : '0.00';

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (imageFiles.length + files.length > 6) return alert("El límite máximo es de 6 imágenes por artículo.");
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setPreviews([...previews, ...newPreviews]);
    setImageFiles([...imageFiles, ...files]);
  };

  const removeImage = (index) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const uploadImagesToStorage = async () => {
    const urls = [];
    for (const file of imageFiles) {
      const storageRef = ref(storage, `products/${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      urls.push(url);
    }
    return urls;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (imageFiles.length < 3) return alert("Por favor, sube al menos 3 imágenes para que el cliente pueda ver los detalles.");
    if (inventory.length === 0) return alert("Debes agregar al menos una talla u opción con su cantidad de inventario.");

    setLoading(true);
    try {
      const imageUrls = await uploadImagesToStorage();
      await addDoc(collection(db, 'products'), {
        ...form,
        base_price: Number(form.basePrice),
        public_price: Number(publicPrice),
        inventory: inventory, // Ya incluye size, qty e initial_qty
        images: imageUrls, 
        provider_id: user.uid,
        status: 'pending',
        created_at: new Date()
      });

      alert("Artículo enviado a revisión exitosamente. Zaro Store lo publicará pronto.");
      if(onSuccess) onSuccess();
    } catch (err) {
      alert("Error al procesar el artículo. Verifica tu conexión.");
    }
    setLoading(false);
  };

  return (
    <div className="bg-white p-8 md:p-10 rounded-[3rem] shadow-sm border border-slate-200">
      <h2 className="text-2xl font-black uppercase tracking-tight text-slate-800 mb-6 border-b border-slate-100 pb-4">Registrar Nuevo Artículo</h2>
      
      <form onSubmit={handleSubmit} className="grid lg:grid-cols-2 gap-10">
        
        {/* COLUMNA 1: IMÁGENES Y DESCRIPCIÓN */}
        <div className="space-y-6">
          <div className="relative group">
            <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-slate-300 rounded-[2rem] bg-slate-50 cursor-pointer hover:bg-blue-50 hover:border-blue-400 transition-all">
              <Upload className="text-blue-500 mb-2" size={32} />
              <p className="text-xs font-bold uppercase tracking-widest text-slate-600">Subir Fotografías</p>
              <p className="text-[10px] text-slate-400 uppercase mt-1">Mínimo 3 - Máximo 6 imágenes</p>
              <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageChange} />
            </label>
          </div>

          {previews.length > 0 && (
              <div className="grid grid-cols-3 gap-3">
                {previews.map((url, index) => (
                  <div key={index} className="relative aspect-square rounded-xl overflow-hidden shadow-sm border border-slate-200">
                    <img src={url} className="w-full h-full object-cover" />
                    <button type="button" onClick={() => removeImage(index)} className="absolute top-1 right-1 p-1.5 bg-red-500 text-white rounded-md shadow-md hover:bg-red-600"><X size={12} /></button>
                  </div>
                ))}
              </div>
          )}

          <div className="space-y-2">
             <label className="text-[10px] font-bold uppercase text-slate-500 ml-2">Descripción Detallada</label>
             <textarea 
               className="w-full p-5 bg-slate-50 border border-slate-200 rounded-[1.5rem] h-40 outline-none text-sm font-medium focus:border-blue-500 transition-colors text-slate-900 placeholder-slate-400" 
               placeholder="Escribe el material, estilo, dimensiones, detalles... (Los saltos de línea se respetarán en la tienda)" 
               onChange={e => setForm({...form, description: e.target.value})} 
               required
             />
          </div>
        </div>

        {/* COLUMNA 2: DATOS, PRECIOS E INVENTARIO */}
        <div className="space-y-6">
          
          <div className="space-y-4">
             <div>
                <label className="text-[10px] font-bold uppercase text-slate-500 ml-2 block mb-1">Nombre Comercial del Artículo</label>
                <input className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-sm outline-none focus:border-blue-500 text-slate-900 placeholder-slate-400" placeholder="Ej: Vestido de Noche Estilo..." onChange={e => setForm({...form, name: e.target.value})} required/>
             </div>
             
             <div className="flex gap-4">
               <div className="flex-1">
                  <label className="text-[10px] font-bold uppercase text-slate-500 ml-2 block mb-1">Categoría</label>
                  <input className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-sm outline-none focus:border-blue-500 text-slate-900 placeholder-slate-400" placeholder="Ej: Ropa de Mujer" onChange={e => setForm({...form, category: e.target.value})} required/>
               </div>
               <div className="flex-1">
                  <label className="text-[10px] font-bold uppercase text-slate-500 ml-2 block mb-1">Tiempo de Entrega</label>
                  <input className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-sm outline-none focus:border-blue-500 text-slate-900 placeholder-slate-400" placeholder="Ej: 2 a 4 días" onChange={e => setForm({...form, deliveryTime: e.target.value})} required/>
               </div>
             </div>
          </div>

          <div className="flex gap-4 p-5 bg-slate-900 rounded-[2rem] text-white shadow-lg items-center">
            <div className="flex-1">
              <label className="text-[10px] font-black text-slate-400 uppercase block mb-1">Precio Base (Tu Ganancia)</label>
              <div className="flex items-center gap-2">
                 <span className="text-xl font-black">L</span>
                 <input type="number" className="w-full bg-transparent font-black text-2xl outline-none border-b border-slate-700 focus:border-blue-500" placeholder="0.00" onChange={e => setForm({...form, basePrice: e.target.value})} required/>
              </div>
            </div>
            <div className="w-px h-12 bg-slate-700 mx-2"></div>
            <div className="flex-1 text-right">
              <label className="text-[10px] font-black uppercase text-blue-400 block mb-1">Precio de Venta (Público)</label>
              <p className="text-2xl font-black text-white">L {publicPrice}</p>
            </div>
          </div>

          <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-200 space-y-4">
             <h4 className="text-xs font-black text-slate-700 uppercase flex items-center gap-2"><Package size={16}/> Opciones e Inventario</h4>
             
             <div className="flex gap-2">
                <input value={sizeInput.size} onChange={e => setSizeInput({...sizeInput, size: e.target.value.toUpperCase()})} className="flex-1 p-3 bg-white rounded-xl border border-slate-200 outline-none font-bold text-sm text-slate-900 placeholder-slate-400" placeholder="Talla/Color (Ej: M, Rojo)"/>
                <input value={sizeInput.qty} type="number" onChange={e => setSizeInput({...sizeInput, qty: e.target.value})} className="w-24 p-3 bg-white rounded-xl border border-slate-200 outline-none font-bold text-sm text-slate-900 placeholder-slate-400" placeholder="Cant."/>
                <button type="button" onClick={() => {
                   if(sizeInput.size && Number(sizeInput.qty) > 0) {
                     setInventory([...inventory, { size: sizeInput.size, qty: Number(sizeInput.qty), initial_qty: Number(sizeInput.qty) }]);
                     setSizeInput({size: '', qty: ''});
                   }
                }} className="p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition"><Plus size={18}/></button>
             </div>
             
             <div className="flex flex-wrap gap-2">
                {inventory.map((item, i) => (
                  <div key={i} className="px-3 py-1.5 bg-white rounded-lg border border-slate-200 text-xs font-bold text-slate-700 flex items-center gap-2 shadow-sm">
                    {item.size} <span className="text-slate-300">|</span> {item.qty} unids.
                    <button type="button" onClick={() => setInventory(inventory.filter((_, idx) => idx !== i))} className="text-red-400 hover:text-red-600 ml-1"><X size={14}/></button>
                  </div>
                ))}
             </div>
          </div>

          <button type="submit" disabled={loading} className="w-full py-5 bg-blue-600 text-white rounded-[1.5rem] font-black text-sm uppercase tracking-widest shadow-lg shadow-blue-600/30 hover:bg-blue-700 active:scale-95 transition-all flex justify-center items-center gap-3 disabled:opacity-50">
            {loading ? <><Loader2 className="animate-spin"/> Subiendo Archivos...</> : 'Enviar a Revisión'}
          </button>
        </div>
      </form>
    </div>
  );
}