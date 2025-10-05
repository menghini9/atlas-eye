// 🟢 BLOCCO 1: Firebase Client (versione sicura e pulita)
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// 🔐 Configurazione letta da variabili d'ambiente
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
};

// ✅ Evita doppie inizializzazioni
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// ✅ Esporta Firestore pronto all’uso
export const db = getFirestore(app);

// ✅ Esporta anche l'app Firebase (per l'autenticazione)
export default app;

export const appInstance = app;


console.log("🔥 Firebase Client inizializzato correttamente e chiavi protette.");
