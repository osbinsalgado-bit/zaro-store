import React from 'react';
import { Flame, Star, ShoppingBag, Gift } from 'lucide-react';

export function Discounts() {
  const specialOffers = [
    { id: 1, type: 'condition', title: 'REGALO POR COMPRA', desc: 'En compras mayores a L 500.00 recibes un accesorio sorpresa.', icon: Gift, color: 'bg-purple-50 text-purple-600' },
    { id: 2, type: 'promo', title: 'OFERTA 2x1', desc: 'Aplica en todos los productos marcados con el sticker 2x1.', icon: Flame, color: 'bg-orange-50 text-orange-600' }
  ];

  return (
    <div className="space-y-8">
      <header className="bg-gradient-to-r from-blue-600 to-indigo-700 p-8 rounded-[2.5rem] text-white relative overflow-hidden shadow-xl shadow-blue-100">
        <h2 className="text-3xl font-black italic tracking-tighter">OFERTAS Y CONDICIONES</h2>
        <p className="text-white/80 text-xs font-bold uppercase tracking-widest mt-2">Aprovecha los beneficios de hoy</p>
        <Flame className="absolute right-[-10px] bottom-[-10px] text-white/10" size={150} />
      </header>

      <section className="grid md:grid-cols-2 gap-4">
        {specialOffers.map(offer => (
          <div key={offer.id} className={`${offer.color} p-6 rounded-[2rem] border border-white flex gap-4 items-start shadow-sm`}>
            <div className="p-3 bg-white rounded-2xl"><offer.icon size={24}/></div>
            <div>
              <h3 className="font-black italic uppercase tracking-tighter">{offer.title}</h3>
              <p className="text-xs font-bold opacity-80 mt-1 uppercase leading-relaxed">{offer.desc}</p>
            </div>
          </div>
        ))}
      </section>

      <h3 className="text-xl font-black italic uppercase tracking-tighter px-2">Productos en liquidación</h3>
      {/* Aquí re-utilizas el grid de Store pero filtrado solo por ofertas */}
    </div>
  );
}