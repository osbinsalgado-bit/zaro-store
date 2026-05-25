import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { db, auth } from '../firebase/config';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { 
  Eye, EyeOff, Globe, Phone, Calendar, MapPin, 
  ChevronRight, UserCheck, Loader2, Sparkles, CheckCircle2, Mail, Key 
} from 'lucide-react';
import { fetchSignInMethodsForEmail, onAuthStateChanged, sendPasswordResetEmail } from 'firebase/auth';

// --- COMPONENTE DE INPUT (AFUERA PARA NO PERDER EL FOCO) ---
// Se añade 'autoComplete' y estructura de form para que el navegador sugiera datos
const InputZaro = ({ icon: Icon, name, type = "text", placeholder, value, onChange, autoComplete }) => (
  <div className="relative group w-full">
    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-400 transition-colors">
      <Icon size={20} />
    </div>
    <input 
      name={name} 
      type={type} 
      value={value} 
      onChange={onChange} 
      placeholder={placeholder}
      autoComplete={autoComplete}
      className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl outline-none focus:ring-2 ring-blue-500/50 transition-all text-white placeholder:text-gray-600"
    />
  </div>
);

export function Login() {
  const { loginGoogle, loginEmail, registerEmail } = useAuth();
  const navigate = useNavigate();

  // --- ESTADOS ---
  const [step, setStep] = useState('email'); 
  const [loading, setLoading] = useState(true); 
  const [error, setError] = useState('');
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  const [formData, setFormData] = useState({
    name: '', email: '', password: '', confirmPassword: '',
    country: '', address: '', phone: '', birthday: '',
    age: 0, referralCode: '', source: ''
  });

  // --- PERSISTENCIA: AUTO-LOGIN ---
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            navigate('/home', { replace: true });
          } else {
            setFormData(prev => ({ ...prev, email: user.email }));
            setStep('register_form');
          }
        } catch (err) { console.error("Error Firestore:", err); }
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [navigate]);

  // Cálculo de edad
  useEffect(() => {
    if (formData.birthday) {
      const today = new Date();
      const birth = new Date(formData.birthday);
      let age = today.getFullYear() - birth.getFullYear();
      if (today.getMonth() < birth.getMonth() || (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate())) age--;
      setFormData(prev => ({ ...prev, age }));
    }
  }, [formData.birthday]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  // --- LÓGICA DE PASOS ---

  const handleCheckEmail = async (e) => {
    if(e) e.preventDefault(); // Soporte para Enter
    if (!formData.email.includes('@')) return setError('Ingresa un correo válido');
    setLoading(true);
    try {
      const methods = await fetchSignInMethodsForEmail(auth, formData.email.trim());
      if (methods.length > 0) {
        if (methods.includes('google.com') && !methods.includes('password')) {
          setError('Este correo usa Google. Haz clic abajo en el botón de Google.');
        } else {
          setStep('password_login');
        }
      } else {
        setStep('register_form');
      }
    } catch (err) {
      setError('Demasiados intentos. Espera un minuto o revisa tu conexión.');
    }
    setLoading(false);
  };

  const handlePasswordLogin = async (e) => {
    if(e) e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await loginEmail(formData.email, formData.password);
      // La persistencia hará el navigate
    } catch (err) {
      setFailedAttempts(prev => prev + 1);
      setError('Contraseña incorrecta.');
    }
    setLoading(false);
  };

  const handleFinalSave = async (src) => {
    setError('');
    setLoading(true);
    try {
      let uid = auth.currentUser?.uid;
      if (!uid) {
        const res = await registerEmail(formData.email, formData.password);
        uid = res.user.uid;
      }
      
      await setDoc(doc(db, 'users', uid), {
        name: formData.name,
        email: formData.email.toLowerCase(),
        country: formData.country,
        phone: formData.phone,
        birthday: formData.birthday,
        age: formData.age,
        address: formData.address,
        addresses: formData.address ? [{
          id: Date.now(),
          name: formData.name,
          country: formData.country || 'Honduras',
          city: 'Por definir',
          street: formData.address,
          house: '',
          ref: '',
          phone: formData.phone,
          isDefault: true
        }] : [],
        referred_by: formData.referralCode || 'orgánico',
        found_us_via: src,
        role: 'cliente',
        wallet_balance: 0,
        points: 0,
        status: 'active',
        created_at: new Date()
      });

      setStep('success');
      // Esperamos para mostrar la animación de bienvenida
      setTimeout(() => navigate('/home', { replace: true }), 2500);
    } catch (err) {
      setError('Error al crear perfil. Intenta de nuevo.');
    }
    setLoading(false);
  };

  // --- UI RENDER ---

  if (loading && step === 'email') return (
    <div className="min-h-screen bg-[#050810] flex items-center justify-center text-blue-500 font-black italic tracking-[0.3em] animate-pulse uppercase">
      Cargando Zaro Store
    </div>
  );

  return (
    <div className="min-h-screen bg-[#050810] flex flex-col items-center justify-center p-6 text-white overflow-y-auto font-sans">
      
      <motion.h1 layout className="text-5xl md:text-6xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 mb-12 uppercase italic drop-shadow-[0_0_15px_rgba(168,85,247,0.4)]">
        ZARO STORE
      </motion.h1>

      <AnimatePresence mode="wait">
        
        {/* EMAIL STEP */}
        {step === 'email' && (
          <motion.form key="e" onSubmit={handleCheckEmail} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full max-w-sm space-y-6">
            <InputZaro icon={Globe} name="email" type="email" autoComplete="email" placeholder="Correo electrónico" value={formData.email} onChange={handleInputChange} />
            {error && <p className="text-red-400 text-xs text-center font-bold bg-red-400/10 p-2 rounded-lg italic">{error}</p>}
            <button type="submit" className="w-full py-4 bg-blue-600 rounded-2xl font-black shadow-lg shadow-blue-900/20 active:scale-95 uppercase tracking-widest transition-all">Continuar</button>
            <div className="text-center text-[10px] text-gray-700 font-black tracking-widest uppercase py-2">O entra con</div>
            <button type="button" onClick={() => loginGoogle()} className="w-full py-3 bg-white text-black rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-gray-100 transition-colors">
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt="G"/> Google
            </button>
          </motion.form>
        )}

        {/* PASSWORD LOGIN STEP */}
        {step === 'password_login' && (
          <motion.form key="pl" onSubmit={handlePasswordLogin} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-sm space-y-5 text-center">
            <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Identidad Detectada</h3>
            <div className="relative">
              <InputZaro icon={Key} name="password" type={showPass ? "text" : "password"} autoComplete="current-password" placeholder="Tu contraseña" value={formData.password} onChange={handleInputChange} />
              <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">{showPass ? <EyeOff size={18}/> : <Eye size={18}/>}</button>
            </div>
            {error && <p className="text-red-400 text-xs font-bold italic">{error}</p>}
            <button type="submit" className="w-full py-4 bg-blue-600 rounded-2xl font-black shadow-xl uppercase">Entrar</button>
            <button type="button" onClick={() => sendPasswordResetEmail(auth, formData.email).then(() => setError('Enlace enviado a tu correo.'))} className={`text-[10px] font-black uppercase tracking-widest transition-all ${failedAttempts >= 2 ? 'text-blue-400 underline animate-bounce' : 'text-gray-600'}`}>
              ¿Olvidaste tu contraseña?
            </button>
          </motion.form>
        )}

        {/* REGISTRO FORM STEP */}
        {step === 'register_form' && (
          <motion.div key="r" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} className="w-full max-w-md space-y-4 bg-white/5 p-8 rounded-[2.5rem] border border-white/10 backdrop-blur-2xl">
            <h2 className="text-xl font-black text-blue-400 text-center mb-4 italic uppercase tracking-tighter"><Sparkles size={18} className="inline mr-2"/>Crea tu Identidad</h2>
            <div className="grid grid-cols-2 gap-3">
              <InputZaro icon={UserCheck} name="name" placeholder="Nombre Completo" value={formData.name} onChange={handleInputChange} />
              <select name="country" value={formData.country} onChange={handleInputChange} className="col-span-2 p-4 bg-slate-900 border border-white/10 rounded-2xl text-white outline-none focus:ring-2 ring-blue-500/50">
                <option value="">Selecciona País...</option>
                <option value="Honduras">Honduras 🇭🇳</option>
                <option value="USA">USA 🇺🇸</option>
                <option value="Mexico">México 🇲🇽</option>
              </select>
              <InputZaro icon={Phone} name="phone" placeholder="WhatsApp" value={formData.phone} onChange={handleInputChange} />
              <input name="birthday" type="date" value={formData.birthday} onChange={handleInputChange} className="p-4 bg-white/5 border border-white/10 rounded-2xl text-white outline-none w-full" />
            </div>
            <InputZaro icon={MapPin} name="address" placeholder="Dirección de Envío (opcional)" value={formData.address} onChange={handleInputChange} />
            <p className="text-[10px] text-gray-400 uppercase tracking-[0.3em]">Puedes completarla más tarde desde tu perfil.</p>

            <div className="space-y-3">
                <div className="relative">
                  <InputZaro icon={UserCheck} name="password" type={showPass ? "text" : "password"} autoComplete="new-password" placeholder="Contraseña" value={formData.password} onChange={handleInputChange} />
                  <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">{showPass ? <EyeOff size={18}/> : <Eye size={18}/>}</button>
                </div>
                <div className="relative">
                  <InputZaro icon={CheckCircle2} name="confirmPassword" type={showConfirmPass ? "text" : "password"} autoComplete="new-password" placeholder="Confirmar Contraseña" value={formData.confirmPassword} onChange={handleInputChange} />
                  <button type="button" onClick={() => setShowConfirmPass(!showConfirmPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">{showConfirmPass ? <EyeOff size={18}/> : <Eye size={18}/>}</button>
                </div>
                {formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword && (
                  <p className="text-red-400 text-[10px] text-center font-bold uppercase tracking-widest animate-pulse">¡Las contraseñas no coinciden!</p>
                )}
            </div>
            
            <p className="text-[10px] text-center text-gray-500 uppercase tracking-widest font-black">
                Edad detectada: <span className={formData.age < 18 ? 'text-red-500':'text-green-400'}>{formData.age} Años</span>
            </p>

            {error && <p className="text-red-400 text-xs text-center font-bold italic">{error}</p>}

            <button onClick={() => {
                if(!formData.name || !formData.country || !formData.phone || !formData.birthday) return setError("Completa todos los datos");
                if(formData.age < 18) return setError("Debes ser mayor de 18 años");
                if(formData.password !== formData.confirmPassword) return setError("Las contraseñas deben ser iguales");
                setStep('invited');
            }} className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl font-black shadow-xl uppercase transition-all hover:scale-[1.02]">Siguiente</button>
            <button type="button" onClick={() => {
                if(!formData.name || !formData.country || !formData.phone || !formData.birthday) return setError("Completa tus datos personales antes de continuar");
                if(formData.age < 18) return setError("Debes ser mayor de 18 años");
                setStep('social');
            }} className="w-full py-3 text-[10px] font-black uppercase tracking-widest text-slate-300">Lo completo después</button>
          </motion.div>
        )}

        {/* INVITED STEP */}
        {step === 'invited' && (
           <motion.div key="i" initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="text-center space-y-8">
             <h2 className="text-3xl font-black italic tracking-tighter uppercase tracking-widest">¿Tienes un código?</h2>
             <div className="flex gap-4">
               <button onClick={() => setStep('code')} className="flex-1 py-10 bg-blue-600/20 border border-blue-500/50 rounded-3xl font-black hover:bg-blue-600 transition-all uppercase italic">SÍ, TENGO</button>
               <button onClick={() => setStep('social')} className="flex-1 py-10 bg-white/5 border border-white/10 rounded-3xl font-black hover:bg-white/10 transition-all uppercase italic">NO</button>
             </div>
           </motion.div>
        )}

        {/* REFERRAL CODE STEP */}
        {step === 'code' && (
          <motion.div key="c" initial={{ x: 50 }} animate={{ x: 0 }} className="w-full max-w-sm space-y-4">
            <InputZaro icon={ChevronRight} name="referralCode" placeholder="Código de embajador" value={formData.referralCode} onChange={handleInputChange} />
            <button onClick={() => setStep('social')} className="w-full py-4 bg-blue-600 rounded-2xl font-black uppercase">Validar Identidad</button>
          </motion.div>
        )}

        {/* SOCIAL ORIGIN STEP */}
        {step === 'social' && (
          <motion.div key="s" initial={{ y: 50 }} animate={{ y: 0 }} className="w-full max-w-sm space-y-3">
            <h2 className="text-xl font-black text-center mb-6 uppercase tracking-widest italic text-blue-400">¿Dónde nos conociste?</h2>
            {['TikTok', 'Instagram', 'Facebook', 'Amigos', 'Otros'].map((src) => (
              <button key={src} onClick={() => handleFinalSave(src)} className="w-full py-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-blue-600 transition-all font-black uppercase text-xs tracking-widest">
                {src}
              </button>
            ))}
          </motion.div>
        )}

        {/* SUCCESS WELCOME STEP */}
        {step === 'success' && (
          <motion.div key="win" initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-center space-y-6">
            <CheckCircle2 size={80} className="text-green-500 mx-auto animate-bounce" />
            <h2 className="text-4xl font-black uppercase italic tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-blue-500">¡BIENVENIDO A ZARO!</h2>
            <p className="text-gray-400 font-bold tracking-[0.3em] animate-pulse uppercase">Sincronizando experiencia...</p>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}