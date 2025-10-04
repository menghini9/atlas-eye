// ⬇️ BLOCCO 1: Connessione Firebase ufficiale
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Configurazione della tua app Firebase
const firebaseConfig = {
  apiKey: "AIzaSyB5L9dalvw1YBXe5hk9mXwZfU9rvxSW3CA",
  authDomain: "atlas-eye.firebaseapp.com",
  projectId: "atlas-eye",
  storageBucket: "atlas-eye.firebasestorage.app",
  messagingSenderId: "504294144651",
  appId: "1:504294144651:web:949453b8d26c352969728e",
};

// Inizializza Firebase
const app = initializeApp(firebaseConfig);

// Esporta il database Firestore
export const db = getFirestore(app);
