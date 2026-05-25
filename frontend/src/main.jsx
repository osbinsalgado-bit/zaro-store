// Asegúrate de que main.jsx se vea similar a esto:
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom'; // 👈 EL UNICO EN TU APP
import AppRoutes from './AppRoutes';
import './index.css'; // Tailwind

ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <AppRoutes />
  </BrowserRouter>
);