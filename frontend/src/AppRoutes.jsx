import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

import { AuthView } from './pages/AuthView';
import { StorePage } from './pages/StorePage';
import { MainLayout } from './components/layout/MainLayout';
// Iremos agregando y descomentando estas cuando terminemos los siguientes componentes:
import { ProfilePage } from './pages/ProfilePage';
import { CartPage } from './pages/CartPage';
import { AdminPanel } from './pages/AdminPanel';
import { ZoraProductionsPage } from './pages/ZoraProductionsPage';
import { ProviderDashboard } from './components/provider/ProviderDashboard';
import { SellerDashboard } from './components/seller/SellerDashboard';

export default function AppRoutes() {
  // Nota: Quitamos el BrowserRouter de aquí asumiendo que 
  // ya lo tienes configurado y envolviendo todo en main.jsx 

  return (
    <AuthProvider>
      <CartProvider>
        <Routes>
          {/* LOGIN Y REGISTRO COMPLETO (Pantalla Completa) */}
          <Route path="/auth" element={<AuthView />} />

          {/* RUTA MAESTRA (Las páginas aquí usarán el Header, Buscador y Menú Lateral de MainLayout) */}
          <Route path="/" element={<MainLayout />}>
            <Route index element={<StorePage />} /> {/* EL CATÁLOGO ESTÉTICO ESTARÁ AQUI */}
            
            <Route path="cart" element={<CartPage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="admin" element={<AdminPanel />} />
            <Route path="zora-productions" element={<ZoraProductionsPage />} />
            <Route path="provider" element={<ProviderDashboard />} />
            <Route path="seller" element={<SellerDashboard />} />
          </Route>

          {/* Fallback de error (si pone algo raro lo manda a la tienda) */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </CartProvider>
    </AuthProvider>
  );
}