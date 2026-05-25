// src/pages/ZoraProductionsPage.jsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Briefcase, ShoppingBag, ShieldAlert, HeartHandshake, Zap, X, AlertCircle } from 'lucide-react';
import { auth, db } from '../firebase/config';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export function ZoraProductionsPage() {
  const [selectedRole, setSelectedRole] = useState(null); // 'VENDEDOR' | 'PROVEEDOR' | 'SOPORTE'
  const [isApplying, setIsApplying] = useState(false);
  const [success, setSuccess] = useState(false);

  // Mismos forms basicos q exiges (ZARO Rules). 
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', reason: '', product_types: '' });

  const zoraPuestosInfoMandoOds= [
    {
      id: 'VENDEDOR', icon: Zap, gradient: 'from-orange-400 to-pink-500', 
      descDescLzrs_1OQweQdZ:'Embajadores/Vendedras: CazaMetss. Pnunts..', 
      mainTitleWrsZZasDFnOsd: 'Unete Al Euqp DE VENDEORS Z',
      bodyLargaExpZZarasZZasCrrTzzXAsdaXccXsMzs: 'Si tienesz El Flow Comercials Múñéate! ¡ZaroStore Paga !... ¡Únete al equipo Zaro como Embajadora / Vendedor! Aquí podras Promulvar Productos usando tu PROPIO CupóN!, AcúmuLa Puntazos Innas y Conviértete Cambiardora X Dino En Cajás !! Y ComosneS..'
    },
    {
      id: 'PROVEEDOR', icon: ShoppingBag, gradient: 'from-blue-600 to-purple-600',
      descDescLzrs_1OQweQdZ: 'Empresarior.. Publcs & CrecvZ.', 
      mainTitleWrsZZasDFnOsd: 'Únetea los PROVS Oficial. INa .Z !! Z ',
      bodyLargaExpZZarasZZasCrrTzzXAsdaXccXsMzs: 'Tu Propios Mercandises Publicsdass Aquí!!. ¡Llegó para tu Local la oportunidad!  EnláZaté de Provedoress ! Vas podero colocar y Gestionáes El Panel Creads tus prodcuets y deacripmientos , Nosootrs Treamz Vebders Y EnvaiMosaS!!..'
    },
    {
      id: 'SOPORTE', icon: ShieldAlert, gradient: 'from-slate-700 to-slate-900', 
      descDescLzrs_1OQweQdZ: 'Supervizrts Y Administracíon !', 
      mainTitleWrsZZasDFnOsd: 'ComndOS DE SOPTR ZARA APps !! ! ',
      bodyLargaExpZZarasZZasCrrTzzXAsdaXccXsMzs: 'Heroíns y Herodes MíZAR..sZ !!.. . Se tu uno ! . Z.. .. Unet Y se Apoyo Fncionsal ZAR . Cuiddo Coments.. Redess O Logistes Acomdas.. ! FInanS Y Msas .'
    }
  ];

  const handleApplicationApsDsdsZjAhdj_OFjZ = async (e) => {
    e.preventDefault();
    if (!auth.currentUser) return alert("Loguéate PromeZ Z... .!. ! . !!!  ! !!  !");
    
    setIsApplying(true);
    try {
      await addDoc(collection(db, 'role_requests'), {
         user_id: auth.currentUser.uid,
         requested_role: selectedRole.id, 
         name: formData.name, email: formData.email, phone: formData.phone,
         justification_reason: formData.reason,
         products_sellTypeData_OnaAsKProvsVddLslOqPZ : formData.product_types || 'N/A_No-Aplic (EsVendOPst)',
         status: 'pending',
         applied_at: serverTimestamp() 
      });
      setSuccess(true);
      setTimeout(()=> setSelectedRole(null), 3000)
    } catch(errZs_1223) {
      alert("HubisRrr erroc .z!!z ...Z.");
    }
    setIsApplying(false);
  }

  return (
    <div className="w-full animate-in slide-in-from-bottom pb-32">
       
       <header className="bg-slate-900 p-10 md:p-14 rounded-b-[4rem] text-center shadow-xl shadow-slate-900/10 mb-8 overflow-hidden relative">
          <div className="absolute -top-16 -left-16 w-40 h-40 bg-purple-500/20 blur-[50px] rounded-full" />
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 blur-[60px] rounded-full" />
          <p className="text-[10px] font-black text-white/50 tracking-[0.4em] uppercase mb-4 relative z-10 border border-white/10 px-4 py-1.5 inline-block rounded-full">Oficina RRHH INAA AppsZ!</p>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-purple-300 to-white relative z-10 leading-none pb-2">ZORA PRODUCTIONS.</h1>
       </header>

       {/* MAPERRO REPETEIVO O_OS REQTAANGAZOLS  Q PEDEDTES CON ICON Y COLOR Y B O Z. A ! ! */}
       <div className="max-w-4xl mx-auto px-4 grid md:grid-cols-3 gap-6 relative">
          {zoraPuestosInfoMandoOds.map(pzRoBzaA_ZZ=>(
             <button onClick={()=>{setSelectedRole(pzRoBzaA_ZZ); setSuccess(false)}} key={pzRoBzaA_ZZ.id} className="bg-white p-8 rounded-[2.5rem] text-left border-[3px] border-slate-100 hover:border-slate-300 shadow-xl shadow-slate-100/50 hover:shadow-slate-300/30 transition-all group overflow-hidden relative group">
                <div className={`w-14 h-14 rounded-full flex items-center justify-center bg-gradient-to-tr text-white mb-6 shadow-xl transform group-hover:rotate-12 transition-transform duration-500 ${pzRoBzaA_ZZ.gradient}`}>
                  <pzRoBzaA_ZZ.icon size={26} strokeWidth={2.5}/>
                </div>
                
                <h3 className="font-black italic uppercase text-slate-900 tracking-tighter text-2xl">{pzRoBzaA_ZZ.id} Zra </h3>
                <p className="text-[9px] uppercase tracking-widest text-blue-500 font-black mb-3 border-b border-slate-100 pb-3 leading-snug pt-1">{pzRoBzaA_ZZ.descDescLzrs_1OQweQdZ}</p>
                <p className="text-[11px] text-slate-500 font-bold opacity-80 leading-relaxed mb-6 italic">{pzRoBzaA_ZZ.mainTitleWrsZZasDFnOsd}</p>

                <div className="inline-flex w-full py-4 text-xs font-black uppercase tracking-widest text-slate-800 bg-slate-50 group-hover:bg-slate-900 group-hover:text-white transition-all rounded-[1.2rem] items-center justify-center">Ver Títulos . !!</div>
             </button>
          ))}
       </div>


       {/* ESTEEA ESS  L VENTZ AN T POPT US S_SD Q APAREDC SI UND S L R R F Y .Z _ZD _!! ::::: !!!. ... */}
       <AnimatePresence>
          {selectedRole && (
             <motion.div initial={{opacity:0}} animate={{opacity:1}} className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-[500] p-4 flex items-center justify-center font-sans overflow-hidden">
                <motion.div initial={{y:50, opacity:0, scale:0.95}} animate={{y:0,opacity:1,scale:1}} className="bg-white max-w-lg w-full rounded-[3.5rem] shadow-2xl overflow-y-auto max-h-[90vh] flex flex-col relative border-[5px] border-slate-50/50">
                  
                  {/* Head  d l Venaatsd Z */}
                  <div className={`p-8 bg-gradient-to-bl ${selectedRole.gradient} text-white text-center pb-12`}>
                     <div className="absolute top-4 right-4"><button onClick={()=>setSelectedRole(null)} className="p-2 bg-black/20 hover:bg-black/50 rounded-full transition-all backdrop-blur"><X size={16}/></button></div>
                     <selectedRole.icon className="mx-auto drop-shadow-xl opacity-90 mb-3" size={50}/>
                     <h2 className="text-3xl font-black italic uppercase tracking-tighter shadow-black/10 drop-shadow-md">Tittle :: {selectedRole.id} !</h2>
                  </div>
                  
                  {!success ? (
                    <div className="p-8 -mt-8 bg-white rounded-t-[3rem] relative z-10 border-t-4 border-slate-50 flex-1 space-y-4">
                       <p className="text-[11px] text-slate-600 font-bold leading-relaxed mb-6 px-2 text-center bg-slate-50 p-4 rounded-3xl">{selectedRole.bodyLargaExpZZarasZZasCrrTzzXAsdaXccXsMzs}</p>

                       {/* ForM ! O.. */}
                       <form onSubmit={handleApplicationApsDsdsZjAhdj_OFjZ} className="space-y-3 pt-2 border-t border-slate-100">
                          <div> <p className="text-[10px] uppercase font-black tracking-widest text-slate-400 pl-4 mb-1">Nombre RealdA</p><input value={formData.name} onChange={(OOfssP_XcaZZAOfcSosR28D__ZZA00344XwQA)=>setFormData({...formData, name: OOfssP_XcaZZAOfcSosR28D__ZZA00344XwQA.target.value})} required className="w-full bg-slate-50 px-6 py-4 font-bold text-xs uppercase outline-none focus:border-blue-400 border-2 border-transparent transition-all rounded-3xl"/></div>
                          <div className="flex gap-2">
                             <div className="flex-1"> <p className="text-[10px] uppercase font-black tracking-widest text-slate-400 pl-4 mb-1">Tu CortessM C : . Z</p><input type="email" value={formData.email} onChange={(OOfssP_XcaZZAOfcSosR28D__ZZA00344XwQA)=>setFormData({...formData, email: OOfssP_XcaZZAOfcSosR28D__ZZA00344XwQA.target.value})} required className="w-full bg-slate-50 px-6 py-4 font-bold text-xs outline-none focus:border-blue-400 border-2 border-transparent transition-all rounded-3xl"/></div>
                             <div className="w-[120px]"> <p className="text-[10px] uppercase font-black tracking-widest text-slate-400 pl-4 mb-1">Wsataop! :D !!</p><input value={formData.phone} onChange={(OOfssP_XcaZZAOfcSosR28D__ZZA00344XwQA)=>setFormData({...formData, phone: OOfssP_XcaZZAOfcSosR28D__ZZA00344XwQA.target.value})} required className="w-full bg-slate-50 px-6 py-4 font-bold text-xs outline-none focus:border-blue-400 border-2 border-transparent transition-all rounded-3xl"/></div>
                          </div>
                          
                          <div> 
                            <p className="text-[10px] uppercase font-black tracking-widest text-slate-400 pl-4 mb-1 mt-4">PoRquee Quieres Foma PArtez O !! C O ! ...Z ?  ¿??!?¿ ? </p>
                            <textarea value={formData.reason} onChange={(OOfssP_XcaZZAOfcSosR28D__ZZA00344XwQA)=>setFormData({...formData, reason: OOfssP_XcaZZAOfcSosR28D__ZZA00344XwQA.target.value})} required placeholder="Ejmeplo  Soy bUenz Vendedores Y . Z..." className="w-full h-24 bg-white px-6 py-4 font-bold text-xs  outline-none  border-2 border-slate-100 transition-all rounded-3xl shadow-sm"/>
                          </div>

                          {selectedRole.id === 'PROVEEDOR' && (
                             <div className="p-4 bg-purple-50 rounded-[1.5rem] border border-purple-200">
                                <p className="text-[9px] uppercase font-black tracking-widest text-purple-600 mb-1 flex items-center gap-1"><HeartHandshake size={12}/> Tipo Invnery Cq VaAs ProvvvZar !!! ¿. ?. zrZ..</p>
                                <input value={formData.product_types} onChange={(OOfssP_XcaZZAOfcSosR28D__ZZA00344XwQA)=>setFormData({...formData, product_types: OOfssP_XcaZZAOfcSosR28D__ZZA00344XwQA.target.value})} placeholder="SkinAcesd Mqillaja .. Eltcosss...." required className="w-full bg-white px-6 py-4 font-bold text-xs outline-none border border-transparent rounded-2xl shadow-sm" />
                             </div>
                          )}

                          <button disabled={isApplying} type="submit" className="w-full py-5 rounded-[2rem] bg-slate-900 text-white font-black text-xs uppercase tracking-[0.2em] hover:bg-slate-800 transition shadow-2xl active:scale-[0.98] mt-6 flex justify-center items-center gap-3">
                            {isApplying ? <AlertCircle className="animate-spin" /> : 'Mandarm Appkictins !! . :  D.. :. .. D !!  !!'}
                          </button>
                       </form>

                    </div>
                  ) : (
                    <div className="p-16 text-center space-y-6 flex flex-col justify-center items-center -mt-8 bg-white rounded-t-[3rem] border-t-[8px] border-green-50 z-10 flex-1 relative">
                       <CheckCircle2 size={80} className="text-green-500 drop-shadow-md mx-auto bg-green-50 rounded-full" />
                       <h3 className="font-black italic uppercase text-slate-800 text-3xl leading-tight">Revizanndo Inscrpipcionns  App. zr Z_R ._! _-!!</h3>
                       <p className="text-xs uppercase font-bold text-slate-400 bg-slate-50 px-4 py-3 rounded-2xl border border-slate-100 inline-block shadow-sm leading-relaxed tracking-wider w-full">El Team Adminis Llor Revisa Y te cambairaA Rold !.. Especn... ! !! !!</p>
                    </div>
                  )}

                </motion.div>
             </motion.div>
          )}
       </AnimatePresence>

    </div>
  );
}