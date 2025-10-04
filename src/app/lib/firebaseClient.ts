// ⬇️ BLOCCO 1: Firebase Client
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// ✅ Configurazione Firebase
const firebaseConfig = {
  apiKey: "AIzaSyB5L9dalvw1YBXe5hk9mXwZfU9rvxSW3CA",
  authDomain: "atlas-eye.firebaseapp.com",
  projectId: "atlas-eye",
  storageBucket: "atlas-eye.firebasestorage.app",
  messagingSenderId: "504294144651",
  appId: "1:504294144651:web:949453b8d26c352969728e",
};

// ✅ Evita doppie inizializzazioni
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// ✅ Esporta Firestore e l’app
export const db = getFirestore(app);
export { app };

console.log("🔥 FirebaseClient inizializzato correttamente");
