// src/pages/CartPage.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ShoppingBag, Plus, Minus, Tag, Check, CheckSquare, Square, MapPin, CheckCircle, Trash2
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase/config';
import { doc, getDoc, collection, query, where, getDocs, writeBatch, serverTimestamp } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

export function CartPage() {
  const { cart, updateQuantity, removeFromCart, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [usuarioLocal, setUsuarioLocal] = useState(null);
  const [cargandoPedido, setCargandoPedido] = useState(false);

  // Configuración de envíos e impuestos (Estos valores podrían venir de la base de datos en el futuro)
  const isvPorcentaje = 0.15; // 15% ISV (Ajustado al estándar de Honduras, cámbialo a 0.10 si prefieres 10%)
  const tarifaEnvio = 125.00; // 125 Lempiras

  // Manejo de la selección del usuario
  const [itemsSeleccionados, setItemsSeleccionados] = useState([]);
  const [direccionElegida, setDireccionElegida] = useState(null);
  const [modalidadPago, setModalidadPago] = useState('total'); // 'total' (100%) o 'apartado' (50%)

  // Sistema de Promociones y Descuentos Dual
  const [cuponTiendaInput, setCuponTiendaInput] = useState('');
  const [codigoVendedorInput, setCodigoVendedorInput] = useState('');
  const [descuentoTienda, setDescuentoTienda] = useState(null); 
  const [descuentoVendedor, setDescuentoVendedor] = useState(null); 

  // Precargar todos los items del carrito para ser facturados por defecto
  useEffect(() => {
    if (cart.length > 0 && itemsSeleccionados.length === 0) {
      setItemsSeleccionados(cart.map(item => `${item.id}_${item.selectedSize}`));
    }
  }, [cart]);

  // Obtener datos del usuario y su dirección principal
  useEffect(() => {
    if(!user) return;
    const cargarUsuario = async () => {
      const dbUsuario = await getDoc(doc(db, 'users', user.uid));
      if (dbUsuario.exists()) {
        const datosUsr = dbUsuario.data();
        setUsuarioLocal(datosUsr);
        
        // Asignar la dirección principal por defecto
        if(datosUsr.addresses && datosUsr.addresses.length > 0) {
          const direccionPrincipal = datosUsr.addresses.find(addr => addr.isDefault) || datosUsr.addresses[0];
          setDireccionElegida(direccionPrincipal);
        }
      }
    };
    cargarUsuario();
  }, [user]);

  // Marcar o desmarcar un producto para pagar
  const seleccionarProductoParaPagar = (cartKey) => {
    if(itemsSeleccionados.includes(cartKey)) {
      setItemsSeleccionados(itemsSeleccionados.filter(item => item !== cartKey));
    } else {
      setItemsSeleccionados([...itemsSeleccionados, cartKey]);
    }
  };

  // ==================== CÁLCULOS FINANCIEROS ====================
  
  // Filtrar solo los productos que el usuario seleccionó con el check
  const carritoAComprar = cart.filter(item => itemsSeleccionados.includes(`${item.id}_${item.selectedSize}`));
  
  // Suma del precio público total (El precio público ya incluye el ISV en la mente del cliente)
  const ventaBrutaAlPublico = carritoAComprar.reduce((total, articulo) => total + (articulo.public_price * articulo.quantity), 0);
  
  // Desglose fiscal: Extraer el Subtotal (sin ISV) y el monto del ISV
  const subtotalBaseSinImpuestos = ventaBrutaAlPublico / (1 + isvPorcentaje);
  const isvCalculado = ventaBrutaAlPublico - subtotalBaseSinImpuestos;

  // Cálculo de Descuentos (Cupones de la tienda)
  let ahorroTienda = 0;
  if (descuentoTienda) {
     ahorroTienda = descuentoTienda.type === 'fixed' ? descuentoTienda.discount : subtotalBaseSinImpuestos * (descuentoTienda.discount / 100);
  }

  // Cálculo de Descuentos (Código de Vendedora/Afiliada)
  let ahorroVendedor = 0;
  if (descuentoVendedor) {
     ahorroVendedor = descuentoVendedor.type === 'fixed' ? descuentoVendedor.discount : subtotalBaseSinImpuestos * (descuentoVendedor.discount / 100);
  }

  const descuentoTotalAplicado = ahorroTienda + ahorroVendedor;

  // Gran Total a Pagar = Subtotal + ISV + Envío - Descuentos
  const totalPagarNeto = (subtotalBaseSinImpuestos + isvCalculado + tarifaEnvio) - descuentoTotalAplicado;

  // Monto requerido para procesar (100% o 50% según modalidad)
  const montoRequeridoDepositar = modalidadPago === 'total' ? totalPagarNeto : (totalPagarNeto / 2);

  // ==================== VALIDACIÓN DE CUPONES ====================

  const validarCuponGeneral = async () => {
    if(!cuponTiendaInput) return;
    const req = await getDocs(query(collection(db, 'coupons'), where('code', '==', cuponTiendaInput.toUpperCase()), where('active', '==', true)));
    if(req.empty) return alert('El código de descuento no es válido o ha expirado.');
    setDescuentoTienda(req.docs[0].data());
  };

  const validarCodigoDeColaborador = async () => {
    if(!codigoVendedorInput) return;
    const req = await getDocs(query(collection(db, 'coupons'), where('code', '==', codigoVendedorInput.toUpperCase()), where('type_creator', '==', 'vendedor')));
    if(req.empty) return alert('El código de la vendedora/afiliada no es válido o no está activo.');
    setDescuentoVendedor(req.docs[0].data());
  };

  // ==================== PROCESAMIENTO DEL PEDIDO ====================

  const generarPedidoYBloquearInventario = async () => {
    if(carritoAComprar.length === 0) return alert("Por favor, selecciona al menos un artículo para procesar la compra.");
    if(!direccionElegida) return alert("Para continuar, debes agregar una dirección de envío en tu perfil.");
    
    setCargandoPedido(true);
    const batch = writeBatch(db); // Usamos Batch para asegurar que si algo falla, no se guarde a medias

    try {
      const orderRef = doc(collection(db, 'orders'));
      const generatedCode = `ZORA-${new Date().getFullYear()}${Math.floor(1000 + Math.random() * 9000)}`;

      // 1. DEDUCIR INVENTARIO EN BASE DE DATOS
      for (const articuloDeseado of carritoAComprar) {
         const dbReferenciaProd = doc(db, 'products', articuloDeseado.id);
         const articuloExtraidoBD = await getDoc(dbReferenciaProd);
         
         if (!articuloExtraidoBD.exists()) throw new Error(`El producto ${articuloDeseado.name} ya no existe en el sistema.`);

         let lotesBD = articuloExtraidoBD.data().inventory || [];
         lotesBD = lotesBD.map(tallaDataLote => {
            if(tallaDataLote.size === articuloDeseado.selectedSize) {
               if(tallaDataLote.qty - articuloDeseado.quantity < 0) {
                 throw new Error(`Lo sentimos, la talla ${articuloDeseado.selectedSize} de ${articuloDeseado.name} se acaba de agotar.`);
               }
               return { ...tallaDataLote, qty: tallaDataLote.qty - articuloDeseado.quantity };
            }
            return tallaDataLote;
         });

         batch.update(dbReferenciaProd, { inventory: lotesBD });
      }

      // 2. CREAR COMPROBANTE OFICIAL DE LA ORDEN
      const nuevaOrden = {
         order_code: generatedCode,
         client_id: user.uid,
         client_name: usuarioLocal.name,
         items: carritoAComprar,
         address: direccionElegida,
         payment_modality: modalidadPago === 'total' ? 'Pago de Contado (100%)' : 'Apartado / Cuotas (50%)',
         status: 'Verificando Pago',  
         payment_status: 'Pendiente', 
         
         // Limpieza de llaves financieras
         total: totalPagarNeto,
         amountPaid: 0,
         financial_resume: {
            subtotal: subtotalBaseSinImpuestos,
            isv_amount: isvCalculado,
            shipping_fee: tarifaEnvio,
            store_discount: ahorroTienda,
            seller_discount: ahorroVendedor,
            required_deposit: montoRequeridoDepositar
         },
         created_at: serverTimestamp()
      };

      batch.set(orderRef, nuevaOrden);
      await batch.commit();

      // 3. LIMPIAR EL CARRITO (dejando solo lo que no se facturó)
      const restantesEnCarrito = cart.filter(i => !itemsSeleccionados.includes(`${i.id}_${i.selectedSize}`));
      clearCart();
      restantesEnCarrito.forEach(prod => updateQuantity(prod.id, prod.selectedSize, prod.quantity, 9999));

      alert(`✅ ¡Pedido generado con éxito! Tu número de orden es ${generatedCode}`);
      
      // Redirigir al perfil a ver los pedidos
      navigate('/profile?tab=orders');

    } catch (error) {
      alert("Hubo un error al procesar tu compra: " + error.message);
    }
    setCargandoPedido(false);
  };


  return (
    <div className="max-w-2xl mx-auto px-4 mt-8 pb-32">
       
      <header className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100">
        <h1 className="text-2xl font-black italic uppercase tracking-tight text-slate-800 flex gap-2 items-center">
            <ShoppingBag className="text-purple-600"/> Tu Carrito de Compras
        </h1>
      </header>

      {cart.length === 0 ? (
        <div className="text-center py-24 bg-white rounded-[3rem] shadow-sm border border-slate-100 flex flex-col items-center justify-center">
          <ShoppingBag size={60} className="text-slate-200 mb-4" />
          <p className="font-black uppercase tracking-widest text-slate-400 text-sm">Tu carrito está vacío</p>
          <p className="text-xs text-slate-400 mt-2 font-medium">¡Explora la tienda y agrega algunos productos!</p>
        </div>
      ) : (
         <div className="space-y-6 animate-in slide-in-from-right duration-500">
            
            {/* LISTA DE PRODUCTOS EN EL CARRITO */}
            <div className="bg-white p-5 md:p-8 rounded-[2.5rem] border border-slate-100 shadow-lg shadow-purple-500/5 space-y-4">
              <h2 className="text-xs font-black tracking-widest uppercase text-slate-500 pl-2 border-b border-slate-100 pb-3 mb-4">Artículos a comprar:</h2>
              
              {cart.map(item => {
                  const itemKey = `${item.id}_${item.selectedSize}`;
                  const isChecked = itemsSeleccionados.includes(itemKey);

                  return (
                     <div key={itemKey} className={`flex flex-wrap items-center gap-4 p-4 rounded-[1.5rem] border-2 transition-all relative ${isChecked ? 'bg-purple-50 border-purple-200 shadow-sm' : 'bg-slate-50 border-slate-100 opacity-70 hover:opacity-100 hover:border-slate-300'}`}>
                        
                        <button onClick={() => seleccionarProductoParaPagar(itemKey)} className={`transition-colors ${isChecked ? 'text-purple-600' : 'text-slate-400 hover:text-slate-600'}`}>
                          {isChecked ? <CheckSquare size={24}/> : <Square size={24}/>}
                        </button>

                        <img src={item.images[0]} className="w-16 h-16 md:w-20 md:h-20 object-cover bg-white border border-slate-200 shadow-sm rounded-xl shrink-0" alt={item.name}/>

                        <div className="flex-1 min-w-0">
                          <h4 className="font-black uppercase text-xs md:text-sm text-slate-900 tracking-tight truncate">{item.name}</h4>
                          <span className="text-[10px] font-bold text-slate-500 uppercase mt-1 block">
                              Talla: <span className="bg-white px-2 py-0.5 rounded shadow-sm border border-slate-100 font-black text-purple-600">{item.selectedSize}</span>
                          </span>
                          <p className="text-sm font-black italic text-slate-800 mt-2"> 
                              L {(item.public_price * item.quantity).toFixed(0)} <span className="text-[9px] text-slate-400 ml-1 font-bold not-italic">ISV INCLUIDO</span>
                          </p>
                        </div>

                        <div className="flex bg-white items-center gap-3 border border-slate-200 shadow-sm p-1.5 rounded-[1rem] ml-auto">
                          <button onClick={(e)=>{ e.stopPropagation(); removeFromCart(item.id, item.selectedSize); }} className="text-red-400 bg-red-50 hover:bg-red-500 hover:text-white transition rounded-lg p-2 mr-1"><Trash2 size={14}/></button>
                          <button onClick={(e)=>{ e.stopPropagation(); updateQuantity(item.id, item.selectedSize, -1, 99); }} className="text-slate-400 bg-slate-50 hover:bg-slate-100 transition rounded-lg p-2"><Minus size={14}/></button>
                          <span className="font-black text-sm w-4 text-center">{item.quantity}</span>
                          <button onClick={(e)=>{ e.stopPropagation(); const maxStock = item.inventory?.find(sz => sz.size === item.selectedSize)?.qty || 0; updateQuantity(item.id, item.selectedSize, 1, maxStock); }} className="text-slate-600 bg-slate-50 hover:bg-slate-100 transition rounded-lg p-2"><Plus size={14}/></button>
                        </div>
                     </div>
                  )
              })}
            </div>

            {/* SECCIÓN DE PAGOS Y RESUMEN FINAL */}
            {carritoAComprar.length > 0 && (
               <div className="bg-white p-6 md:p-8 rounded-[3rem] shadow-xl border border-slate-100 space-y-6">
                 
                 {/* Selector de Dirección Rápido */}
                 <div className="bg-slate-50 p-5 border border-slate-200 shadow-sm rounded-3xl flex justify-between items-center group transition">
                    <div>
                      <p className="text-[10px] uppercase tracking-widest font-black text-slate-500 mb-1 flex items-center gap-1"><MapPin size={12}/> Dirección de Envío:</p>
                      <h3 className="font-bold text-slate-800 text-sm">
                          {direccionElegida ? `${direccionElegida.city}, ${direccionElegida.street}` : 'No has configurado una dirección'}
                      </h3>
                    </div>
                    <button onClick={()=>navigate('/profile')} className="bg-blue-100 text-blue-600 p-3 rounded-xl hover:bg-blue-200 transition">Cambiar</button>
                 </div>

                 {/* CÓDIGOS DE PROMOCIÓN */}
                 <div className="space-y-3">
                   <div className="flex gap-2">
                     <div className="flex items-center gap-2 px-4 py-3 border-2 border-dashed border-slate-200 rounded-2xl flex-1 focus-within:border-blue-300 transition-colors">
                        <Tag size={16} className="text-blue-400"/>
                        <input disabled={descuentoTienda!=null} type="text" placeholder="Cupón de Descuento (Tienda)" className="w-full uppercase outline-none font-bold text-xs text-slate-700 bg-transparent" value={cuponTiendaInput} onChange={e=>setCuponTiendaInput(e.target.value)}/>
                     </div>
                     <button onClick={validarCuponGeneral} className={`px-6 font-black uppercase text-[10px] tracking-wider rounded-2xl transition ${descuentoTienda ? 'bg-green-100 text-green-600' : 'bg-slate-900 text-white hover:bg-slate-800'}`}>
                         {descuentoTienda ? 'APLICADO' : 'APLICAR'}
                     </button>
                   </div>

                   <div className="flex gap-2">
                     <div className="flex items-center gap-2 px-4 py-3 border-2 border-dashed border-slate-200 rounded-2xl flex-1 focus-within:border-pink-300 bg-pink-50/30 transition-colors">
                        <Tag size={16} className="text-pink-400"/>
                        <input disabled={descuentoVendedor!=null} type="text" placeholder="Código de Vendedora / Afiliada" className="w-full uppercase outline-none font-bold text-xs text-slate-700 bg-transparent" value={codigoVendedorInput} onChange={e=>setCodigoVendedorInput(e.target.value)}/>
                     </div>
                     <button onClick={validarCodigoDeColaborador} className={`px-6 font-black uppercase text-[10px] tracking-wider rounded-2xl transition ${descuentoVendedor ? 'bg-green-100 text-green-600' : 'bg-pink-500 text-white hover:bg-pink-600 shadow-md'}`}>
                         {descuentoVendedor ? 'APLICADO' : 'APLICAR'}
                     </button>
                   </div>
                 </div>

                 {/* MODALIDAD DE PAGO (100% o 50%) */}
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8 pt-6 border-t border-slate-100">
                    <button onClick={()=>setModalidadPago('total')} className={`p-5 text-left border-2 rounded-3xl relative overflow-hidden transition-all ${modalidadPago==='total'?'border-green-500 bg-green-50 shadow-md ring-4 ring-green-500/10' : 'border-slate-200 bg-slate-50 hover:border-green-300'}`}>
                      {modalidadPago==='total' && <div className="absolute top-4 right-4 text-green-500"><CheckCircle size={20}/></div>}
                      <h4 className="font-black italic uppercase text-slate-800">Pago Completo (100%)</h4>
                      <p className="text-xs font-medium mt-1 text-slate-500">Paga el total ahora y tu envío se despachará de inmediato.</p>
                    </button>
                    
                    <button onClick={()=>setModalidadPago('apartado')} className={`p-5 text-left border-2 rounded-3xl relative overflow-hidden transition-all ${modalidadPago==='apartado'?'border-blue-500 bg-blue-50 shadow-md ring-4 ring-blue-500/10' : 'border-slate-200 bg-slate-50 hover:border-blue-300'}`}>
                      {modalidadPago==='apartado' && <div className="absolute top-4 right-4 text-blue-600"><CheckCircle size={20}/></div>}
                      <h4 className="font-black italic uppercase text-blue-800">Reserva / Mitad (50%)</h4>
                      <p className="text-xs font-medium mt-1 text-blue-600/70">Paga la mitad para apartar. El resto lo pagas antes del envío.</p>
                    </button>
                 </div>

                 {/* RECIBO / RESUMEN FINANCIERO */}
                 <div className="bg-slate-900 text-slate-300 rounded-[2rem] p-8 pb-10 shadow-2xl relative mt-6 overflow-hidden">
                    <p className="font-black text-center italic tracking-widest border-b border-slate-700 pb-4 mb-5 text-[11px] text-white uppercase">Resumen de tu Compra</p>
                    
                    <div className="space-y-3 relative z-10 mb-6 pb-6 border-b border-dashed border-slate-700 text-xs font-medium tracking-wide">
                       <div className="flex justify-between items-center">
                           <span>Subtotal (Sin ISV)</span>
                           <span className="font-bold text-white">L. {subtotalBaseSinImpuestos.toFixed(2)}</span>
                       </div>
                       <div className="flex justify-between items-center text-slate-400">
                           <span>ISV ({(isvPorcentaje * 100).toFixed(0)}%)</span>
                           <span>L. {isvCalculado.toFixed(2)}</span>
                       </div>
                       <div className="flex justify-between items-center text-slate-400 pb-2">
                           <span>Costo de Envío</span>
                           <span>L. {tarifaEnvio.toFixed(2)}</span>
                       </div>
                       
                       {descuentoTotalAplicado > 0 && (
                           <div className="flex justify-between items-center pt-3 text-pink-400 font-bold border-t border-dashed border-slate-700">
                               <span>Descuentos Aplicados</span>
                               <span>- L. {descuentoTotalAplicado.toFixed(2)}</span>
                           </div>
                       )}
                    </div>

                    <div className="flex justify-between items-end z-10 relative">
                       <div>
                           <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Total a Pagar</span>
                           <span className="text-[9px] text-slate-500 italic block">Monto a depositar: {modalidadPago === 'total' ? '100%' : '50%'}</span>
                       </div>
                       <div className="text-right">
                           <span className="text-3xl font-black italic text-white block leading-none">
                               L {montoRequeridoDepositar.toFixed(0)}
                           </span>
                           {modalidadPago === 'apartado' && (
                               <span className="text-[10px] text-yellow-400 font-bold mt-1 inline-block bg-yellow-400/10 px-2 py-0.5 rounded">
                                   Pendiente después: L {(totalPagarNeto - montoRequeridoDepositar).toFixed(0)}
                               </span>
                           )}
                       </div>
                    </div>

                 </div>

                 {/* BOTÓN FINAL DE COMPRA */}
                 <button disabled={cargandoPedido} onClick={generarPedidoYBloquearInventario} className="w-full bg-blue-600 text-white rounded-full font-black text-xs md:text-sm uppercase py-5 px-6 shadow-xl hover:bg-blue-700 hover:shadow-blue-600/30 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 mt-4">
                    {cargandoPedido ? (
                        'Procesando Orden...'
                    ) : (
                        <><CheckCircle size={20} /> Confirmar Orden y Proceder al Pago</>
                    )}
                 </button>
               </div>
            )}
         </div>
      )}
    </div>
  );
}