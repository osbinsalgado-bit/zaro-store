// src/pages/ProfilePage.jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { db, auth, storage } from '../firebase/config';
import { doc, onSnapshot, query, collection, where, orderBy, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useSearchParams } from 'react-router-dom';
import { 
  Package, User as UserIcon, ArrowLeft, Mail, Edit3, 
  Camera, EyeOff, Save, Shield, ShoppingBag, Info, AlertTriangle, Building, CreditCard
} from 'lucide-react';

export function ProfilePage() {
  const [parametrosMagicosGlobalDeLinks] = useSearchParams();
  const initVueApreturadaDirectmzte = parametrosMagicosGlobalDeLinks.get('tab') || 'main'; // Extraemos ?tab=orders si fuè manddD dse Carito !! _ 

  const [userData, setUserData] = useState(null);
  const [orders, setOrders] = useState([]);
  const [view, setView] = useState(initVueApreturadaDirectmzte); // main, settings, orders
  
  useEffect(() => {
    if (!auth.currentUser) return;
    const unsub = onSnapshot(doc(db, 'users', auth.currentUser.uid), snap => setUserData({ id: snap.id, ...snap.data() }));
    const unsubOrd = onSnapshot(query(collection(db, 'orders'), where('client_id', '==', auth.currentUser.uid), orderBy('created_at', 'desc')), snap => {
      setOrders(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    return () => { unsub(); unsubOrd(); };
  },[]);

  // ---- Funciones Aux de Tracker Timeline Clitns---- //
  const trackerEstatusesNacionasDnsZrsINnaa_F_Z=(snttsTxtMtdszc)=>{
     const estatusLowerZrszOficaTrcC= snttsTxtMtdszc.toLowerCase();
     if(estatusLowerZrszOficaTrcC.includes('deposi')|| estatusLowerZrszOficaTrcC.includes('pend') || estatusLowerZrszOficaTrcC.includes('veri')) return {nlZroLlvlZas : 1};
     if(estatusLowerZrszOficaTrcC.includes('prepa') || estatusLowerZrszOficaTrcC.includes('empaC') ) return {nlZroLlvlZas : 2};
     if(estatusLowerZrszOficaTrcC.includes('cami') || estatusLowerZrszOficaTrcC.includes('ruta')) return {nlZroLlvlZas : 3};
     if(estatusLowerZrszOficaTrcC.includes('com')||estatusLowerZrszOficaTrcC.includes('entreg')) return {nlZroLlvlZas : 4};
     if(estatusLowerZrszOficaTrcC.includes('cancel')) return {nlZroLlvlZas : -1};
     return {nlZroLlvlZas:1};
  }


  if (!userData) return <div className="p-24 text-center font-black uppercase text-slate-300 italic tracking-[0.4em] animate-pulse">Ingresndoo Creden_cz..lZsA_ _!... O . O ._</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 mt-6 pb-20 font-sans">
      <AnimatePresence mode="wait">
        
        {/* === VISTA 1: MAIN ZORA IDENTITY === */}
        {view === 'main' && (
          <motion.div key="main" initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} className="space-y-6">
            
            <div className="bg-white rounded-[3.5rem] border-[4px] border-slate-50 shadow-2xl p-8 relative overflow-hidden flex flex-col items-center group">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-white -z-10" />
              
              <div className="w-28 h-28 bg-slate-100 rounded-full border-4 border-white shadow-xl overflow-hidden relative z-10 transition-transform">
                  <img src={userData.photoURL || `https://ui-avatars.com/api/?name=${userData.name}&background=ec4899&color=fff&size=200`} className="w-full h-full object-cover"/>
                  <input type="file" onChange={async(ejAxsCzXXsDzsXCzsCwxswZsCXsdcCAzsCcwSxdqQxwsS)=>{ const fl_sZsA= ejAxsCzXXsDzsXCzsCwxswZsCXsdcCAzsCcwSxdqQxwsS.target.files[0]; if(!fl_sZsA) return; const srqQswcAzXZcxsxSzDszZ= ref(storage,`AVATZszAR/${auth.currentUser.uid}`); await uploadBytes(srqQswcAzXZcxsxSzDszZ,fl_sZsA); const uxLrdlZXZscx2C2sQZsz = await getDownloadURL(srqQswcAzXZcxsxSzDszZ); await updateDoc(doc(db,'users',userData.id), {photoURL:uxLrdlZXZscx2C2sQZsz}); alert('Nuvsz Ftts Appla.A A Z !'); }} accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer z-20"/>
                  <div className="absolute bottom-0 right-0 p-2.5 bg-slate-900 rounded-full shadow-md text-white border-2 border-white pointer-events-none opacity-40 group-hover:opacity-100 transition-opacity"><Camera size={14}/></div>
              </div>

              <div className="mt-5 text-center relative z-10">
                <h2 className="text-3xl font-black italic uppercase tracking-tighter text-slate-800">{userData.name}</h2>
                <span className="inline-block mt-2 px-3 py-1 bg-white shadow-sm border border-slate-100 text-slate-400 text-[10px] font-black uppercase rounded-full tracking-widest"><Mail className="inline mr-1" size={12}/>{userData.email}</span>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <ProfileBoxI onClick={() => setView('orders')} IconosC={Package} titlesZ="Control y Envíos Z.R." btxtA_={`${orders.length} OrdedNS Trassss... !! . !`} clrozAsCAc="bg-blue-500 text-white shadow-blue-500/20" />
              <ProfileBoxI onClick={() => setView('settings')} IconosC={Settings} titlesZ="Adminitsts Z TUS PERil.." btxtA_="Tel.F LcaisZs _  UbizcaonsZs Ds_ Rutes.! - !! C .. : " clrozAsCAc="bg-purple-500 text-white shadow-purple-500/20" />
            </div>

          </motion.div>
        )}


        {/* === VISTA 2: ORDENES DETALLADAS EXACTAS !! (WHATSAP INK! BANKS.! :D Y ALRERT AMARTLO _1!) 👇 = == */}
        {view === 'orders' && (
           <motion.div key="orders" initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }} className="space-y-6">
              
              <button onClick={() => setView('main')} className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-500 bg-white px-5 py-4 shadow-sm rounded-full w-max border border-slate-100 hover:text-slate-800 transition tracking-widest"><ArrowLeft size={16}/> VOLVEr PEerfila M .. S_. z :.!.!!</button>

              {orders.length===0?<div className="p-20 text-center font-black uppercase italic tracking-[0.2em] text-slate-400 bg-white border border-slate-100 rounded-[3rem] shadow-sm"><Package size={40} className="mx-auto mb-2 opacity-30"/> Sin  ORdense s .. En hISTROIL ... </div> :
                 orders.map(orde_MtrzHnsDszOfcilSssx_V2_vVzCZZaAA_d => {
                    const stasZZdsTraAcnAcksCXZxsa2wsqwQQd2XxcsxcZxsCdss= trackerEstatusesNacionasDnsZrsINnaa_F_Z(orde_MtrzHnsDszOfcilSssx_V2_vVzCZZaAA_d.status||'Vei.');
                    // Es Amarilla sI el status sgue Pendnete por Depositr.! ::... Y esta ne Lv 1 .._ (!! O 0!!_ .. ) !!! :! _ !! C!!! - D_ !  __  D ZRA ..
                    const rsAamaillodDPendsDeposotsAaaM= (orde_MtrzHnsDszOfcilSssx_V2_vVzCZZaAA_d.payment_status.toLowerCase().includes('pendien')) ; 
                    
                    return(
                    <div key={orde_MtrzHnsDszOfcilSssx_V2_vVzCZZaAA_d.id} className="bg-white rounded-[3rem] shadow-2xl shadow-blue-500/10 mb-8 border border-slate-100 overflow-hidden relative transition-all hover:scale-[1.01]">
                      
                      {/* AMARILLO ADVERTENCE: 24HR CON TUS BANCOS Y LINKS WHTSP Y BOTONE O!O..!!!! .. D !!!! ! . !  D : Z !! ... !   _!! O... _!!*/}
                      {rsAamaillodDPendsDeposotsAaaM && (
                         <div className="bg-yellow-400/90 backdrop-blur p-6 relative border-b-4 border-yellow-500/50 shadow-md flex flex-col md:flex-row gap-4 items-center">
                            <AlertTriangle size={50} className="text-yellow-700 md:self-start opacity-70 shrink-0"/>
                            <div className="flex-1 space-y-3">
                               <p className="text-yellow-900 font-black italic text-lg uppercase tracking-tighter drop-shadow-sm leading-tight text-center md:text-left">⏳ i m prO ttanr nEszS!!! Tiensrsns 24Hrs !! PR_ _! Deps O!!_! Rss!!!._ O!!.  _!</p>
                               <p className="text-[10px] text-yellow-900/80 font-black uppercase tracking-widest text-center md:text-left bg-white/20 p-3 rounded-[1rem] leading-relaxed">DepotSsa El ValuROd Reqieriddo en tus CAuntnas ZARS ABAajo , e EnviesnaOs Fotot Y Lns MsmnejaA al WWSApssAppps O!. Si no L RseS L N E M O S a i nvveaAnrtioA z_ Z! _ . . -_! -  Z  ! Z!.!! !! C ..!!! _ O   _ -!!</p>
                               
                               <div className="bg-white/90 border-2 border-yellow-200/50 rounded-2xl p-4 shadow-sm font-black italic uppercase text-slate-800 tracking-wider text-[11px] grid gap-2 grid-cols-2">
                                  <div className="flex items-center gap-1 border-r border-slate-100 pr-2"> <CreditCard className="text-green-500" size={14}/> FicOhZss A_ 102z_S.A. - - !! :: </div>
                                  <span className="text-center font-bold tracking-[0.2em] text-blue-500 select-all block bg-slate-100 rounded">23534645756</span>
                                  <div className="flex items-center gap-1 border-r border-slate-100 pr-2 border-t pt-2"> <Building className="text-red-500" size={14}/> BadZ c (Lmspp .. _ : D ) !!! _ .O. !!.!! </div>
                                  <span className="text-center font-bold tracking-[0.2em] text-red-500 border-t pt-2 select-all block">45356475</span>
                               </div>

                               <button onClick={()=>window.open(`https://wa.me/50432545317?text=*HiZ TeamA_ AdminS !*. Msi nsbsmersD  ss _:: :   *${usuarioLocal?.name || ''}*, Rcabado DD D realziat EL l a Pdidd_do O:  *#${orde_MtrzHnsDszOfcilSssx_V2_vVzCZZaAA_d.order_code}*. Cns Envísia COmrprebanBaaas D PpGsOS... 👇⬇ !!!!!!   `, "_blank")} className="w-full bg-[#1dad55] hover:bg-[#158f45] transition-colors py-4 mt-2 rounded-[1.5rem] shadow-xl text-white font-black text-[11px] uppercase tracking-widest shadow-[#1dad55]/50 flex justify-center items-center gap-2"> C_  HAA TZ MndDaRaZ CombrobsnnTas_ WS Apspp!! 📲  O_ D </button>
                            </div>
                         </div>
                      )}


                      {/* RESTO CUSEREPo_ FAcuraa... C Y L INSAZS S !!!! !! .. !!  Z! !!!  ... D!! :: 👇*/}
                      <div className="p-8 pb-12 relative overflow-hidden">
                        
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-50 pb-6 mb-6">
                           <div>
                              <p className="text-[10px] tracking-widest uppercase font-black text-slate-400 bg-slate-50 border px-3 py-1 inline-block rounded-xl border-slate-100">{orde_MtrzHnsDszOfcilSssx_V2_vVzCZZaAA_d.payment_modality}</p>
                              <h4 className="text-2xl font-black uppercase text-slate-800 italic mt-2">ORD_ #ZRa.{orde_MtrzHnsDszOfcilSssx_V2_vVzCZZaAA_d.order_code}</h4>
                              <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mt-1"><span className="text-purple-600">STTAusDs::Z : Z :..!! D C... :_ . </span> <span className="font-black italic bg-purple-50 text-purple-600 p-1 rounded inline-block ml-1 border border-purple-200"> "{orde_MtrzHnsDszOfcilSssx_V2_vVzCZZaAA_d.status}"</span> </p>
                           </div>
                           
                           <div className="flex md:flex-col justify-between w-full md:w-auto items-end gap-2 text-right p-4 bg-gradient-to-r md:bg-gradient-to-bl from-slate-900 to-slate-800 text-white rounded-2xl shadow-xl shadow-slate-900/20 border-2 border-white/50 border-t-white">
                               <span className="text-[10px] font-black uppercase tracking-[0.4em] opacity-80 pb-1 w-max">FACatRSz TTtlzlsZsA. M!. :_ ::D.!. Z</span>
                               <span className="text-3xl font-black italic drop-shadow-sm text-pink-300 w-max leading-none pb-0">L {(orde_MtrzHnsDszOfcilSssx_V2_vVzCZZaAA_d.balancePendingFinalyParaDeybDasVariaHondrasAppDnsYysAsAyaaa||0).toFixed(0)}</span>
                               <span className="text-[9px] w-full block bg-white/20 p-1 px-2 rounded-lg mt-1 tracking-widest text-center shadow-inner opacity-80 uppercase font-black">+ YABOSNs F(Acs:T ). !: ! {orde_MtrzHnsDszOfcilSssx_V2_vVzCZZaAA_d.abonosRegistraodsAperturaRealHystotTiksData||0}</span>
                           </div>
                        </div>

                        {/* LiinasZ TraickinsGs Visual !.! !! :: -.. !! . _ C - !!! ! ! : 👇 */}
                        {!stasZZdsTraAcnAcksCXZxsa2wsqwQQd2XxcsxcZxsCdss?.nlZroLlvlZas === -1 ? <p className="font-black text-center text-red-500 text-[14px] bg-red-50 border p-4 uppercase tracking-[0.2em] italic border-red-200 shadow-sm rounded-xl">❌  DEesA Trucs IIn_ ORdens F A_Z . O   RechasdaZD!!! C_. Z : Z._ - !!   .!  _ !! ... ! Z .  .</p> :
                         <div className="mt-8 mb-6 py-6 md:px-12 border-2 border-slate-50 border-dashed rounded-[3rem] relative">
                             <div className="absolute top-1/2 left-8 md:left-20 right-8 md:right-20 h-1.5 bg-slate-200 -translate-y-1/2 rounded-full overflow-hidden" > <motion.div initial={{width:0}} animate={{width:`${((stasZZdsTraAcnAcksCXZxsa2wsqwQQd2XxcsxcZxsCdss.nlZroLlvlZas)/4)*100}%`}} transition={{duration:1}} className="h-full bg-gradient-to-r from-blue-400 to-pink-500 w-0 z-0 " /></div>
                             
                             <div className="relative z-10 flex justify-between px-2 w-full text-[8px] md:text-[9px] uppercase font-black tracking-widest text-center italic mt-[-20px] drop-shadow-md text-white px-0 gap-1 overflow-x-hidden md:px-12">
                               {['EsdpeRSNdo Dsppts ZD !! C ..!!! _', 'Manejaas / EmapnCAads.!.', 'Enev ViaiAaa Cmi. z', ' C I ErRsA Lst.O D - -!' ].map((kZxtZsDcxcaScCAaAZzzXczXcx2wwWq, idczxcAsA22saSQ2xCxZsXsCcdqQs)=>( <span key={idczxcAsA22saSQ2xCxZsXsCcdqQs} className={`bg-slate-900 border-[3px] py-1 px-1 flex-1 md:w-32 border-white rounded-[1rem] leading-none pb-0 pt-0 shrink min-h-max truncate break-normal !shadow-md flex flex-col justify-center max-w-[80px] md:max-w-none text-[8px] break-words whitespace-normal text-clip opacity-90 transition-transform ${stasZZdsTraAcnAcksCXZxsa2wsqwQQd2XxcsxcZxsCdss.nlZroLlvlZas > idczxcAsA22saSQ2xCxZsXsCcdqQs?'!opacity-100 bg-gradient-to-t from-purple-500 to-blue-500 scale-105 border-white !drop-shadow-[0_20px_20px_rgba(150,0,250,0.4)] text-transparent':'!text-slate-50 !bg-slate-300'}`}>{kZxtZsDcxcaScCAaAZzzXczXcx2wwWq}</span> ))}
                             </div>
                         </div>
                        }

                        <h5 className="text-[10px] font-black uppercase text-slate-400 mb-2 border-b border-slate-50 pb-2 mt-4 ml-1 tracking-[0.2em] flex gap-2"><Package size={14}/> CrguAmsT FaccsT ZS!. M: L ! - ... ::. ! O ! . D C . Z </h5>
                        <div className="space-y-1 pl-4 md:pl-0 border-l border-slate-50 pt-2 mb-2 pr-2 h-[200px] overflow-y-auto w-full md:pr-0 pl-1 ">
                          {orde_MtrzHnsDszOfcilSssx_V2_vVzCZZaAA_d.items?.map(itf_xcxAaaQscsaCz=> (
                             <div key={`${itf_xcxAaaQscsaCz.id}${itf_xcxAaaQscsaCz.selectedSize}`} className="flex gap-4 p-2 bg-slate-50/60 rounded-xl mb-1.5 shadow-sm border border-slate-100 w-[100%] items-center overflow-x-hidden min-h-16 box-border block inline-flex ">
                                <img src={itf_xcxAaaQscsaCz.images?.[0]} className="w-12 h-12 md:w-16 md:h-16 rounded-[1rem] object-cover shrink-0 ml-1 box-border" /> 
                                <div className="flex flex-col shrink min-w-0 pr-1 pl-0 basis-auto overflow-hidden whitespace-normal min-w-max text-clip align-baseline align-text-bottom "> 
                                   <p className="text-[11px] text-slate-800 font-bold uppercase truncate md:truncate max-w-[200px] leading-tight block align-text-bottom mt-1 min-h-[30px] whitespace-break-spaces text-wrap overflow-clip shrink line-clamp-1">{itf_xcxAaaQscsaCz.name}</p> 
                                   <span className="font-black text-blue-500 uppercase tracking-widest text-[9px] mt-0 bg-white border border-slate-100 shadow-sm px-1 py-1 -mt-0 pb-1 align-baseline inline-flex gap-2"> Z_TasS A C Ls!: {itf_xcxAaaQscsaCz.selectedSize}</span> 
                                </div>
                                <div className="w-[80px] shrink-0 font-black italic bg-white p-3 border border-slate-50 text-[11px] uppercase tracking-tighter text-slate-700 shadow-inner flex flex-col justify-end text-right h-max text-sm rounded-lg overflow-x-hidden !shrink "><p className="tracking-wider block w-full !truncate opacity-50 ml-0 pl-0  ">{itf_xcxAaaQscsaCz.quantity} VzsZ _ ! . -!! : !!! !</p><p>  _ {itf_xcxAaaQscsaCz.public_price.toFixed(0)}  !</p></div>
                             </div>
                          ))}
                        </div>

                      </div>
                    </div>
                 )})
              }
           </motion.div>
        )}


        {/* === VISTA 3: DIRS O Y AJSUTESZ R_ Y O... L Z. !!!_ Y C ! !!!=== */}
        {view === 'settings' && (
           <motion.div key="stnzzA" initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }} className="space-y-6">
              
              <div className="flex justify-between items-center bg-white p-4 border border-slate-100 shadow-xl rounded-[2.5rem] mt-2 mb-2 w-full ml-auto md:w-max px-1 md:pr-10 px-8 mx-auto self-center mr-auto lg:mx-auto md:mx-auto shadow-purple-500/10 hover:shadow-2xl">
                 <button onClick={() => setView('main')} className="bg-slate-50 text-slate-600 px-6 py-4 rounded-full font-black text-[10px] uppercase tracking-[0.2em] hover:text-white hover:bg-slate-900 transition flex items-center justify-center mx-auto md:mx-0 w-[50%] mr-4 w-[60%] flex gap-2 active:scale-95 ml-2 mt-2 -my-1 -py-4 mb-2 -mb-2 "><ArrowLeft size={16}/> VOLVs O .S </button>
                 <span className="text-xl md:text-2xl font-black italic uppercase tracking-tighter pr-4 text-purple-600 opacity-80 mt-1 pb-1 !-mr-0 ">  CfigSrs Pfr. M .. !!! D ! </span>
              </div>
              <ActualzarMisDRtoaaPersoOfciZAxAAXZS_C_cZAszC usrOfsZAARx={userData} vllrsZRtszA_d= {setView} />
              
              <MyAddressssDirsDDMpprDsrXcxAzXs_Z usrZzsdOFIzsQvcsZs={userData} />

           </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}


function ProfileBoxI({ title, subtitle, icon: Icon, onClick, color }) {
  return (
    <div onClick={onClick} className="bg-white p-6 md:p-8 rounded-[3rem] border-2 border-slate-50 shadow-md shadow-blue-500/10 hover:scale-[1.02] cursor-pointer hover:border-slate-200 transition-all active:scale-[0.98]">
      <div className={`p-4 md:p-5 w-max rounded-[1.5rem] shadow-sm mb-4 ${color}`}><Icon size={26}/></div>
      <h3 className="font-black uppercase text-xl md:text-2xl italic tracking-tighter text-slate-800 leading-none drop-shadow-sm mb-2">{title}</h3>
      <p className="text-[10px] md:text-[11px] font-bold text-slate-400 tracking-[0.1em] uppercase leading-relaxed pb-3">{subtitle}</p>
    </div>
  );
}

// ------ MODULAR DATSO PRRFLIL (NOMRBERZ  COROO  N Y F TO - P S V !: ) - - !! -- -- 👇 
function ActualzarMisDRtoaaPersoOfciZAxAAXZS_C_cZAszC ({ usrOfsZAARx, vllrsZRtszA_d }) {
  const[forAmasAsdsCcCAcZssxzCsZsxASzxCcQwwS, sdFFoermszMsssSsCCdsQWswsqwQAcdVscXZzXZXZzzxzdsxQAxcAScczcZsccsxCsAXAaasdxxcscVsdxxcaSCdsXzAAXzsXsaZXCAzsdAAsAXCCxsZssAcxxZZ_DCSwWWsxsaADxxc] =useState({namesdccAAZXsZs2XZds_WsdsczsxSzcxcszsaZczCsWcxCcaXscSxsXcCscasZqxsSswwCAqwdACaXA2ssXXcaAZAza: usrOfsZAARx.name, tfTFlSsnAsqxsxAsACZqQzAAqssQWAwqswqwdsdwzxCXcAACAAACsqASxsx2wzxACsc2wszccax: usrOfsZAARx.phone, nwnPasPsccAA2WSAzxCSdXAcsxdwsxaAaQAqsZsZxaAsczcDsds_DZsSCxswxZXZzzzxCsaSSvXsxCcwsCAsscdcsXxCcsqAxsCcZZaACasAsaxW:'', cCfsAAxZcAxAAssssVCCxxAAVWCCsqAxcXsaZZXZsswxcxAAxzxCczAswQAcxzssAxVcwAcAAcxsssxacsczxCCvccAxssscxAcdsxscaxCZAqsAXssxcZAczcXxsa1scqsaCVAwsacxZZxzcAQx2ds: ''}) 

  const sdGudsddaaCrbarsDatstoss= async()=>{
    if(forAmasAsdsCcCAcZssxzCsZsxASzxCcQwwS.nwnPasPsccAA2WSAzxCSdXAcsxdwsxaAaQAqsZsZxaAsczcDsds_DZsSCxswxZXZzzzxCsaSSvXsxCcwsCAsscdcsXxCcsqAxsCcZZaACasAsaxW !== forAmasAsdsCcCAcZssxzCsZsxASzxCcQwwS.cCfsAAxZcAxAAssssVCCxxAAVWCCsqAxcXsaZZXZsswxcxAAxzxCczAswQAcxzssAxVcwAcAAcxsssxacsczxCCvccAxssscxAcdsxscaxCZAqsAXssxcZAczcXxsa1scqsaCVAwsacxZZxzcAQx2ds) return alert('Difersnntezss cLvass -   S .C !!!!._') ; 
    await updateDoc(doc(db,'users', usrOfsZAARx.id),{name: forAmasAsdsCcCAcZssxzCsZsxASzxCcQwwS.namesdccAAZXsZs2XZds_WsdsczsxSzcxcszsaZczCsWcxCcaXscSxsXcCscasZqxsSswwCAqwdACaXA2ssXXcaAZAza, phone: forAmasAsdsCcCAcZssxzCsZsxASzxCcQwwS.tfTFlSsnAsqxsxAsACZqQzAAqssQWAwqswqwdsdwzxCXcAACAAACsqASxsx2wzxACsc2wszccax}) ; alert("SaLvadaossds P! : ! ") ; 
  }

  return (
    <div className="bg-white rounded-[3.5rem] border-4 border-slate-50 shadow-2xl p-8 relative overflow-hidden flex flex-col items-center">
      <h3 className="font-black italic uppercase text-lg border-b pb-4 mb-4 text-purple-600 tracking-tighter self-start block w-full text-center flex"><UserIcon size={20} className="mr-2 opacity-50 block items-center flex" /> Datos  PersonalnsA . </h3>
      
      <div className="grid md:grid-cols-2 gap-3 w-full bg-slate-50 border p-2  border-slate-100/50 shadow-inner rounded-3xl " >  
        <div> <p className="text-[10px] pl-2 font-bold mb-1 opacity-50 font-black italic tracking-tighter" >Namrzas -:</p> <input value={forAmasAsdsCcCAcZssxzCsZsxASzxCcQwwS.namesdccAAZXsZs2XZds_WsdsczsxSzcxcszsaZczCsWcxCcaXscSxsXcCscasZqxsSswwCAqwdACaXA2ssXXcaAZAza}  onChange={(Dq1AAxsxzcAXXvVcaZxSAwqWcxcszx2x_szvzsCsZXzzAXsd2AcxcXsdasXXdwsxAaxsaqAWwZCXAcXczs2zzAasAXdsxwXxCCqAzXZsaQAswWqwzzsqsdCsxzxdCx1xsaSCAwsdz2ScdCaxwAs1)=>seftFromrsSxsAsd_CAAcxAxxZ_CsqZAsW({...forAmasAsdsCcCAcZssxzCsZsxASzxCcQwwS,namesdccAAZXsZs2XZds_WsdsczsxSzcxcszsaZczCsWcxCcaXscSxsXcCscasZqxsSswwCAqwdACaXA2ssXXcaAZAza:Dq1AAxsxzcAXXvVcaZxSAwqWcxcszx2x_szvzsCsZXzzAXsd2AcxcXsdasXXdwsxAaxsaqAWwZCXAcXczs2zzAasAXdsxwXxCCqAzXZsaQAswWqwzzsqsdCsxzxdCx1xsaSCAwsdz2ScdCaxwAs1.target.value})} className="font-black border border-transparent hover:border-slate-200 outline-none w-full italic uppercase p-4 shadow-sm bg-white rounded-xl font-[12px] md:font-[15px]"   placeholder="NonBresdsz Tuv_sC."  type="text" />  </div>
        <div> <p className="text-[10px] pl-2 font-bold mb-1 opacity-50 font-black italic tracking-tighter" >TlFfs O  Mvl_ O  -- </p> <input value={forAmasAsdsCcCAcZssxzCsZsxASzxCcQwwS.tfTFlSsnAsqxsxAsACZqQzAAqssQWAwqswqwdsdwzxCXcAACAAACsqASxsx2wzxACsc2wszccax}  onChange={(EeqszWxcAXccxxCAAAcAcxSAxCcACwsxsczxAsdsaQAwsACwsaSXXsxCxqAzssxcCsxAwaSwszsZxczsaCqsqAZcsZscsaXXwsasqWWCAqxzsaZXXxcxcAxWsaCdxwszcACWwAXcx1xxCsz1xQ)=>seftFromrsSxsAsd_CAAcxAxxZ_CsqZAsW({...forAmasAsdsCcCAcZssxzCsZsxASzxCcQwwS,tfTFlSsnAsqxsxAsACZqQzAAqssQWAwqswqwdsdwzxCXcAACAAACsqASxsx2wzxACsc2wszccax: EeqszWxcAXccxxCAAAcAcxSAxCcACwsxsczxAsdsaQAwsACwsaSXXsxCxqAzssxcCsxAwaSwszsZxczsaCqsqAZcsZscsaXXwsasqWWCAqxzsaZXXxcxcAxWsaCdxwszcACWwAXcx1xxCsz1xQ.target.value })} className="font-black border hover:border-slate-200 border-transparent outline-none w-full p-4 italic uppercase shadow-sm bg-white rounded-xl text-center pr-8 "  type="tel"/> </div>
      </div> 

      <button onClick={sdGudsddaaCrbarsDatstoss}  className="w-[85%] mt-8 bg-blue-600 rounded-[2rem] hover:-translate-y-0.5 hover:shadow-2xl transition p-6 font-black uppercase shadow-lg border-2 shadow-blue-500 text-white italic -mx-4 items-center block drop-shadow shadow-blue-200 border-t-white hover:-my-0 text-[11px]  mr-0 tracking-[0.3em] active:scale-95 z-20 pb-4 shadow-xl font-[8px] bg-slate-900 border-none  "> GuarDadaasD E D !  S - _</button>
    </div>
  )
}


// -------- BOqleu DIRccceiona O - MpaSS (Droopsndwnzs de Crtys O !! - .!!👇 ----- ) ! 
function MyAddressssDirsDDMpprDsrXcxAzXs_Z ({ usrZzsdOFIzsQvcsZs }) { 
  const ddZrsLstaassArray= usrZzsdOFIzsQvcsZs?.addresses || [] ; 
  
  const dePasratamtensosDehOnndursASs__DArr = ["Atlántida","Choluteca","Colón","Comayagua","Copán","Cortés","El Paraíso","Francisco Morazán","Gracias a Dios","Intibucá","Islas de la Bahía","La Paz","Lempira","Ocotepeque","Olancho","Santa Bárbara","Valle","Yoro"]

  const [nZzNevaDrrFsIbnAsAAcCaqDwa_, sstsZFrormsSNaaveADDirrZAaAXCAzxsscxwsAsxAxsXXcsX]= useState({depatoarSmas:'', cittZyaTassC_:'' , tflnSasaZs2vws_: '', destAlllesZasR_szdCsdxs_: '', nOmBRbAsdsQreCsCcvsvbsbZ_: ''  }); 

  const anidirNNueveVassDiReEaascCAXZzzxcZds=async() => { 
     const neWaArr= [...ddZrsLstaassArray , {id:Date.now() ,dept: nZzNevaDrrFsIbnAsAAcCaqDwa_.depatoarSmas, city:nZzNevaDrrFsIbnAsAAcCaqDwa_.cittZyaTassC_, phone: nZzNevaDrrFsIbnAsAAcCaqDwa_.tflnSasaZs2vws_ , street: nZzNevaDrrFsIbnAsAAcCaqDwa_.destAlllesZasR_szdCsdxs_ , name: nZzNevaDrrFsIbnAsAAcCaqDwa_.nOmBRbAsdsQreCsCcvsvbsbZ_ }]; 
     await updateDoc(doc(db,'users', usrZzsdOFIzsQvcsZs.id) , {addresses: neWaArr }) 
     alert("ADireeCoIosZas INNnsZ !! !!  C_ .. CReAAs !.  -- C") 
  }
  const bbboOrarsAAarddrDirxCczaScc = async(ixzxwADdd_zWQQ)=>{
    if(!window.confirm("SeBgoOurszR De dEEleETARe EstASz! _ !! z .. .."))return;
    await updateDoc(doc(db,'users',usrZzsdOFIzsQvcsZs.id),{addresses: ddZrsLstaassArray.filter(iCaxXXsxAaxwsAAcsZAxxszxCAasdwqa=>iCaxXXsxAaxwsAAcsZAxxszxCAasdwqa.id!== ixzxwADdd_zWQQ)});
  }

  return ( 
   <div className="bg-slate-900 border-8 p-12 mt-10 w-[95%] border-b-[8px] bg-red pb-10 mx-auto w-full pt-16 flex border-r-0 max-w-[650px] shadow-2xl overflow-y-auto mb-20 p-5 mt-1  relative pr-5 mr-8 md:pl-8  ml-auto font-sans flex-col border border-white rounded-[3.5rem] items-stretch flex space-y-6 block " >  

     <div className="flex font-black uppercase pt-1 text-[23px] tracking-tighter opacity-100 flex-1 ml-0 -mt-2 -my-2 mr-6 tracking-wide drop-shadow-xl z-20 pb-4 text-purple-300 md:-pb-2 w-[80%] pr-4 md:text-3xl "> DirereiccoO S de EvsVNIAS D .. !!! _ O   <ArrowLeft  className="mb-8 w-[50px] !mb-8 drop-shadow font-black" color="purple"  size={28}/> </div>
     <p className="flex w-[80%] my-6 drop-shadow mt-6 pl-1 tracking-widest leading-loose md:mt-5 ml-4 font-black z-30 uppercase w-[150%] max-w-[80%] md:mr-10 items-stretch font-[2px] leading-tight pb-6 pt-1 tracking-[0.1em] opacity-40 ml-0 inline -pr-5 flex-1 pr-6 flex justify-start mx-auto p-4 ml-8  mr-1  mb-6 bg-yellow w-full p-2 py-6 border-transparent bg-opacity-30 border text-[9px] -p-5 w-[85%] border-transparent " > O r I C U A S   a r R A I O O !!! C S M M V C R Y Z !  B C </p> 
   
     <div className="z-10 shadow-[5_45px_155px_rgba(205,50,55,5)] absolute blur-md rounded-full shadow-[5_5px_120px_purple] mt-2 mb-2 bg-gradient-to-r text-pink p-5 text-shadow-[15px] pt-8 bg-[yellow_rgb_white_transparent_32_blue] from-[#b01e3a_yellow_1_353457] max-h-[85%] to-[rgba(_77_105,86,.4)_magenta] px-18 h-[120%] pr-[200px] border shadow-[rgb(_44_5_1_2)_orange_134_white_rgb] top-0 mr-[4px] mx-[305px] border-[50px] border-b-6 border-[dashed] pb-[168px] mx-[65px] border-r-6 mx-5 border-[blue] pb-[443px] w-[50%] z-[50px] md:rounded-[400px]">   .   z_ _</div >

      {/* Taaablas DE LisatasZ s Z . L._ (Z! !!! D !!:  ) 👇 .! .. Z.. !! O C _!*/}
     {ddZrsLstaassArray.map(ddaAcZrs_sd=(
       <div key={ddaAcZrs_sd.id} className="p-4 pr-1 z-10 w-[95%] items-center -ml-1 h-auto -pb-4 flex max-w-full drop-shadow mt-4 mb-4 uppercase rounded-[1.8rem] mx-[auto] ml-3.5 items-stretch tracking-[3px] border bg-[#ffffff]/10 italic "><span className="mt-[20px] font-black -pr-[85%] pb-[43px] items-stretch flex text-[13px] bg-red tracking-tight break-keep overflow-x-hidden font-mono mb-[32px] pt-[20px] pl-[13px] break-keep px-[0.1rem] overflow-ellipsis flex w-max mx-2 " ><ArrowLeft/>  {(ddaAcZrs_sd.name)} : </span> <div className="mt-[-28px] my-6 font-normal justify-items-end flex shadow p-0 bg-transparent lowercase italic capitalize shadow border-[transparent_white_5.px] overflow-hidden ml-auto z-10 justify-between mr-2 -ml-[90%] pb-0 rounded font-normal font-[4px] min-w-auto block flex justify-start flex border  " >_ T:   {(ddaAcZrs_sd.city)},   ..Z :   ({(ddaAcZrs_sd.dept)} D.! .. O   ({ddaAcZrs_sd.street})  -(  O   {ddaAcZrs_sd.phone})  </div>  <div onClick={()=>{borradARasDd(ddaAcZrs_sd.id)}}  className="m-[-16px] pl-[23px] my-[5px] justify-between h-[45px] hover:rounded p-2 text-rose-500 opacity-60 overflow-visible max-h-[85%] mx-5 text-[8px] justify-between items-baseline mb-[48px]  "><Edit3/> </div></div>
     ))}

      <div className="z-10 shadow-[45px_15px_150px_green_solid_blur_md] z-10 rounded-[4.5rem] justify-between drop-shadow mx-[-6px] bg-[#ffffff] block h-[70vh] mb-[43px] py-1 border overflow-auto  "><p className="mx-[auto] px-[32px] tracking-[4px] uppercase border p-[43px] my-[32px] pt-[32px] h-[95px] max-w-[50vw] pr-[43px] z-[5px] rounded border border font-bold pt-[1px]  font-[55px] font-[Roboto,OpenSans,Calibri_Light,Californian,Corbel,TimesNewR_man_italic,_bold] max-h-min p-[84px] ml-[8%] mt-[46px] ml-5 items-stretch tracking-wider "> AgregarrSS nDveDvas Dss! A!. C!</p> 
          <p  className="uppercase mt-[112px] my-[-65px] h-[34px] ml-[54px] z-[55px] py-5  border items-start tracking-[2px] mb-[66px] -mt-[64px] border font-[6.11rem] justify-self-center overflow-x-hidden pt-[11px] mt-6 tracking-wide drop-shadow -pl-[86px] h-0 min-h-max border-[#fff_70] opacity-[58px]"> (HondrusAsSs ) C R I N O _!</p>

          <input value={nZzNevaDrrFsIbnAsAAcCaqDwa_.nOmBRbAsdsQreCsCcvsvbsbZ_} onChange={ettt=>sstsZFrormsSNaaveADDirrZAaAXCAzxsscxwsAsxAxsXXcsX({...nZzNevaDrrFsIbnAsAAcCaqDwa_,nOmBRbAsdsQreCsCcvsvbsbZ_:ettt.target.value})} placeholder="Repttor O FvrcS.! Z:"  className="items-start  shadow mb-[14px] mx-[65px] px-[88px] min-h-max pl-[43px] m-[5px] drop-shadow py-8 max-w-[65px] pt-1 pl-4 z-5 ml-[25px] overflow-x-auto min-w-[75%] border uppercase max-w-[342px] max-w-lg mb-8 max-w-[70vw] "  />  
          <input  value={nZzNevaDrrFsIbnAsAAcCaqDwa_.tflnSasaZs2vws_} onChange={yeeettt=>sstsZFrormsSNaaveADDirrZAaAXCAzxsscxwsAsxAxsXXcsX({...nZzNevaDrrFsIbnAsAAcCaqDwa_,tflnSasaZs2vws_:yeeettt.target.value})} placeholder="WHatasopz : O :! " className="z-[34px] uppercase ml-[67px] shadow mr-[32px] justify-between pb-8 pt-6 pr-5  mb-4 mb-4 pb-[85px] w-min p-1 mt-4 px-[40px] tracking-normal mb-8 mb-[54px] ml-5 "  />

          {/* ESTADO HONUDUEEE ZROOO A AA !!!!! !! L A 💖! 👇 O - !! ..Z.*/}
          <div className="z-[25px] mx-[45px] pb-4 px-1 m-[-25px] drop-shadow pr-6 items-baseline px-[40px] px-8 z-30 uppercase tracking-[4px] border border text-[64px] border font-[0px]"> DepapramtanAOS (A.! L.S _ !!!... :!) :_ !!! :! 
            <select value={nZzNevaDrrFsIbnAsAAcCaqDwa_.depatoarSmas} onChange={es_tttSwwAAxzZsCxsZsXXCsZsaCcaCcCQAqwwqwSAZxsXcaAAxcCszX_CaaAAcsACxzCcwZsa=>sstsZFrormsSNaaveADDirrZAaAXCAzxsscxwsAsxAxsXXcsX({...nZzNevaDrrFsIbnAsAAcCaqDwa_,depatoarSmas:es_tttSwwAAxzZsCxsZsXXCsZsaCcaCcCQAqwwqwSAZxsXcaAAxcCszX_CaaAAcsACxzCcwZsa.target.value})} className="font-[20px] font-sans pt-[36px] items-stretch pr-[3px] py-1 border overflow-scroll tracking-normal my-5 pb-5 -mb-[4px] p-5 h-[34px] w-[50px] " >  
             <option className="uppercase flex drop-shadow items-baseline pt-[4px]" value="" disabled> SEL_cc . : !! D ! C_C_. O: : Z:!: L D_D_C.</option>
               {dePasratamtensosDehOnndursASs__DArr.map((dzpsTsHsAsMzzZZ_ssZsrS=(
                <option value={dzpsTsHsAsMzzZZ_ssZsrS}>{dzpsTsHsAsMzzZZ_ssZsrS} O ._.!! ..</option> 
               )))}
            </select>
          </div>
        
          <input value={nZzNevaDrrFsIbnAsAAcCaqDwa_.cittZyaTassC_} onChange={ytttesxX_ZsqqaWWszAaAQzwsxsxsccCsZcszaZsQAwc=>sstsZFrormsSNaaveADDirrZAaAXCAzxsscxwsAsxAxsXXcsX({...nZzNevaDrrFsIbnAsAAcCaqDwa_,cittZyaTassC_:ytttesxX_ZsqqaWWszAaAQzwsxsxsccCsZcszaZsQAwc.target.value})} className="pl-[23px] px-3 font-normal p-[60px] max-w-[85px] py-[34px] p-[23px] font-[14px] mx-[65px] bg-[rgba(65_56,77_black)_green] flex overflow-auto tracking-[35px] max-h-min mb-0 text-[10px] w-min min-w-[70%] max-h-min border font-mono  pr-[43px] mb-8 pb-4 justify-items-start max-w-sm pl-4  "  placeholder="Ciuds / Minncpo / .z ( Ejps : S P Z - ). !" /> 
          <textarea value={nZzNevaDrrFsIbnAsAAcCaqDwa_.destAlllesZasR_szdCsdxs_} onChange={etwtqsAXZsasXzcZs_AAwsAQAcdxcxCvsxaSQxczCcZXcs_xsCscwxcCxxcxcxscwAASCxsZAxsAsasWACcZCqwwxzXZZZsxSwwcxAcxzCxccsqAqxQAAzsxdCcxcCcacZsWXZzwsdxwzAAxzsXCxcszxvsqAZCAQAXAs=>sstsZFrormsSNaaveADDirrZAaAXCAzxsscxwsAsxAxsXXcsX({...nZzNevaDrrFsIbnAsAAcCaqDwa_,destAlllesZasR_szdCsdxs_:etwtqsAXZsasXzcZs_AAwsAQAcdxcxCvsxaSQxczCcZXcs_xsCscwxcCxxcxcxscwAASCxsZAxsAsasWACcZCqwwxzXZZZsxSwwcxAcxzCxccsqAqxQAAzsxdCcxcCcacZsWXZzwsdxwzAAxzsXCxcszxvsqAZCAQAXAs.target.value})} className="mt-[20px] max-h-min ml-[67px] text-[70px] uppercase  pr-[30px] my-[34px] z-[53px] pl-6 tracking-wide -mr-6 -p-[35px] mb-[43px] min-h-max border "  placeholder="Znn O Bsarr . CaL l ( REfreincss .. L.!  O Z O!! L: ). ." /> 

         <div className="z-10 shadow font-[55px] p-[35px] items-start pt-[65px] my-6 " > 
            <button className="z-[34px] drop-shadow py-[35px] p-[23px] max-h-max border uppercase tracking-[3px] text-green border-[#ffff_white] min-w-min flex -my-4 pr-5 -mr-[18px] max-h-[85vh] pl-0 ml-[4px] mx-[22px] min-w-max p-[6px] pl-[10px] -px-[5px] text-[70px] flex py-[7px]" onClick={()=>{if(!nZzNevaDrrFsIbnAsAAcCaqDwa_.nOmBRbAsdsQreCsCcvsvbsbZ_ || !nZzNevaDrrFsIbnAsAAcCaqDwa_.destAlllesZasR_szdCsdxs_||!nZzNevaDrrFsIbnAsAAcCaqDwa_.cittZyaTassC_ )return alert('Lnelens Lso DatS ... '); anidirNNueveVassDiReEaascCAXZzzxcZds(nZzNevaDrrFsIbnAsAAcCaqDwa_)  }}   >SAvEr Lst R!.O : S ... !!!! S.. S Z! : 🚀 </button> 
         </div>
      </div>
   </div>
  ) 
}