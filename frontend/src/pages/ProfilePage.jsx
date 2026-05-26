// src/pages/ProfilePage.jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { db, auth, storage } from '../firebase/config';
import { doc, onSnapshot, query, collection, where, orderBy, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { deleteUser, sendPasswordResetEmail, onAuthStateChanged } from 'firebase/auth';
import { 
  Package, Mail, CheckCircle, Truck, RefreshCw, XCircle, Camera, Gift, UserIcon, 
  Save, MapPin, Building, CreditCard, AlertTriangle, ShieldCheck, Key, Star, Trash2, 
  Map, User
} from 'lucide-react';

export function ProfilePage() {
  const [userData, setUserData] = useState(null);
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState('perfil'); // 'perfil', 'direcciones', 'pedidos'
  
    useEffect(() => {
        let unsubscribeUser = () => {};
        let unsubscribeOrders = () => {};

        const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
            if (!user) {
                setUserData(null);
                setOrders([]);
                return;
            }

            // Suscripción al Perfil
            unsubscribeUser = onSnapshot(doc(db, 'users', user.uid), snap => {
                setUserData({ id: snap.id, ...snap.data() });
            });

            // Suscripción a los Pedidos
            const qOrders = query(collection(db, 'orders'), where('client_id', '==', user.uid), orderBy('created_at', 'desc'));
            unsubscribeOrders = onSnapshot(qOrders, snap => {
                setOrders(snap.docs.map(d => ({ id: d.id, ...d.data() })));
            });
        });

        return () => {
            try { unsubscribeAuth(); } catch (e) {}
            try { unsubscribeUser(); } catch (e) {}
            try { unsubscribeOrders(); } catch (e) {}
        };
    }, []);

  const handleProfilePhotoUpload = async (e) => {
    const selectedFile = e.target.files[0];
    if(!selectedFile) return;
    try {
      const photoRef = ref(storage, `userAvatars/${auth.currentUser.uid}`);
      await uploadBytes(photoRef, selectedFile);
      const urlResult = await getDownloadURL(photoRef);
      await updateDoc(doc(db, 'users', userData.id), { photoURL: urlResult });
      alert('¡Foto de perfil actualizada exitosamente!');
    } catch(err) {
      alert("Error al subir la foto. Por favor, revisa tu conexión.");
    }
  }

  const handleCancelOrder = async (orderId) => {
    if(!window.confirm("¿Estás seguro que deseas cancelar este pedido? Esta acción es irreversible.")) return;
    try {
        await updateDoc(doc(db, 'orders', orderId), { 
            status: 'Cancelado', 
            payment_status: 'Cancelado por Cliente' 
        });
        alert("Pedido cancelado exitosamente.");
    } catch(err) {
        alert("Hubo un error al cancelar el pedido.");
    }
  }

  if (!userData) return <div className="p-24 text-center font-black uppercase text-slate-300 italic tracking-[0.4em] animate-pulse">Cargando Perfil...</div>;

  return (
    <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} className="max-w-4xl mx-auto px-4 mt-6 pb-24 font-sans space-y-6">
        
        {/* CABECERA PRINCIPAL */}
        <div className="bg-white rounded-[3rem] border border-slate-100 shadow-xl shadow-blue-500/5 p-8 relative overflow-hidden flex flex-col md:flex-row items-center gap-8 group">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50/60 to-purple-50/30 -z-10" />
            
            <div className="w-28 h-28 md:w-32 md:h-32 bg-slate-100 rounded-full border-4 border-white shadow-lg overflow-hidden relative z-10 cursor-pointer group-hover:scale-[1.02] transition-transform shrink-0">
                <img src={userData.photoURL || `https://ui-avatars.com/api/?name=${userData.name}&background=ec4899&color=fff&size=200`} className="w-full h-full object-cover" alt="Perfil ZORA" />
                <input type="file" onChange={handleProfilePhotoUpload} accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer z-20" title="Cambiar foto de perfil"/>
                <div className="absolute bottom-0 left-0 right-0 bg-slate-900/60 text-white flex justify-center py-1.5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"><Camera size={16}/></div>
            </div>

            <div className="text-center md:text-left flex-1 relative z-10">
                <h2 className="text-3xl font-black italic uppercase tracking-tighter text-slate-800 drop-shadow-sm">{userData.name}</h2>
                <span className="inline-block mt-2 px-4 py-1.5 bg-white shadow-sm border border-slate-100 text-slate-500 text-[10px] font-bold rounded-full tracking-wider"><Mail className="inline mr-2 pb-0.5" size={14}/>{userData.email}</span>
            </div>
        </div>

        {/* NAVEGACIÓN DE PESTAÑAS */}
        <div className="flex bg-slate-100/50 p-1.5 rounded-full overflow-x-auto scrollbar-hide border border-slate-200 shadow-inner">
            <TabButton active={activeTab === 'perfil'} onClick={() => setActiveTab('perfil')} icon={User} text="Mi Perfil" />
            <TabButton active={activeTab === 'direcciones'} onClick={() => setActiveTab('direcciones')} icon={Map} text="Direcciones" />
            <TabButton active={activeTab === 'pedidos'} onClick={() => setActiveTab('pedidos')} icon={Package} text="Mis Pedidos" />
        </div>

        {/* CONTENIDO DE LAS PESTAÑAS */}
        <AnimatePresence mode="wait">
            {activeTab === 'perfil' && (
                <motion.div key="perfil" initial={{opacity:0, x:-20}} animate={{opacity:1, x:0}} exit={{opacity:0, x:20}} className="space-y-6">
                    <PersonalSettingsForm user={userData} />
                </motion.div>
            )}

            {activeTab === 'direcciones' && (
                <motion.div key="direcciones" initial={{opacity:0, x:-20}} animate={{opacity:1, x:0}} exit={{opacity:0, x:20}}>
                    <AddressManager user={userData} />
                </motion.div>
            )}

            {activeTab === 'pedidos' && (
                <motion.div key="pedidos" initial={{opacity:0, x:-20}} animate={{opacity:1, x:0}} exit={{opacity:0, x:20}}>
                    <OrdersList orders={orders} />
                </motion.div>
            )}
        </AnimatePresence>

    </motion.div>
  );
}

// ========================================== COMPONENTES DE PESTAÑAS ====================================== 

function TabButton({ active, onClick, icon: Icon, text }) {
    return (
        <button onClick={onClick} className={`flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-full text-xs font-black uppercase tracking-wider transition-all duration-300 ${active ? 'bg-white text-blue-600 shadow-sm border border-slate-200 scale-100' : 'text-slate-500 hover:bg-slate-200/50 scale-95'}`}>
            <Icon size={16} /> {text}
        </button>
    );
}

// ========================================== SECCIÓN 1: AJUSTES PERSONALES ====================================== 

function PersonalSettingsForm({ user }) {
   const [formData, setFormData] = useState({ name: user.name || '', phone: user.phone || '' });
   const [isLoading, setIsLoading] = useState(false);
   
   const handleSaveProfile = async () => {
      if(!formData.name.trim() || !formData.phone.trim()) return alert("Por favor completa todos los campos.");
      setIsLoading(true);
      try { 
         await updateDoc(doc(db,'users', user.id), { name: formData.name, phone: formData.phone }); 
         alert('Datos personales actualizados correctamente.');
      } catch(error){ alert('Hubo un error al actualizar tus datos.'); }
      setIsLoading(false);
   };

   const handlePasswordReset = async () => {
      if(!window.confirm("¿Deseas recibir un correo para cambiar tu contraseña?")) return;
      try { 
        await sendPasswordResetEmail(auth, user.email); 
        alert("📫 Enlace enviado. Revisa tu bandeja de entrada o carpeta de SPAM.");
      } catch(error) { alert('Error al enviar el correo.'); }
   }

   const handleDeleteAccount = async () => {
      if(!window.confirm("¿Estás completamente seguro de querer ELIMINAR tu cuenta? Esta acción es irreversible.")) return; 
      try { 
        await deleteUser(auth.currentUser); 
        window.location.href='/auth'; 
      } catch(error) { alert("Por seguridad, debes cerrar sesión y volver a entrar antes de eliminar tu cuenta."); }
   }

   return (
      <div className="bg-white p-8 md:p-10 rounded-[3rem] shadow-xl border border-slate-100">
        <h3 className="font-black italic uppercase tracking-tight text-xl border-b border-slate-100 pb-4 mb-6 flex items-center gap-2 text-slate-800">
            <ShieldCheck size={22} className="text-blue-500" /> Mis Datos Personales
        </h3>
        
        <div className="grid md:grid-cols-2 gap-6"> 
           <div className="bg-slate-50 p-4 rounded-[1.5rem] border border-slate-200 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100 transition">
              <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider pl-2 block mb-1">Nombre Completo:</label>
              <input value={formData.name} onChange={(e)=>setFormData({...formData, name: e.target.value})} type="text" className="w-full bg-transparent font-bold text-sm text-slate-900 outline-none p-1 pl-2" placeholder="Tu nombre" />
           </div>
           
           <div className="bg-slate-50 p-4 rounded-[1.5rem] border border-slate-200 focus-within:border-purple-300 focus-within:ring-2 focus-within:ring-purple-100 transition">
              <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider pl-2 block mb-1">Teléfono (WhatsApp):</label>
              <input value={formData.phone} onChange={(e)=>setFormData({...formData, phone: e.target.value})} type="tel" className="w-full bg-transparent font-bold text-sm text-slate-900 outline-none p-1 pl-2" placeholder="Ej: 9999-9999" />
           </div>
        </div> 

        <div className="mt-8 border-t border-slate-100 pt-6 space-y-4">
            <h4 className="font-black text-slate-800 uppercase text-sm flex gap-2 items-center"><Key size={16} className="text-purple-500" /> Seguridad y Contraseña</h4>
            <div className="bg-slate-50 border border-slate-200 p-5 rounded-[2rem] flex flex-col md:flex-row md:items-center justify-between gap-4">
               <div>
                   <p className="text-sm font-bold text-slate-800">Cambiar Contraseña</p> 
                   <p className="text-xs text-slate-500 mt-1">Te enviaremos un enlace seguro a tu correo electrónico.</p>
                </div>
               <button onClick={handlePasswordReset} className="bg-slate-900 text-white hover:bg-slate-800 font-bold text-xs uppercase py-3 px-6 rounded-full transition whitespace-nowrap">
                   Enviar Enlace
               </button>
            </div>
        </div>

        <button disabled={isLoading} onClick={handleSaveProfile} className="w-full mt-8 py-5 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition active:scale-[0.98] flex items-center justify-center font-black uppercase text-xs tracking-wider gap-2 disabled:opacity-50">
            <Save size={18}/> Guardar Cambios
        </button>

        <button onClick={handleDeleteAccount} className="w-full text-center mt-6 text-[10px] uppercase font-bold text-red-500 opacity-80 hover:opacity-100 transition flex items-center justify-center gap-1">
            <Trash2 size={14}/> Eliminar mi cuenta permanentemente
        </button>
      </div>
   );
}

// ========================================== SECCIÓN 2: DIRECCIONES ====================================== 

function AddressManager({ user }) { 
  const userAddresses = user?.addresses || []; 
  const hnDepartments = ["Atlántida","Choluteca","Colón","Comayagua","Copán","Cortés","El Paraíso","Francisco Morazán","Gracias a Dios","Intibucá","Islas de la Bahía","La Paz","Lempira","Ocotepeque","Olancho","Santa Bárbara","Valle","Yoro"];

  const [addressForm, setAddressForm] = useState({ department: '', city: '', phone: '', addressRef: '', receiverName: '' }); 

  const handleAddAddress = async () => { 
     if(!addressForm.department || !addressForm.receiverName || !addressForm.city || !addressForm.addressRef || !addressForm.phone) {
         return alert("Por favor, llena todos los campos de la dirección."); 
     }
     
     const isFirstAddress = userAddresses.length === 0;

     const newAddresses = [
        ...userAddresses, { 
           id: Date.now(), 
           isDefault: isFirstAddress, 
           dept: addressForm.department, 
           city: addressForm.city, 
           phone: addressForm.phone, 
           street: addressForm.addressRef, 
           name: addressForm.receiverName 
        }
     ]; 
     
     await updateDoc(doc(db,'users', user.id), { addresses: newAddresses }); 
     alert("¡Dirección agregada exitosamente!");
     setAddressForm({ department:'', city:'', phone:'', addressRef:'', receiverName:'' });
  }

  const handleDeleteAddress = (idToDelete) => {
    if(!window.confirm("¿Estás seguro de eliminar esta dirección?")) return; 
    const filtered = userAddresses.filter(addr => addr.id !== idToDelete);
    updateDoc(doc(db,'users',user.id), { addresses: filtered });
  }

  const handleSetDefaultAddress = async (idToSet) => {
      const updatedAddresses = userAddresses.map(addr => ({
         ...addr,
         isDefault: addr.id === idToSet 
      }));
      await updateDoc(doc(db,'users', user.id), { addresses: updatedAddresses }); 
  };

  return ( 
   <div className="bg-white rounded-[3rem] shadow-xl p-8 md:p-10 border border-slate-100">
      
      <div className="border-b border-slate-100 pb-4 mb-6">
        <h3 className="font-black italic uppercase tracking-tight text-xl text-slate-800 flex items-center gap-2">
            <MapPin size={22} className="text-pink-500"/> Mis Direcciones de Envío
        </h3>
        <p className="text-xs text-slate-500 mt-1">Gestiona las direcciones donde quieres recibir tus paquetes.</p> 
      </div>

      {/* LISTA DE DIRECCIONES GUARDADAS */}
      <div className="space-y-4 mb-8">
         {userAddresses.length === 0 ? (
             <div className="py-10 bg-slate-50 rounded-[2rem] border border-dashed border-slate-200 text-center text-sm font-bold text-slate-400">
                 No tienes direcciones guardadas.
             </div>
         ) : 
           userAddresses.map(addr =>(
             <div key={addr.id} className={`p-5 rounded-[2rem] flex flex-col md:flex-row md:items-center justify-between group transition border-2 ${addr.isDefault ? 'border-pink-500 bg-pink-50/30' : 'border-slate-100 bg-white hover:border-slate-300'}`}>
                 
                 <div className="flex-1 cursor-pointer" onClick={() => handleSetDefaultAddress(addr.id)}>
                   <div className="flex items-center gap-3 mb-1">
                      <p className="text-[10px] uppercase font-bold text-slate-500 flex items-center gap-1">
                          <MapPin size={12} className="text-slate-400"/> {addr.dept}
                      </p> 
                      {addr.isDefault && <span className="text-[9px] font-black uppercase tracking-wider bg-pink-500 text-white px-2 py-0.5 rounded flex items-center gap-1"><Star size={10} fill="white"/> Principal</span>}
                   </div>
                   <p className="text-sm font-bold text-slate-800 mt-1">{addr.city} - {addr.street}</p> 
                   <span className="text-[11px] mt-2 inline-flex font-medium text-slate-600 bg-slate-100 px-3 py-1 rounded-full items-center gap-2">
                       <UserIcon size={12}/> Recibe: {addr.name} | Tel: {addr.phone}
                   </span>
                 </div>

                 <div className="mt-4 md:mt-0 flex gap-2 w-full md:w-auto items-stretch justify-end pt-4 md:pt-0 border-t border-slate-100 md:border-none">
                    {!addr.isDefault && <button onClick={() => handleSetDefaultAddress(addr.id)} className="text-[10px] flex-1 font-bold uppercase text-slate-600 bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-xl transition">Hacer Principal</button>}
                    <button onClick={() => handleDeleteAddress(addr.id)} className="bg-red-50 text-red-500 hover:bg-red-500 hover:text-white p-3 rounded-xl transition flex justify-center items-center shrink-0"><Trash2 size={16}/></button> 
                 </div>

             </div>
         ))}
      </div>

      {/* FORMULARIO NUEVA DIRECCIÓN */}
      <div className="bg-slate-50 rounded-[2rem] p-6 border border-slate-200 space-y-4"> 
           <h4 className="font-bold text-sm uppercase text-slate-700 mb-4 flex items-center gap-2">
               <span className="bg-blue-100 text-blue-600 p-1.5 rounded-lg"><MapPin size={16}/></span> Agregar Nueva Dirección
           </h4>
           
           <input value={addressForm.receiverName} onChange={(e)=>setAddressForm({...addressForm, receiverName: e.target.value})} placeholder="Nombre de quien recibe el paquete" className="bg-white border border-slate-200 focus:border-blue-500 w-full p-4 rounded-2xl text-sm outline-none transition" /> 
           
           <div className="grid md:grid-cols-2 gap-4">
               <select value={addressForm.department} onChange={(e)=>setAddressForm({...addressForm, department: e.target.value})} className="bg-white border border-slate-200 p-4 rounded-2xl text-sm outline-none focus:border-blue-500">
                 <option value="" disabled>Selecciona el Departamento</option>
                 {hnDepartments.map(dept => <option key={dept} value={dept}>{dept}</option>)}
               </select>

               <input value={addressForm.city} onChange={(e)=>setAddressForm({...addressForm, city: e.target.value})} placeholder="Ciudad o Municipio" className="bg-white border border-slate-200 w-full p-4 rounded-2xl text-sm outline-none focus:border-blue-500 transition" />
           </div>

           <div className="grid md:grid-cols-[1fr,2fr] gap-4">
              <input type="tel" value={addressForm.phone} onChange={(e)=>setAddressForm({...addressForm, phone: e.target.value})} placeholder="Teléfono de contacto" className="bg-white w-full p-4 rounded-2xl text-sm outline-none border border-slate-200 focus:border-blue-500"/> 
              <input value={addressForm.addressRef} onChange={(e)=>setAddressForm({...addressForm, addressRef: e.target.value})} placeholder="Dirección exacta (Barrio, Calle, Referencia)" className="bg-white w-full p-4 border border-slate-200 rounded-2xl text-sm outline-none focus:border-blue-500" />
           </div>

           <button onClick={handleAddAddress} className="w-full bg-slate-900 text-white py-4 font-bold uppercase text-xs rounded-2xl mt-4 hover:bg-slate-800 transition flex items-center justify-center gap-2">
               Guardar Dirección
           </button> 
       </div>
   </div>
  );
}

// ========================================== SECCIÓN 3: PEDIDOS ====================================== 

function OrdersList({ orders }) {
    
    // Función auxiliar para calcular el nivel de progreso del pedido
    const getOrderTimelineLevel = (statusString) => {
        const status = (statusString || '').toLowerCase();
        if(status.includes('deposit') || status.includes('pend') || status.includes('veri') || status.includes('espe')) return { level: 1 };
        if(status.includes('prepa') || status.includes('empa') || status.includes('valid')) return { level: 2 };
        if(status.includes('cami') || status.includes('ruta') || status.includes('transit')) return { level: 3 };
        if(status.includes('complet') || status.includes('entreg') || status.includes('fin')) return { level: 4 };
        if(status.includes('cancel') || status.includes('declin') || status.includes('elimin')) return { level: -1 };
        return { level: 1 };
     }

    if(orders.length === 0) {
        return (
            <div className="p-20 text-center bg-white border border-slate-100 rounded-[3rem] shadow-sm flex flex-col justify-center items-center">
                <Package size={60} className="text-slate-200 mb-4" />
                <h3 className="font-black uppercase tracking-tight text-slate-800 text-xl mb-2">Aún no tienes pedidos</h3>
                <p className="text-sm text-slate-500">Explora la tienda y realiza tu primera compra.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {orders.map(order => {
                const statusData = getOrderTimelineLevel(order.status);
                const isPendingBank = order.payment_status?.toLowerCase().includes('pend') && statusData.level > -1; 
                
                // Mantenemos compatibilidad con los campos antiguos por si la base de datos los sigue usando
                const invoiceTotal = order.balancePendingFinalyParaDeybDasVariaHondrasAppDnsYysAsAyaaa || order.total || 0;
                const paidAccumulated = order.abonosRegistraodsAperturaRealHystotTiksData || order.amountPaid || 0;
                const owedAmount = (invoiceTotal - paidAccumulated).toFixed(0);

                return(
                <div key={order.id} className="bg-white rounded-[3rem] shadow-lg mb-8 border border-slate-100 overflow-hidden relative">
                    
                    {/* ALERTA DE TRANSFERENCIA */}
                    {isPendingBank && (
                        <div className="bg-yellow-50 p-6 relative border-b border-yellow-200 flex flex-col md:flex-row gap-5 items-center md:items-start">
                            <AlertTriangle size={40} className="text-yellow-500 shrink-0"/>
                            <div className="flex-1 space-y-3 w-full">
                                <p className="text-yellow-900 font-bold text-lg leading-tight">Este pedido requiere un depósito para ser procesado.</p>
                                <p className="text-sm text-yellow-800">
                                    Monto pendiente para confirmar despacho: <span className="font-black bg-white px-2 py-1 rounded shadow-sm text-slate-900 ml-1">L {owedAmount}</span>
                                </p>
                                
                                <div className="bg-white border border-yellow-200 rounded-2xl p-4 text-sm grid gap-3 grid-cols-1 md:grid-cols-2 mt-2">
                                    <div className="flex items-center justify-between border-b md:border-b-0 md:border-r border-yellow-100 pb-2 md:pb-0 md:pr-4"> 
                                        <span className="flex items-center gap-2 text-slate-600 font-medium"><CreditCard size={16} className="text-red-500"/> BAC</span> 
                                        <span className="font-bold text-slate-800 select-all">8202949219</span> 
                                    </div>
                                    <div className="flex items-center justify-between pt-2 md:pt-0 md:pl-4"> 
                                        <span className="flex items-center gap-2 text-slate-600 font-medium"><Building size={16} className="text-blue-600"/> FICOHSA</span> 
                                        <span className="font-bold text-slate-800 select-all">098748384</span> 
                                    </div>
                                </div>

                                <button onClick={()=>{
                                    const msgWa = `*✅ COMPROBANTE DE PAGO*%0A*No. Orden:* #${order.order_code}%0A¡Hola Equipo Zora!, adjunto el comprobante de pago por el monto de *L.${owedAmount}*.👇`;
                                    window.open(`https://wa.me/50432545317?text=${msgWa}`,'_blank');
                                }} className="w-full bg-green-500 hover:bg-green-600 transition-colors py-3.5 mt-2 rounded-2xl shadow-md text-white font-bold text-xs uppercase tracking-wider flex justify-center items-center gap-2">
                                    <CheckCircle size={16}/> Reportar pago en WhatsApp
                                </button>
                                {(order.status === 'Verificando Pago' || order.status === 'Solicitado') && statusData.level !== -1 && (
                                    <button 
                                        onClick={() => handleCancelOrder(order.id)} 
                                        className="w-full mt-3 bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-colors py-3 rounded-2xl font-bold text-xs uppercase tracking-wider flex justify-center items-center gap-2">
                                        <XCircle size={16}/> Cancelar mi pedido
                                    </button>
                                )}
                            </div>
                        </div>
                    )}

                    <div className="p-8 md:p-10">
                        {/* CABECERA DEL PEDIDO */}
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-100 pb-6 mb-8">
                            <div>
                                <p className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 inline-block rounded-full mb-2">
                                    Fecha: {order.created_at?.toDate().toLocaleDateString() || 'Reciente'}
                                </p>
                                <h4 className="text-2xl font-black text-slate-800 tracking-tight">Pedido #{order.order_code}</h4>
                                <p className="text-xs text-slate-500 font-medium mt-2 flex items-center gap-2">
                                    Estado del sistema: <span className="text-purple-600 font-bold bg-purple-50 px-2 py-1 rounded-lg border border-purple-100 uppercase">{order.status || 'En Revisión'}</span>
                                </p>
                            </div>
                            
                            <div className="bg-slate-900 text-white p-5 rounded-2xl text-right md:min-w-[200px]">
                                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Total a Pagar</p>
                                <p className="text-3xl font-black text-white">L {invoiceTotal.toFixed(0)}</p>
                                {paidAccumulated > 0 && <p className="text-green-400 text-xs font-bold mt-2">Abonado: L {paidAccumulated}</p>}
                            </div>
                        </div>

                        {/* LÍNEA DE TIEMPO (TRACKING) */}
                        {statusData.level === -1 ? (
                            <div className="bg-red-50 border border-red-100 p-6 rounded-2xl flex flex-col items-center my-8 text-center">
                                <XCircle size={40} className="text-red-500 mb-3"/>
                                <p className="font-bold text-red-600 uppercase text-lg">Pedido Cancelado</p>
                                <p className="text-sm text-red-500 mt-1">Si crees que es un error o necesitas un reembolso, contáctanos por WhatsApp.</p>
                            </div>
                        ) : (
                            <div className="relative mt-8 mb-12 px-2 md:px-8 w-full mx-auto">
                                <div className="absolute top-[20px] left-[10%] right-[10%] h-1.5 bg-slate-100 rounded-full" />
                                <div className="absolute top-[20px] left-[10%] right-[10%] h-1.5 overflow-hidden rounded-full">
                                    <motion.div initial={{width:0}} animate={{width:`${((statusData.level - 1) / 3)*100}%`}} className="h-full bg-blue-500"/>
                                </div>
                                <div className="relative flex justify-between z-10 w-full text-center items-start gap-2">
                                    <StepIcon level={statusData.level} targetLevel={1} icon={RefreshCw} text="En Revisión" />
                                    <StepIcon level={statusData.level} targetLevel={2} icon={Package} text="En Bodega" />
                                    <StepIcon level={statusData.level} targetLevel={3} icon={Truck} text="En Camino" />
                                    <StepIcon level={statusData.level} targetLevel={4} icon={CheckCircle} text="Entregado" />
                                </div>
                            </div>
                        )}

                        {/* LISTA DE ARTÍCULOS */}
                        <div className="bg-slate-50 border border-slate-200 rounded-[2rem] p-6">
                            <div className="flex justify-between items-center mb-4 border-b border-slate-200 pb-3">
                                <p className="text-xs font-bold uppercase text-slate-600 flex items-center gap-2">
                                    <Gift size={16} className="text-purple-500"/> Artículos del Pedido
                                </p> 
                                <span className="bg-white text-slate-600 border border-slate-200 font-bold px-3 py-1 rounded-lg text-[10px] uppercase">
                                    Modalidad: {order.payment_modality || 'Directo'}
                                </span>
                            </div>

                            <div className="space-y-3">
                                {order.items?.map((item, idx) => (
                                    <div key={idx} className="flex gap-4 p-3 bg-white border border-slate-100 rounded-2xl items-center">
                                        <img src={item.images?.[0] || 'https://via.placeholder.com/150'} className="w-16 h-16 rounded-xl object-cover border border-slate-100 shrink-0" alt="Producto" /> 
                                        <div className="flex-1 min-w-0"> 
                                            <h5 className="font-bold text-sm text-slate-800 truncate">{item.name}</h5> 
                                            <p className="text-xs text-slate-500 mt-1">Talla: {item.selectedSize || 'N/A'} | Cantidad: {item.quantity}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-black text-slate-800 text-sm">L {(item.public_price * item.quantity).toFixed(0)}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>
                </div>
            )})}
        </div>
    );
}

// Micro-componente para los iconos de la línea de tiempo
function StepIcon({ level, targetLevel, icon: Icon, text }) {
   const isCompleted = level >= targetLevel;
   return(
     <div className="flex flex-col items-center w-full z-10 shrink min-w-0 transition-transform">
        <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full border-[4px] flex justify-center items-center transition-all duration-500 z-20 ${isCompleted ? 'border-blue-500 bg-blue-500 text-white shadow-lg' : 'border-slate-200 bg-white text-slate-300'}`}> 
           <Icon size={isCompleted ? 20 : 16} />
        </div>
        <span className={`text-[10px] mt-3 font-bold block w-[80px] text-center ${isCompleted ? 'text-blue-700' : 'text-slate-400'}`}>{text}</span>
     </div>
   );
}