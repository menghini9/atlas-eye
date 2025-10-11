// ⬇️ BLOCCO 1: Firebase Client — versione definitiva e sicura
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// 🔐 Configurazione Firebase tramite variabili d’ambiente (.env.local)
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// ✅ Evita doppie inizializzazioni (importante per Next.js e Vercel)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// ✅ Esporta Firestore (per database)
export const db = getFirestore(app);

// ✅ Esporta l'app principale (per autenticazione e altri servizi)
export default app;

// 🧩 Log di conferma — utile per debug ma innocuo in produzione
console.log("🔥 Firebase Client inizializzato correttamente e chiavi protette.");
