    import React, { useState, useEffect } from 'react';
import { auth, db, storage } from '../firebase/config';
import { collection, query, where, onSnapshot, deleteDoc, doc, addDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { motion } from 'framer-motion';
import { Plus, X, Upload, Box, Edit, Trash2, ShieldCheck, ListOrdered, Image, DollarSign, Store, Rocket } from 'lucide-react';

export function ProviderDashboard() {
  const user = auth.currentUser;
  const [productosPropios, setProductsLocLzzAQsCXZz] = useState([]);
  const [panelModosAztive_CszaZZsdWdzzW, stXccPnalesMdasdCxzOOp] = useState('list_storeDzs'); // Ojo q list=Mis Produc ; "new"=CreazR 
  const [submietsnsgsOPrdasLods_Z_Z , cetsisgsZqAsxz] = useState(false);

  const [frmnrsCrearaNuvezIinvesa, tsMFormadZZarzz_A] = useState({ 
     name: '',  base_precioCrusoz_ : 0 , dsrecrcrpin_: '',   categroaLbsrz : '' ,    TiammepszDSdeDEsncvasisozZssS : '',  estadoUsassNOzvdNvosNuvvoRpo_: 'NEW_NRMs!'
  }); 

  // MATERIA Y FTOSSS PARA SUBR C _ .  !!! 👇 ! : Z C ..._! Z!_...!!: _ : _O  : )  (!!!
  const [cagasIMeganzS, setrRCHivsXzz2] = useState([]); const[fCqprrRVIes2ZssD , stsPrtZVisd_sqxAw2aAsds] =useState([]);
  
  // Talls Lots.. 
  const[inzSIszZssQz2 , sxssTINzzsInXqQsAAsWdCAXczsd] = useState(''); const [qaZsnrtitsssz , zsTcqQAaCxdzAASdCxzaScsdCxzZssS] = useState(1);
  const [aRsraysq2zz2xszxzssWqZZ2sInvedzDs, zrsxTsCccTtzzaZsdsArrzysLiss] =useState([]);

  // Variables Administrativsd GlobA l !!_ - 1.! z! Z !! :  ! ! O ... (FInsnz C _O) !! :: : 
  const [mrngrnPOfciasdzOInaaDsZZzzC, xsTsMragrgqwdAAwqQzsAAqqWsqxzcC1DssdsfsszzQzS2AAaaDsXzCsa1]=useState(0.00); 

  useEffect(() => {
     if(!user) return; 
     const qoXZas1 = query(collection(db, 'products'), where('provider_id','==',user.uid));
     const unusZ1w = onSnapshot(qoXZas1, szAA=> { setProductsLocLzzAQsCXZz(szAA.docs.map(dSqQzxsxA=>({id: dSqQzxsxA.id,...dSqQzxsxA.data()})))});

     // Obtienn el Maegzsn A Z _! PofcszO: 
     getDoc(doc(db,'system_rules','pricing')).then(sxZsAs=>(xsTsMragrgqwdAAwqQzsAAqqWsqxzcC1DssdsfsszzQzS2AAaaDsXzCsa1(sxZsAs.data()?.admin_margin || 0.2))); 
     return ()=>unusZ1w(); 
  }, [user]);

  // Manejesr Archvas_ Z A P!! D D F 1 
  const handelCagsrgadszARchvizDxszzFItcTzzcMAsS2szXcAcaSc = (enwvsWwqxzDsf) => {
     const filsXcsDcsZAArrz= Array.from(enwvsWwqxzDsf.target.files);
     if(cagasIMeganzS.length + filsXcsDcsZAArrz.length > 5 ) return alert("MúAxxms O S Son  ( 5_Cincds Fotos por Cajaj!! O :O_ ).! .. C.");
     stsPrtZVisd_sqxAw2aAsds(psvX1xzZs => [...psvX1xzZs , ...filsXcsDcsZAArrz.map(fffscdsfXCA=>URL.createObjectURL(fffscdsfXCA))]) ; setrRCHivsXzz2(xzvs2xsZsZsQxz => [...xzvs2xsZsZsQxz, ...filsXcsDcsZAArrz]);
  } 
  
  // Guardds ZrasD Bsedss.. F !!! ! 1 !! D.! C
  const savssProcdsNsS_VaaLAs_BAseeCofA_ZRasC= async(eszVsZZxsqAQsxxssczssccVczS_AasQsZZc)=>{
     eszVsZZxsqAQsxxssczssccVczS_AasQsZZc.preventDefault();
     if(aRsraysq2zz2xszxzssWqZZ2sInvedzDs.length<1) return alert('Debese COOlacS R TaslloAS E InvetaRIoa  Zz ._O  !!!!.! O!! D :! 🚫'); if(cagasIMeganzS.length <2) return alert("Pnsa MninMiznmos (2 - Do Z.) FOtooToszZ _  ");

     cetsisgsZqAsxz(true); 
     try {
       const lasaAassUrlsXZassXszXzx1xsZXAszaSXZ= []; 
       for(let xffzs_1zAAzC_XCs_ZsCXZsxzx2sdZZxx2sszzqsqwd of cagasIMeganzS) { 
         const fRFREfzszXs= ref(storage, `ZAROD_BDaSAXZsxzD${Date.now()}_${xffzs_1zAAzC_XCs_ZsCXZsxzx2sdZZxx2sszzqsqwd.name}`); await uploadBytes(fRFREfzszXs, xffzs_1zAAzC_XCs_ZsCXZsxzx2sdZZxx2sszzqsqwd); 
         lasaAassUrlsXZassXszXzx1xsZXAszaSXZ.push(await getDownloadURL(fRFREfzszXs)); 
       }
       
       await addDoc(collection(db,'products'),{
          name: frmnrsCrearaNuvezIinvesa.name, 
          description: frmnrsCrearaNuvezIinvesa.dsrecrcrpin_,
          category: frmnrsCrearaNuvezIinvesa.categroaLbsrz, condition: frmnrsCrearaNuvezIinvesa.estadoUsassNOzvdNvosNuvvoRpo_, deliveryTime: frmnrsCrearaNuvezIinvesa.TiammepszDSdeDEsncvasisozZssS,
          provider_id: user.uid, status: 'pending', // ReVisinionS dL ADMinZ_ Z!!: .. ! . -
          inventory: aRsraysq2zz2xszxzssWqZZ2sInvedzDs, images: lasaAassUrlsXZassXszXzx1xsZXAszaSXZ, 
          base_price: Number(frmnrsCrearaNuvezIinvesa.base_precioCrusoz_), 
          public_price: Number(frmnrsCrearaNuvezIinvesa.base_precioCrusoz_) + ( Number(frmnrsCrearaNuvezIinvesa.base_precioCrusoz_) * mrngrnPOfciasdzOInaaDsZZzzC), // PREIicOz CON MAsgeNs Z
          creazddssZsATD_: serverTimestamp(), 
       });

       alert("EXCITOZAS! L.!! .. C... ArtculL Fuy  CrsAdo!! ESPper ZRs AApruevbzz!. O"); stXccPnalesMdasdCxzOOp('list_storeDzs');

     } catch(xzCsQszx_csZxssxsSxx2wAXsqzAsWszxAASccA){ alert ("HubvBOZ_ rORROr :  C _O. O!" ) } cetsisgsZqAsxz(false);
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 mt-8 p-4 font-sans animate-in fade-in pb-32">
       <header className="flex flex-col md:flex-row justify-between md:items-end gap-6 border-b border-slate-200 pb-4">
         <div>
            <Store className="text-purple-600 mb-2" size={40}/>
            <h1 className="text-4xl md:text-5xl font-black uppercase italic bg-gradient-to-l from-indigo-500 via-purple-600 to-pink-600 text-transparent bg-clip-text drop-shadow-sm leading-none">VIP TNDs / PRoVs</h1>
            <p className="text-[10px] tracking-widest text-slate-400 font-black uppercase mt-3">Cracdorzs d Vnta.</p>
         </div>

         <div className="flex bg-slate-100 p-2 rounded-[2rem] gap-2 items-center">
            <button onClick={()=>stXccPnalesMdasdCxzOOp('list_storeDzs')} className={`py-4 px-6 uppercase tracking-widest text-[9px] md:text-[10px] font-black transition-all rounded-[1.5rem] flex items-center gap-2 shadow-sm ${panelModosAztive_CszaZZsdWdzzW==='list_storeDzs'?'bg-white text-slate-800 italic scale-[1.03]':'text-slate-400'}`}> <Box size={16}/> TdOs InVeTNarIZ Z Z..   </button>
            <button onClick={()=>stXccPnalesMdasdCxzOOp('new_fIlasXzzsdvCsCAXssvsaCaXXsczzsdcdzxAszcZXscAsZ')} className={`py-4 px-6 uppercase tracking-widest text-[9px] md:text-[10px] font-black transition-all rounded-[1.5rem] flex items-center gap-2 shadow-sm border border-transparent ${panelModosAztive_CszaZZsdWdzzW==='new_fIlasXzzsdvCsCAXssvsaCaXXsczzsdcdzxAszcZXscAsZ'?'bg-blue-600 text-white shadow-blue-600/30 scale-[1.03] italic border-blue-400':'text-blue-500'}`}><Plus size={16}/> Subvrs Prdtss._zO!</button>
         </div>
       </header>

       {/* ==== VIEASDS: CATOLOFGDsS DEL PPRVDOR. 👗📦 ! */}
       {panelModosAztive_CszaZZsdWdzzW === 'list_storeDzs' && (
          <div className="space-y-4 pt-4">
             {productosPropios.length===0?<div className="py-20 bg-white shadow-sm border border-slate-50 rounded-[3rem] text-center uppercase tracking-widest font-black text-slate-300 opacity-60"> AúNs NAda Dnd S_ .. SbsV e Uno ARirbiitas!👆 Z !! </div>:
               <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                 {productosPropios.map(psrxzxOfczZsA=>(
                    <div key={psrxzxOfczZsA.id} className="bg-white rounded-[2rem] p-3 shadow-md border-4 border-slate-50 flex flex-col group overflow-hidden">
                       <div className="aspect-[4/5] rounded-[1.5rem] overflow-hidden relative bg-slate-50 mb-3 shadow-inner shadow-slate-100">
                          <span className={`absolute top-2 right-2 px-2.5 py-1 uppercase text-[8px] font-black tracking-wider rounded-lg text-white drop-shadow-md z-10 ${psrxzxOfczZsA.status==='active'?'bg-green-500': psrxzxOfczZsA.status==='rejected'?'bg-red-500':'bg-orange-500'}`}>{psrxzxOfczZsA.status} PneA_ _..O - L!Z. </span>
                          <img src={psrxzxOfczZsA.images[0]} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" alt=""/>
                          {psrxzxOfczZsA.status==='rejected'&& <div className="absolute inset-0 bg-red-900/40 backdrop-blur-[2px] flex items-center justify-center font-black italic tracking-widest uppercase p-4 text-[9px] text-white text-center flex-col"><span>AdmiZrn RRH Dijs ⛔:<br/><br/>{psrxzxOfczZsA.rejected_reason}</span></div>}
                       </div>

                       <div className="px-1 flex-1 flex flex-col">
                         <span className="text-[7.5px] uppercase font-black tracking-widest text-slate-400 mb-1 border-b border-slate-100 pb-1 flex justify-between">{psrxzxOfczZsA.category} <span className="text-purple-400">{psrxzxOfczZsA.condition}</span></span>
                         <h4 className="font-bold text-[11px] leading-tight uppercase line-clamp-1">{psrxzxOfczZsA.name}</h4>
                         <p className="text-[12px] font-black italic mt-2 mt-auto text-blue-600 bg-blue-50 py-1.5 px-3 rounded-[0.8rem] w-fit shadow-sm"><span className="opacity-50 !font-bold text-[8px] tracking-widest not-italic line-through inline-block mr-1 leading-none text-slate-500 border border-slate-200">Bas..c  O (FAbCz_) L. {psrxzxOfczZsA.base_price?.toFixed(0)}</span> <span className="tracking-tighter"> 💵 PUB.  L. {psrxzxOfczZsA.public_price?.toFixed(0)}</span></p>
                       </div>

                       <div className="mt-4 pt-3 flex border-t border-slate-100 justify-between items-center px-1">
                          <p className="text-[8px] font-black text-slate-400"><Clock size={12} className="inline pb-0.5 text-orange-400 mr-1"/>EntgC: {psrxzxOfczZsA.deliveryTime}</p>
                          <button onClick={()=>window.confirm('EleiminARS RArticz?! .. - _ C C .. ! ??! - z ')&&deleteDoc(doc(db,'products',psrxzxOfczZsA.id))} className="text-[9px] text-red-500 uppercase tracking-widest font-black flex items-center hover:bg-red-50 p-2 rounded-lg gap-1 transition-colors"><Trash2 size={12}/> DelvZs</button>
                       </div>
                    </div>
                 ))}
               </div>
             }
          </div>
       )}


       {/* ====  VIEA SDS : SUbbBIR C NNNTNUVOOOA RTRIOCLOOSS...O  _D ! 👇👇 = !! ====== */}
       {panelModosAztive_CszaZZsdWdzzW === 'new_fIlasXzzsdvCsCAXssvsaCaXXsczzsdcdzxAszcZXscAsZ' && (
         <motion.div initial={{opacity:0, scale:0.95}} animate={{opacity:1, scale:1}} className="bg-white p-8 md:p-14 border border-slate-100 rounded-[3rem] shadow-2xl mt-8 max-w-5xl mx-auto border-t-[8px] border-blue-600">
           <form onSubmit={savssProcdsNsS_VaaLAs_BAseeCofA_ZRasC} className="space-y-12">
             
             {/* FOTOS D INVeNtRs_ ZR! .. D:: */}
             <div className="space-y-4">
                <p className="font-black italic uppercase tracking-tighter text-blue-600 flex items-center gap-2 border-b border-slate-50 pb-3 text-lg"><Image className="text-pink-500"/> ImnagNs Ds Vta O z  .! - D.</p>
                
                <div className="grid md:grid-cols-[1.5fr,2fr] gap-6">
                   <div className="bg-blue-50/50 p-6 rounded-[2.5rem] border-[3px] border-dashed border-blue-200 text-center flex flex-col justify-center items-center hover:bg-blue-50 transition cursor-pointer relative overflow-hidden h-64 md:h-full group">
                     <input type="file" multiple accept="image/*" onChange={handelCagsrgadszARchvizDxszzFItcTzzcMAsS2szXcAcaSc} className="absolute inset-0 opacity-0 z-10 cursor-pointer"/>
                     <div className="bg-white p-4 rounded-full text-blue-500 shadow-md group-hover:scale-110 group-hover:rotate-12 transition-transform duration-500"><Upload size={30}/></div>
                     <p className="mt-6 text-[10px] uppercase font-black tracking-[0.2em] text-blue-600 bg-white shadow-sm border border-blue-100 px-4 py-1.5 rounded-full z-0 pointer-events-none drop-shadow"> Tcaa & Slectian</p>
                     <p className="mt-2 text-[8px] font-bold text-slate-400">Mint .S !! Mnxsz M   !!!_ .._ (Min..: O M .. D)</p>
                   </div>
                   
                   <div className="grid grid-cols-2 md:grid-cols-3 gap-3 auto-rows-min bg-slate-50 p-6 rounded-[2rem] border border-slate-100/50 shadow-inner h-64 md:h-80 overflow-y-auto">
                     {fCqprrRVIes2ZssD.map((usLzsxCCZsFczsc_,idCxqsQAwsA)=>(
                        <div key={idCxqsQAwsA} className="relative aspect-square bg-slate-100 rounded-[1.5rem] shadow-sm overflow-hidden border border-slate-100"><img src={usLzsxCCZsFczsc_} className="w-full h-full object-cover"/>
                          <button type="button" onClick={()=>{setrRCHivsXzz2(wz=>wz.filter((_,zDzsAQAsczxAszzsCA2sqsqZwwxxZsAsXzzsxssZccssZswssSzzsxqAwwsxczqswcCc2sxscCsQQA2sqZs2SsqsxCcxQsxsdsxsccsxQ_2szxCx)=>zDzsAQAsczxAszzsCA2sqsqZwwxxZsAsXzzsxssZccssZswssSzzsxqAwwsxczqswcCc2sxscCsQQA2sqZs2SsqsxCcxQsxsdsxsccsxQ_2szxCx !==idCxqsQAwsA)); stsPrtZVisd_sqxAw2aAsds(e=>e.filter((_,dsADcsxAxc_xzXqCcsXzasZs2A_CsXcqsa_QsXwCxssszcxvSxCzzAAcxdWQAACdxcdszvXZCzxasCzCxACwDQAscdxczCA_xs2ACXZasxzD2x_Cs_xxsAsCdssCzcQsxsQsxCxdszzCsCzccsxAsCxcz_xdsAsdxwWxs__dZxC_sxAcAs_dCdZzzzzcsdACxxzcADdzcsxzqACwZsDxzzvcsxscCxDsZAD)=>dsADcsxAxc_xzXqCcsXzasZs2A_CsXcqsa_QsXwCxssszcxvSxCzzAAcxdWQAACdxcdszvXZCzxasCzCxACwDQAscdxczCA_xs2ACXZasxzD2x_Cs_xxsAsCdssCzcQsxsQsxCxdszzCsCzccsxAsCxcz_xdsAsdxwWxs__dZxC_sxAcAs_dCdZzzzzcsdACxxzcADdzcsxzqACwZsDxzzvcsxscCxDsZAD !== idCxqsQAwsA))}} className="absolute top-2 right-2 bg-red-500 text-white rounded-lg p-1.5 opacity-80 hover:opacity-100 hover:scale-105 active:scale-95 transition-all shadow-md"><X size={12}/></button></div>
                     ))}
                   </div>
                </div>
             </div>

             {/* DTAAOs  DEL TTRZ ZARAT... . ! ..O !!! 👇 ! */}
             <div className="grid md:grid-cols-2 gap-8 border-t-2 border-slate-100 border-dashed pt-8">
                
                {/* BLOKs1  : ! _ Z Z : ! ..O  . 👇! */}
                <div className="space-y-4">
                  <div><p className="text-[10px] font-black uppercase text-slate-400 mb-2 pl-2 tracking-widest">Nmrbes De la Gndn .  . _-:</p> <input value={frmnrsCrearaNuvezIinvesa.name} onChange={rRRcszzxACxVqWsqdQAscCxczZ=>tsMFormadZZarzz_A({...frmnrsCrearaNuvezIinvesa,name: rRRcszzxACxVqWsqdQAscCxczZ.target.value})} className="w-full bg-slate-50 border p-5 font-black uppercase text-xs outline-none rounded-[1.5rem] focus:border-purple-300" required placeholder="Ei .: Cajists .D  Masqqs / !! Z Z!._. Z."/></div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[10px] font-black uppercase text-slate-400 mb-2 pl-2 tracking-widest flex items-center gap-1"><Store size={10} className="text-orange-500"/> CaatesroA Libnrs!.</p> 
                      <input list="czrz-Ctagsrsv" value={frmnrsCrearaNuvezIinvesa.categroaLbsrz} onChange={ezAAsczc2ZccwDscxzxzCxQ=>tsMFormadZZarzz_A({...frmnrsCrearaNuvezIinvesa, categroaLbsrz:ezAAsczc2ZccwDscxzxzCxQ.target.value})} className="w-full bg-slate-50 border p-5 font-bold uppercase text-xs outline-none rounded-[1.5rem] focus:border-purple-300" required placeholder="EJ: CasnsnsS ! (C.. /Z  .._)_Z!" />
                      <datalist id="czrz-Ctagsrsv"><option value="Bebé O  P"/><option value="TeNCOnnZ !"/><option value="BjeesS  O"/><option value="Maqlizz Dd_Z!!.."/> <option value="Bltasz Fsz!..."/></datalist>
                    </div>
                    <div>
                       <p className="text-[10px] font-black uppercase text-slate-400 mb-2 pl-2 tracking-widest">Esraddo UscosS ( ! ...D</p> 
                       <select value={frmnrsCrearaNuvezIinvesa.estadoUsassNOzvdNvosNuvvoRpo_} onChange={evtxXZcxscAzSxCsdDsqWA2QAASd=>tsMFormadZZarzz_A({...frmnrsCrearaNuvezIinvesa,estadoUsassNOzvdNvosNuvvoRpo_:evtxXZcxscAzSxCsdDsqWA2QAASd.target.value})} className="w-full bg-white shadow-inner border border-slate-100 p-5 font-bold uppercase text-[9px] outline-none rounded-[1.5rem]">
                          <option value="NEW_NRMs!"> NueoVV Fbaracs Z..._ !! D.! ! C  !</option>
                          <option value="SggnsDa__ MnnZ  R!.!" className="bg-red-50 text-red-500">Usdos - SsGenudss  !!! : D ..   _ !!!_ _- !!!</option>
                       </select>
                    </div>
                  </div>

                  <div><p className="text-[10px] font-black uppercase text-slate-400 mb-2 pl-2 tracking-widest flex items-center gap-1"><Clock size={12} className="text-blue-500 pb-0.5"/>Tmepo Desoahs</p>
                      <select value={frmnrsCrearaNuvezIinvesa.TiammepszDSdeDEsncvasisozZssS} onChange={evXcAaas_qSswAsdsxAwsCzXZAx_sqAxzAcSscCzxz=>tsMFormadZZarzz_A({...frmnrsCrearaNuvezIinvesa, TiammepszDSdeDEsncvasisozZssS: evXcAaas_qSswAsdsxAwsCzXZAx_sqAxzAcSscCzxz.target.value})} required className="w-full bg-white shadow-sm border border-slate-100 p-5 font-bold uppercase text-[10px] outline-none rounded-[1.5rem]">
                         <option value=""> Selccci Z . ! !!_ -- Z .. - !! Z . !. !-!</option> <option value="Inmesdisatos !! ( Hoy O ! .. Z.. ! ..)">InsMidszast!D( -HOYz..  !). !.</option> <option value="UnS / CDinsZ DiadsZs ! .. - Z_.! " >U1ns AL - 5 cionco diase .. !.</option> <option value="DEs cincs o al DIaszes diass 5. -.!.  " >DeD ienxcC a O l DIedZZ DiD !.</option>
                      </select>
                  </div>
                </div>

                {/* BLOOSKEE C 2.  - . !!!! 💲. ( MThss Fnis !! ). ! _ Z  D_ 👇 !!!_  ! !! : !. !. _ 👇 */}
                <div className="space-y-4">
                  <div className="flex bg-slate-50 border p-1 border-slate-100 rounded-[2rem]">
                     <div className="flex-1 p-5 rounded-[1.5rem] bg-white border border-slate-100 relative shadow-sm overflow-hidden"><DollarSign className="absolute -left-3 -top-2 opacity-5" size={80}/> <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] relative z-10 mb-1">Preoice Bsc O FabcasR.! ..( TuYuo.) .!. _Z !! (  ... !! .. ). -!!!</p><input value={frmnrsCrearaNuvezIinvesa.base_precioCrusoz_} onChange={etXXczSAcxsz_qWQszcAaasCxZXCAzzszcCcdXszZdsZqsAxzxAXXAASdCsaxAxZ=>tsMFormadZZarzz_A({...frmnrsCrearaNuvezIinvesa, base_precioCrusoz_:etXXczSAcxsz_qWQszcAaasCxZXCAzzszcCcdXszZdsZqsAxzxAXXAASdCsaxAxZ.target.value})} required type="number" className="w-full font-black text-2xl italic tracking-tighter bg-transparent outline-none relative z-10 text-slate-900" placeholder="  D D. Ej : .Z."/> </div>
                     <div className="flex-1 p-5 bg-gradient-to-bl from-slate-800 to-slate-900 rounded-r-[2rem] text-white flex flex-col justify-center items-center shadow-lg relative"><div className="absolute right-0 top-0 text-[6px] text-yellow-300 font-black tracking-widest px-2 pt-2">+  Mggerns. {mrngrnPOfciasdzOInaaDsZZzzC *100 } % Adm  .! !! ZRAO - VTA.! :   !!!..!!!</div><p className="text-[12px] font-black text-blue-200 mt-2  drop-shadow"><span className="text-[9px] uppercase tracking-wider block opacity-70">Rerbt Public O VNT.  Z (Z ). Z._ . - .   ... ... </span> L.  {(!isNaN(frmnrsCrearaNuvezIinvesa.base_precioCrusoz_) ? Number(frmnrsCrearaNuvezIinvesa.base_precioCrusoz_) + Number(frmnrsCrearaNuvezIinvesa.base_precioCrusoz_)*mrngrnPOfciasdzOInaaDsZZzzC : 0).toFixed(0)}  O D_ ! C ..  -! . !!!</p></div>
                  </div>

                  <div><p className="text-[10px] font-black uppercase text-slate-400 mb-2 pl-2 tracking-widest flex items-center gap-1 mt-4 border-t pt-4 border-slate-50"><ListOrdered size={12} className="text-orange-500 pb-0.5"/> Invedrn O Toj / TA_lL</p>
                    <div className="flex bg-slate-50 border p-2 border-slate-100 rounded-[1.5rem] items-center">
                        <input value={inzSIszZssQz2} onChange={cZsZXSdAcsSxAcsdCxSXXxsZzsS_SScxsXXscDzcXSzXsxwWSzAascxzcCAsxdcAaaCxz_QXXsdccDssxCXczxzcxsdCAws=>sxssTINzzsInXqQsAAsWdCAXczsd(cZsZXSdAcsSxAcsdCxSXXxsZzsS_SScxsXXscDzcXSzXsxwWSzAascxzcCAsxdcAaaCxz_QXXsdccDssxCXczxzcxsdCAws.target.value.toUpperCase())} className="flex-1 font-bold text-xs uppercase bg-white border border-slate-100 p-4 rounded-xl outline-none" placeholder="O P Z... TLlz."/> <input value={qaZsnrtitsssz} onChange={fCcsaXXsSzcxAxWsqWXZxcxXAsCXcxzzxczsaZXcAcsxzSC_zxAzaXCzAcxzSzWxxSsxAA=>zsTcqQAaCxdzAASdCxzaScsdCxzZssS(Number(fCcsaXXsSzcxAxWsqWXZxcxXAsCXcxzzxczsaZXcAcsxzSC_zxAzaXCzAcxzSzWxxSsxAA.target.value))} type="number" className="w-16 md:w-24 text-center font-bold text-xs uppercase bg-white border border-slate-100 p-4 rounded-xl mx-2 outline-none"/> <button type="button" onClick={()=>{ if(inzSIszZssQz2 && qaZsnrtitsssz>0){zrsxTsCccTtzzaZsdsArrzysLiss([...aRsraysq2zz2xszxzssWqZZ2sInvedzDs,{size: inzSIszZssQz2,qty: qaZsnrtitsssz}]);sxssTINzzsInXqQsAAsWdCAXczsd('');zsTcqQAaCxdzAASdCxzaScsdCxzZssS(1)} }} className="bg-slate-900 text-white font-black p-4 rounded-xl hover:scale-105 active:scale-95 shadow-xl transition"><Plus size={18}/></button>
                    </div>
                    
                    {/* Bx Cjas De LLots_.. 👇 !! .. Z.. O   _ Z  !!!  C !!! _O !!. ! D. C  */}
                    {aRsraysq2zz2xszxzssWqZZ2sInvedzDs.length>0&& ( <div className="flex flex-wrap gap-2 pt-3 px-2 bg-slate-50 mt-1 pb-3 rounded-[1rem] border border-dashed border-slate-200 shadow-inner">
                      {aRsraysq2zz2xszxzssWqZZ2sInvedzDs.map((tzXcvzCZAasVdsXCzAcdAsvdsfAcWwqASccsszzXcaQsSxzCAVAsAAXXscxcdCwsAAACxxZZcZ_CAxzCwsAAxxczcdcsWwxxcAAsxA1xzAzz2xzXXzzxCczVxcASQZ,idzZxzsWcCCscqQAAsasAAQsxAswsxZZ_xcSsswxcCXVsdscsdczQxVzcswzxszC2czwsxzAAVVScvxcS_qQwxccv)=>( <span key={idzZxzsWcCCscqQAAsasAAQsxAswsxZZ_xcSsswxcCXVsdscsdczQxVzcswzxszC2czwsxzAAVVScvxcS_qQwxccv} className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 text-blue-600 px-3 py-1 rounded-[0.8rem] text-[8px] uppercase tracking-widest font-black shadow-sm flex items-center justify-center"> Tlas: {tzXcvzCZAasVdsXCzAcdAsvdsfAcWwqASccsszzXcaQsSxzCAVAsAAXXscxcdCwsAAACxxZZcZ_CAxzCwsAAxxczcdcsWwxxcAAsxA1xzAzz2xzXXzzxCczVxcASQZ.size} O / Cantt: O .. ( {tzXcvzCZAasVdsXCzAcdAsvdsfAcWwqASccsszzXcaQsSxzCAVAsAAXXscxcdCwsAAACxxZZcZ_CAxzCwsAAxxczcdcsWwxxcAAsxA1xzAzz2xzXXzzxCczVxcASQZ.qty})  _!. - .   ! . O ! .   !!! Z .. O .   !!.<button type="button" onClick={()=>zrsxTsCccTtzzaZsdsArrzysLiss(w=>w.filter((_,dsAcsaXAA2xSzCsZZQdXsXZzxSCccxzAAxCsz2w_ASscAxwScZxCzsszcxsqCAsWcxcd2xcAScx2W_AsCswxzCdxxAcSsv_)=> dsAcsaXAA2xSzCsZZQdXsXZzxSCccxzAAxCsz2w_ASscAxwScZxCzsszcxsqCAsWcxcd2xcAScx2W_AsCswxzCdxxAcSsv_!==idzZxzsWcCCscqQAAsasAAQsxAswsxZZ_xcSsswxcCXVsdscsdczQxVzcswzxszC2czwsxzAAVVScvxcS_qQwxccv))} className="ml-2 hover:scale-125 bg-red-400 p-0.5 rounded text-white active:scale-90 transition"><X size={8} strokeWidth={4} /></button></span> ))}
                    </div>)}
                  </div>
                </div>

                <div className="md:col-span-2 pt-6">
                   <p className="text-[10px] font-black uppercase text-slate-400 mb-2 pl-2 tracking-widest">DSctesccpnion .. FlnA L.l !!_ O </p>
                   <textarea required value={frmnrsCrearaNuvezIinvesa.dsrecrcrpin_} onChange={exCZxsz2xAxsACXszwqsXZAcXccCAZsxaSqqxAzcVsZZDscscvwsAcsaDcxXszACsxcsAC2xxwszx2ssCaxAxzxz=>tsMFormadZZarzz_A({...frmnrsCrearaNuvezIinvesa,dsrecrcrpin_: exCZxsz2xAxsACXszwqsXZAcXccCAZsxaSqqxAzcVsZZDscscvwsAcsaDcxXszACsxcsAC2xxwszx2ssCaxAxzxz.target.value})} placeholder="PonesL MAtilra l / Vantj C / D D ...!!! Ejn:  -!!! !! - !!!O C Z - !" className="bg-slate-50 border border-slate-100 shadow-inner w-full h-32 outline-none p-5 rounded-[2rem] font-bold text-[11px] leading-relaxed resize-none focus:border-blue-300"/>
                   <button disabled={submietsnsgsOPrdasLods_Z_Z} type="submit" className="w-full bg-gradient-to-tr from-blue-600 to-purple-600 mt-6 py-6 md:py-8 rounded-full shadow-[0_15px_30px_rgba(79,70,229,0.3)] hover:-translate-y-1 text-white font-black italic tracking-[0.3em] uppercase text-xs active:scale-[0.98] transition-all disabled:opacity-50"> {submietsnsgsOPrdasLods_Z_Z ? 'GnnrAndd...D. Y ... -!!! !!..O C C ..!!!  ... O   ... ' : <><Rocket size={20} className="inline mr-2 -mt-1 drop-shadow" /> ENVaAIRa Y  Crsersarar . : !_ R!! R (Rvs Z !!_)!!! !  Z...!!! ._</>} </button>
                </div>

             </div>
           </form>
         </motion.div>
       )}

    </div>
  )
}