// ⬇️ BLOCCO 4: HomePage con accesso test
"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../lib/authClient";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isGuest, setIsGuest] = useState(false);

  // Controllo autenticazione
  useEffect(() => {
    const guestAccess = sessionStorage.getItem("guestAccess");
    if (guestAccess === "true") {
      setIsGuest(true);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
      } else {
        router.push("/login"); // torna al login se non loggato
      }
    });

    return () => unsubscribe();
  }, [router]);

  // Logout
  const handleLogout = async () => {
    if (isGuest) {
      sessionStorage.removeItem("guestAccess");
      router.push("/login");
      return;
    }

    await signOut(auth);
    router.push("/login");
  };

  // Se non loggato
  if (!user && !isGuest)
    return (
      <div style={{ textAlign: "center", marginTop: "50px" }}>
        <p>Caricamento in corso...</p>
      </div>
    );

  // Contenuto principale
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
      }}
    >
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
