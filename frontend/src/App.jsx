import { Navigate } from 'react-router-dom';

export function App() {
  // Redirección inmediata al login
  return <Navigate to="/login" replace />;
}