import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { db, auth } from '../firebase/config';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { fetchSignInMethodsForEmail, onAuthStateChanged, sendPasswordResetEmail, sendEmailVerification } from 'firebase/auth';
import { Eye, EyeOff, Globe, Phone, MapPin, ChevronRight, UserCheck, Sparkles, CheckCircle2, Key } from 'lucide-react';

const InputZaro = ({ icon: Icon, name, type = "text", placeholder, value, onChange, autoComplete }) => (
  <div className="relative group w-full shadow-sm">
    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-purple-500 transition-colors"><Icon size={20} /></div>
    <input name={name} type={type} value={value} onChange={onChange} placeholder={placeholder} autoComplete={autoComplete}
      className="w-full pl-12 pr-4 py-4 bg-white border border-slate-100 rounded-[1.5rem] outline-none focus:ring-2 ring-purple-100 focus:border-purple-300 transition-all text-slate-800 placeholder:text-slate-400 font-bold text-xs"
    />
  </div>
);

export function AuthView() {
  const { loginGoogle, loginEmail, registerEmail } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState('email'); 
  const [loading, setLoading] = useState(true); 
  const [error, setError] = useState('');
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  const [formData, setFormData] = useState({
    name: '', email: '', password: '', confirmPassword: '',
    country: '', address: '', phone: '', birthday: '', age: 0, referralCode: '', source: ''
  });

  // Guardian automático
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user && window.location.pathname.includes('/auth')) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) navigate('/', { replace: true });
          else { setFormData(prev => ({ ...prev, email: user.email })); setStep('register_form'); }
        } catch (err) {}
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (formData.birthday) {
      const today = new Date(); const birth = new Date(formData.birthday);
      let age = today.getFullYear() - birth.getFullYear();
      if (today.getMonth() < birth.getMonth() || (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate())) age--;
      setFormData(prev => ({ ...prev, age }));
    }
  }, [formData.birthday]);

  const handleInputChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleCheckEmail = async (e) => {
    e.preventDefault();
    if (!formData.email.includes('@')) return setError('Ingresa un correo válido');
    setLoading(true);
    try {
      const methods = await fetchSignInMethodsForEmail(auth, formData.email.trim());
      if (methods.length > 0) {
        if (methods.includes('google.com') && !methods.includes('password')) setError('Usa el botón de Google abajo.');
        else setStep('password_login');
      } else setStep('register_form');
    } catch (err) { setError('Falla de red o intento límite superado.'); }
    setLoading(false);
  };

  const handlePasswordLogin = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try { await loginEmail(formData.email, formData.password); } catch (err) {
      setFailedAttempts(prev => prev + 1); setError('Contraseña incorrecta.');
    }
    setLoading(false);
  };

  // ----- CREADOR ESTRICTO CLIENTES: ------
  const handleFinalSave = async (src) => {
    setError(''); setLoading(true);
    try {
      let uid = auth.currentUser?.uid;
      let registeredUser = auth.currentUser;
      if (!uid) {
        const res = await registerEmail(formData.email, formData.password);
        uid = res.user.uid; registeredUser = res.user;
      }
      
      // ELIMINADA CUALQUIER LOGICA DE "ROL ELEGIDO". ¡SE OBLIGA SIEMPRE A CLIENTE PURO HASTA LLENAR SU REQUEST DESPUES!
      await setDoc(doc(db, 'users', uid), {
        name: formData.name, email: formData.email.toLowerCase(), country: formData.country,
        phone: formData.phone, birthday: formData.birthday, age: formData.age, address: formData.address,
        referred_by: formData.referralCode || 'orgánico', found_us_via: src,
        role: 'cliente', 
        wallet_balance: 0, points: 0, status: 'active', created_at: new Date(),
        addresses: formData.address ? [{ id: Date.now(), name: formData.name, country: formData.country || 'Honduras', city: 'Por definir', street: formData.address, house: '', ref: '', phone: formData.phone, isDefault: true }] : []
      });

      if (registeredUser && !registeredUser.emailVerified) {
         try { await sendEmailVerification(registeredUser); } catch(e) {}
      }

      setStep('success');
      setTimeout(() => navigate('/', { replace: true }), 3000);
    } catch (err) { setError('Asegúrate de llenar el perfil adecuadamente.'); }
    setLoading(false);
  };

  if (loading && step === 'email') return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center font-black italic tracking-[0.3em] uppercase text-slate-300">
      Cargando Autenticación...
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 overflow-hidden relative font-sans text-slate-800">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-200/50 blur-[120px] rounded-full translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-300/40 blur-[100px] rounded-full -translate-x-1/2 translate-y-1/2" />

      <motion.h1 layout className="text-4xl md:text-6xl font-black mb-8 uppercase italic relative z-10">
        ZORA <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-purple-500 to-pink-500">STORE</span>
      </motion.h1>

      <motion.div className="w-full max-w-sm relative z-10" layout>
      <AnimatePresence mode="wait">
        
        {step === 'email' && (
          <motion.form key="e" onSubmit={handleCheckEmail} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
            <InputZaro icon={Globe} name="email" type="email" autoComplete="email" placeholder="Correo electrónico" value={formData.email} onChange={handleInputChange} />
            {error && <p className="text-red-500 text-[10px] text-center font-bold bg-red-50 py-2 rounded-2xl">{error}</p>}
            <button type="submit" className="w-full py-4 mt-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-[1.5rem] font-black uppercase tracking-widest shadow-lg hover:scale-[1.02] active:scale-95 transition-all">Siguiente ➔</button>
            <div className="flex items-center gap-2 py-4 opacity-50"><div className="flex-1 h-px bg-slate-300"></div><span className="text-[9px] uppercase font-black">O Inicia Aquí</span><div className="flex-1 h-px bg-slate-300"></div></div>
            <button type="button" onClick={loginGoogle} className="w-full py-4 bg-white border border-slate-100 text-slate-700 rounded-[1.5rem] font-black text-xs flex items-center justify-center gap-3 hover:bg-slate-50 transition-colors shadow-sm">
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt="G"/> Continuar con Google
            </button>
          </motion.form>
        )}

        {step === 'password_login' && (
          <motion.form key="pl" onSubmit={handlePasswordLogin} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-white p-8 rounded-[2.5rem] shadow-2xl shadow-blue-900/5 space-y-4 text-center">
            <h3 className="text-[10px] font-black text-purple-400 uppercase tracking-[0.2em] mb-4">Bienvenido de nuevo</h3>
            <div className="p-3 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold text-slate-500 truncate mb-4">{formData.email}</div>
            <div className="relative">
              <InputZaro icon={Key} name="password" type={showPass ? "text" : "password"} autoComplete="current-password" placeholder="Tu contraseña" value={formData.password} onChange={handleInputChange} />
              <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">{showPass ? <EyeOff size={18}/> : <Eye size={18}/>}</button>
            </div>
            {error && <p className="text-red-500 text-[10px] font-bold italic bg-red-50 p-2 rounded-xl">{error}</p>}
            <button type="submit" disabled={loading} className="w-full py-4 mt-2 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase shadow-xl tracking-widest disabled:opacity-50">Ingresar a Tienda</button>
            <button type="button" onClick={() => sendPasswordResetEmail(auth, formData.email).then(() => setError('Se ha enviado enlace a tu correo.'))} className={`text-[9px] mt-4 block mx-auto font-black uppercase tracking-widest transition-all ${failedAttempts >= 2 ? 'text-purple-600 underline' : 'text-slate-400'}`}>¿Resetear Password?</button>
          </motion.form>
        )}

        {/* MÚLTIPLES DATOS OBLIGATORIOS EXCLUSIVOS: ¡Eliminados selectores feos de Roles! Todos Nivel 1. */}
        {step === 'register_form' && (
          <motion.div key="r" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="w-full bg-white p-8 rounded-[2.5rem] shadow-xl space-y-3 border border-slate-100">
            <h2 className="text-sm font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-500 text-center uppercase tracking-tighter"><Sparkles size={16} className="inline mr-1"/> Tu Expediente Cliente</h2>
            <InputZaro icon={UserCheck} name="name" placeholder="Tu Nombre Físico / Fuerte" value={formData.name} onChange={handleInputChange} />
            <div className="flex gap-2">
              <select name="country" value={formData.country} onChange={handleInputChange} className="w-1/3 p-4 bg-white border border-slate-100 rounded-2xl text-slate-700 outline-none font-bold text-[10px] uppercase">
                <option value="">Nación</option><option value="HN">Honduras</option><option value="US">Otra Loc.</option>
              </select>
              <InputZaro icon={Phone} name="phone" placeholder="Watsapp 504XX" value={formData.phone} onChange={handleInputChange} />
            </div>
            <div className="p-3 bg-slate-50 border border-slate-100 rounded-[1.5rem] mt-2">
               <label className="text-[8px] font-black uppercase tracking-widest text-slate-400 block px-2 mb-1">Nacimiento Real (-Dsct Especial)</label>
               <input name="birthday" type="date" value={formData.birthday} onChange={handleInputChange} className="bg-transparent px-2 w-full font-bold text-xs outline-none" />
            </div>

            <div className="pt-2">
                <div className="relative mb-2"><InputZaro icon={Key} name="password" type={showPass?"text":"password"} autoComplete="new-password" placeholder="Tu Clave de Tienda" value={formData.password} onChange={handleInputChange} /><button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300"><Eye size={18}/></button></div>
                <div className="relative"><InputZaro icon={CheckCircle2} name="confirmPassword" type={showConfirmPass?"text":"password"} autoComplete="new-password" placeholder="Válidela Clave Creada" value={formData.confirmPassword} onChange={handleInputChange} /><button type="button" onClick={() => setShowConfirmPass(!showConfirmPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300"><Eye size={18}/></button></div>
            </div>
            
            {error && <p className="text-red-500 text-xs text-center font-bold italic py-1 bg-red-50 rounded mt-1">{error}</p>}
            
            <button onClick={() => {
                if(!formData.name || !formData.phone || !formData.birthday) return setError("Debes Identificarte Exactamente ! Z");
                if(formData.age < 18) return setError("Debes Ser (+18 ) ZORA!");
                if(formData.password.length < 6 || formData.password !== formData.confirmPassword) return setError("Checkeas Las Cracters Pwrd Z !. ");
                setStep('invited'); 
            }} className="w-full py-4 mt-2 bg-slate-900 text-white rounded-[1.5rem] font-black uppercase shadow-xl tracking-widest text-[10px]">Verifíca Inditd Z.</button>
          </motion.div>
        )}

        {/* EXCELENTES PARA QUE GANE BONIFICADOS TU Y A LOS REFERRED !! Z... (Omitble ) */}
        {step === 'invited' && (
           <motion.div key="i" initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="text-center space-y-6 w-full bg-white border border-slate-100 rounded-[3rem] p-10 shadow-2xl shadow-blue-500/10">
             <h2 className="text-2xl font-black italic uppercase tracking-tighter">¿Embajadores te halló?</h2>
             <p className="text-[10px] font-bold text-slate-400 px-4 uppercase tracking-widest">Colocal el Pin-Coup.. .</p>
             <InputZaro icon={ChevronRight} name="referralCode" placeholder="Ponlo Aqui.. Y Z..!!" value={formData.referralCode} onChange={handleInputChange} />
             <div className="flex gap-3">
               <button onClick={() => setStep('social')} className="flex-1 py-4 bg-slate-50 border border-slate-100 rounded-[1.5rem] font-black text-[10px] uppercase text-slate-500">Omirlo :(.</button>
               <button onClick={() => setStep('social')} className="flex-1 py-4 bg-purple-600 text-white shadow-md rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest hover:bg-purple-700">Confirm..V</button>
             </div>
           </motion.div>
        )}

        {step === 'social' && (
          <motion.div key="s" initial={{ y: 20 }} animate={{ y: 0 }} className="w-full space-y-3 bg-white p-8 rounded-[3rem] shadow-xl">
            <h2 className="text-xl font-black text-center mb-6 uppercase tracking-tighter italic text-blue-500 border-b border-blue-50 pb-4">Conteo Adm - Z - Donde ?</h2>
            {['Publicidad TokZora','De Zroa Web CradS!','Comentrios En IG / FB !! . Z..', 'Otro lugarss.'].map((src) => (
              <button key={src} disabled={loading} onClick={() => handleFinalSave(src)} className="w-full py-4 bg-slate-50 border border-slate-100 rounded-2xl shadow-sm hover:border-blue-300 transition-all font-black uppercase text-[10px] tracking-widest text-slate-500 text-left px-6 relative hover:text-blue-500 hover:pl-8">
                {loading ? 'FInlzao... .!! Zora ': <>{src} <span className="absolute right-6 top-1/2 -translate-y-1/2 opacity-20"><Globe size={18}/></span></>}
              </button>
            ))}
          </motion.div>
        )}

        {step === 'success' && (
          <motion.div key="win" initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-center bg-white p-12 rounded-[3rem] shadow-2xl border-4 border-slate-50 space-y-6 max-w-sm w-full mx-auto relative overflow-hidden">
             <div className="w-24 h-24 bg-green-400 mx-auto rounded-full flex justify-center items-center relative z-10 shadow-2xl shadow-green-400/50"><CheckCircle2 size={40} className="text-white"/></div>
             <h2 className="text-2xl font-black uppercase italic tracking-tighter relative z-10">Creación Limpia.!</h2>
             <p className="text-[10px] text-slate-400 uppercase tracking-widest font-black font-bold relative z-10 opacity-70">En la Centralita Mails Está Sus Cractrd!. Redireigiedss!. : Z-App. ! .. Z . . </p>
          </motion.div>
        )}

      </AnimatePresence>
      </motion.div>
    </div>
  );
}