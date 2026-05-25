import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCj9O6PGEdaQ3MNJkenfIsjjChM3iLa0cc",
  authDomain: "proyectoventas-b48dc.firebaseapp.com",
  projectId: "proyectoventas-b48dc",
  storageBucket: "proyectoventas-b48dc.firebasestorage.app",
  messagingSenderId: "652870629451",
  appId: "1:652870629451:web:ceb88b95ed52b0c99b35ce",
  measurementId: "G-48H2PHNP27"
};

const app = initializeApp(firebaseConfig);
export const storage = getStorage(app);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
