// src/context/AuthContext.jsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth } from '../firebase/config';
import { onAuthStateChanged, signInWithPopup, signOut, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { googleProvider } from '../firebase/config';
import { fetchSignInMethodsForEmail } from 'firebase/auth';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Registro con Email
  const registerEmail = (email, password) => createUserWithEmailAndPassword(auth, email, password);
  
  // Login con Email
  const loginEmail = (email, password) => signInWithEmailAndPassword(auth, email, password);

  // Login con Google
  const loginGoogle = () => signInWithPopup(auth, googleProvider);

  // Cerrar sesión
  const logout = () => signOut(auth);

  const checkEmailExists = (email) => fetchSignInMethodsForEmail(auth, email);


  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loginGoogle, loginEmail, registerEmail, logout, loading, checkEmailExists  }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);