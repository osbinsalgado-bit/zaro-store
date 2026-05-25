// src/context/CartContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem('zaro_cart');
    return saved ? JSON.parse(saved) :[];
  });

  useEffect(() => {
    localStorage.setItem('zaro_cart', JSON.stringify(cart));
  }, [cart]);

  // ANEXAR AL CARRITO: Respetando el Stock
  const addToCart = (product, size, quantity) => {
    setCart(prev => {
      const existIdx = prev.findIndex(i => i.id === product.id && i.selectedSize === size);
      const stockDisp = product.inventory?.find(i => i.size === size)?.qty || 0;

      if (existIdx > -1) {
        const copy = [...prev];
        const attemptQty = copy[existIdx].quantity + quantity;
        copy[existIdx].quantity = attemptQty > stockDisp ? stockDisp : attemptQty; // Lo capa al tope real
        return copy;
      }
      // Primera vez, capar si piden más del máximo al toque
      const finalQ = quantity > stockDisp ? stockDisp : quantity;
      return[...prev, { ...product, selectedSize: size, quantity: finalQ }];
    });
  };

  // CONTROL +/- DEL CHECKOUT (Verificamos stock en tiempo real)
  const updateQuantity = (id, size, delta, maxStock) => {
    setCart(prev => prev.map(item => {
      if (item.id === id && item.selectedSize === size) {
        const nxt = item.quantity + delta;
        if (nxt > maxStock || nxt < 1) return item; // No se pasa, ni baja de 1
        return { ...item, quantity: nxt };
      }
      return item;
    }));
  };

  const removeFromCart = (id, size) => setCart(prev => prev.filter(i => !(i.id === id && i.selectedSize === size)));
  const clearCart = () => setCart([]);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);