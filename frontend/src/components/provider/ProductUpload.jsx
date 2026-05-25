import React, { useState, useEffect } from 'react';
import { db, storage } from '../../firebase/config'; // Asegúrate que config exporte 'storage'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, doc, getDoc } from 'firebase/firestore';
import { Upload, Trash2, Image as ImageIcon, Info, Plus, X, Loader2 } from 'lucide-react';

export function ProductUpload({ user }) {
  const [loading, setLoading] = useState(false);
  const [margin, setMargin] = useState(0.20);
  const [form, setForm] = useState({ name: '', basePrice: 0, category: '', description: '', deliveryTime: '' });
  
  // ESTADOS PARA IMÁGENES
  const [imageFiles, setImageFiles] = useState([]); // Archivos reales
  const [previews, setPreviews] = useState([]); // URLs temporales para verlas en el diseño
  
  const [sizeInput, setSizeInput] = useState({ size: '', qty: 0 });
  const [inventory, setInventory] = useState([]);

  // Cargar margen del admin
  useEffect(() => {
    const fetchRules = async () => {
      const docSnap = await getDoc(doc(db, 'system_rules', 'pricing'));
      if (docSnap.exists()) setMargin(docSnap.data().admin_margin);
    };
    fetchRules();
  }, []);

  const publicPrice = (Number(form.basePrice) * (1 + margin)).toFixed(2);

  // MANEJO DE SELECCIÓN DE IMÁGENES
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    
    if (imageFiles.length + files.length > 6) {
      return alert("El máximo son 6 imágenes por producto");
    }

    const newPreviews = files.map(file => URL.createObjectURL(file));
    setPreviews([...previews, ...newPreviews]);
    setImageFiles([...imageFiles, ...files]);
  };

  const removeImage = (index) => {
    const newFiles = [...imageFiles];
    const newPreviews = [...previews];
    newFiles.splice(index, 1);
    newPreviews.splice(index, 1);
    setImageFiles(newFiles);
    setPreviews(newPreviews);
  };

  // FUNCIÓN PARA SUBIR IMÁGENES A FIREBASE STORAGE
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
    if (imageFiles.length < 3) return alert("Debes subir al menos 3 imágenes");
    if (inventory.length === 0) return alert("Agrega al menos una talla y su stock");

    setLoading(true);
    try {
      // 1. Subir fotos y obtener links reales
      const imageUrls = await uploadImagesToStorage();

      // 2. Guardar en Firestore
      await addDoc(collection(db, 'products'), {
        ...form,
        base_price: Number(form.basePrice),
        public_price: Number(publicPrice),
        inventory,
        images: imageUrls, // Aquí se guardan los links de Firebase
        provider_id: user.uid,
        status: 'pending',
        created_at: new Date()
      });

      alert("Producto enviado con éxito. Pendiente de aprobación por Zaro Store.");
      window.location.reload(); // Limpiar todo
    } catch (err) {
      console.error(err);
      alert("Error al subir el producto.");
    }
    setLoading(false);
  };

  return (
    <div className="max-w-6xl mx-auto p-10 bg-white rounded-[3rem] shadow-2xl border border-slate-50 mt-10">
      <header className="mb-10 text-center">
        <h2 className="text-4xl font-black italic tracking-tighter uppercase">Publicar en Zaro Store</h2>
        <p className="text-slate-400 text-xs font-black uppercase tracking-[0.3em] mt-2 italic">Flujo de revisión de Marketplace</p>
      </header>

      <form onSubmit={handleSubmit} className="grid lg:grid-cols-2 gap-12 text-slate-900">
        
        {/* COLUMNA IZQUIERDA: IMÁGENES */}
        <div className="space-y-6">
          <div className="relative group">
            <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-slate-200 rounded-[2.5rem] bg-slate-50 cursor-pointer hover:bg-blue-50 hover:border-blue-200 transition-all">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload className="text-slate-400 mb-2" size={40} />
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Seleccionar Fotos</p>
                <p className="text-[8px] text-slate-400 uppercase mt-1">Mín 3 / Máx 6 imágenes</p>
              </div>
              <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageChange} />
            </label>
          </div>

          {/* GRID DE PREVIEW DE IMÁGENES */}
          <div className="grid grid-cols-3 gap-4">
            {previews.map((url, index) => (
              <div key={index} className="relative aspect-square rounded-2xl overflow-hidden shadow-md">
                <img src={url} className="w-full h-full object-cover" />
                <button type="button" onClick={() => removeImage(index)} className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full">
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>

          <textarea 
            className="w-full p-6 bg-slate-50 rounded-[2rem] h-40 outline-none text-sm font-medium border-2 border-transparent focus:border-blue-100 transition-all" 
            placeholder="Descripción detallada: material, estilo, por qué comprarlo..." 
            onChange={e => setForm({...form, description: e.target.value})} 
            required
          />
        </div>

        {/* COLUMNA DERECHA: DATOS Y STOCK */}
        <div className="space-y-6">
          <input className="w-full p-5 bg-slate-50 rounded-2xl font-bold outline-none" placeholder="Nombre del Artículo" onChange={e => setForm({...form, name: e.target.value})} required/>
          
          <div className="flex gap-4">
            <div className="flex-1 p-5 bg-slate-900 rounded-[2rem] text-white">
              <label className="text-[9px] font-black text-white/40 uppercase">Tu Precio Base (L.)</label>
              <input type="number" className="w-full bg-transparent font-black text-2xl outline-none" placeholder="0.00" onChange={e => setForm({...form, basePrice: e.target.value})} required/>
            </div>
            <div className="flex-1 p-5 bg-blue-50 rounded-[2rem] text-blue-600 border border-blue-100">
              <label className="text-[9px] font-black uppercase opacity-60">Precio Público (+{margin*100}%)</label>
              <p className="text-2xl font-black italic">L {publicPrice}</p>
            </div>
          </div>

          {/* STOCK POR TALLAS */}
          <div className="bg-slate-50 p-8 rounded-[2.5rem] space-y-4 border border-slate-100">
             <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Inventario por Talla</h4>
             <div className="flex gap-2">
                <input value={sizeInput.size} onChange={e => setSizeInput({...sizeInput, size: e.target.value.toUpperCase()})} className="flex-1 p-4 bg-white rounded-xl border border-slate-100 outline-none font-bold" placeholder="Talla"/>
                <input value={sizeInput.qty} type="number" onChange={e => setSizeInput({...sizeInput, qty: Number(e.target.value)})} className="w-20 p-4 bg-white rounded-xl border border-slate-100 outline-none font-bold" placeholder="Cant."/>
                <button type="button" onClick={() => {
                   if(sizeInput.size && sizeInput.qty > 0) {
                     setInventory([...inventory, sizeInput]);
                     setSizeInput({size: '', qty: 0});
                   }
                }} className="p-4 bg-slate-900 text-white rounded-xl"><Plus size={20}/></button>
             </div>
             <div className="flex flex-wrap gap-2">
                {inventory.map((item, i) => (
                  <div key={i} className="px-4 py-2 bg-white rounded-full border border-slate-200 text-[10px] font-black uppercase flex items-center gap-3 shadow-sm">
                    {item.size} <span className="text-blue-500">—</span> {item.qty} Unidades
                    <X size={14} className="cursor-pointer text-red-300" onClick={() => setInventory(inventory.filter((_, idx) => idx !== i))}/>
                  </div>
                ))}
             </div>
          </div>

          <div className="flex gap-4">
             <input className="flex-1 p-5 bg-slate-50 rounded-2xl outline-none text-sm font-bold" placeholder="Categoría" onChange={e => setForm({...form, category: e.target.value})} required/>
             <input className="flex-1 p-5 bg-slate-50 rounded-2xl outline-none text-sm font-bold" placeholder="Tiempo entrega (ej: 2-3 días)" onChange={e => setForm({...form, deliveryTime: e.target.value})} required/>
          </div>

          <button type="submit" disabled={loading} className="w-full py-6 bg-blue-600 text-white rounded-[2.5rem] font-black text-xl uppercase tracking-tighter shadow-2xl shadow-blue-100 flex items-center justify-center gap-4 transition-all active:scale-95 disabled:opacity-50">
            {loading ? <><Loader2 className="animate-spin"/> Procesando...</> : 'Enviar para Aprobación'}
          </button>
        </div>
      </form>
    </div>
  );
}