// ⬇️ BLOCCO 4: HomePage con accesso test + banner dev
"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../lib/authClient";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isGuest, setIsGuest] = useState(false);
  const [isDev, setIsDev] = useState(false); // ✅ banner modalità sviluppo

  // 🔍 Controllo autenticazione
  useEffect(() => {
    const guestAccess = sessionStorage.getItem("guestAccess");
    if (guestAccess === "true") {
      setIsGuest(true);
    }

    // ✅ rileva se sei in sviluppo locale
    if (typeof window !== "undefined" && window.location.hostname === "localhost") {
      setIsDev(true);
    }

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
      } else if (!guestAccess) {
        router.push("/login");
      }
    });

    return () => unsubscribe();
  }, [router]);

  // 🚪 Logout
// ⬇️ BLOCCO 2: Logout con redirect automatico
const handleLogout = async () => {
  try {
    await signOut(auth); // 🔒 Disconnette l’utente da Firebase
    window.location.href = "/login"; // 🔁 Reindirizza immediatamente alla pagina di login
  } catch (error) {
    console.error("Errore durante il logout:", error);
    alert("❌ Errore durante la disconnessione. Riprova.");
  }
};
// ⬆️ FINE BLOCCO 2



  if (!user && !isGuest)
    return (
      <div style={{ textAlign: "center", marginTop: "50px" }}>
        <p>Caricamento in corso...</p>
      </div>
    );

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #6a1b9a, #8e24aa)",
        color: "white",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        textAlign: "center",
        position: "relative",
      }}
    >
      {/* 🧩 Banner modalità sviluppo */}
      {isDev && (
        <div
          style={{
            position: "absolute",
            top: 0,
            width: "100%",
            background: "#ff9800",
            color: "black",
            fontWeight: "bold",
            textAlign: "center",
            padding: "8px 0",
            boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
            letterSpacing: "0.5px",
          }}
        >
          🧩 Modalità Sviluppo Attiva (localhost)
        </div>
      )}

      <h1>🏠 Benvenuto su Atlas Eye Home</h1>

      {isGuest ? (
        <p>🧪 Accesso test attivo — dati non salvati</p>
      ) : (
        <>
          <p>Email: {user?.email}</p>
          <p>UID: {user?.uid}</p>
          <p>Ruolo: free</p>
        </>
      )}

      <button
        onClick={handleLogout}
        style={{
          background: isGuest ? "#e53935" : "#ff5252",
          border: "none",
          padding: "10px 20px",
          color: "white",
          borderRadius: "6px",
          cursor: "pointer",
          fontSize: "16px",
          marginTop: "20px",
        }}
      >
        Esci
      </button>
    </div>
  );
}
// ⬆️ FINE BLOCCO 4
