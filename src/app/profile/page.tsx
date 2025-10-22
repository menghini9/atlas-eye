// ⬇️ BLOCCO 5.2 — ProfilePage (profilo + collegamenti modalità mappa + overlay)
"use client";

import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "../lib/authClient";
import { useEffect, useState } from "react";

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      if (!currentUser) {
        router.push("/login");
      } else {
        setUser(currentUser);
      }
    });
    return () => unsubscribe();
  }, [router]);

  const handleLogout = async () => {
    try {
      window.AtlasOverlay?.show("Uscita in corso...");
      await signOut(auth);
      setTimeout(() => router.push("/login"), 600);
    } catch {
      alert("Errore durante il logout.");
    } finally {
      window.AtlasOverlay?.hide();
    }
  };

  const goToMap = (mode?: string) => {
    // Modalità opzionale (globe, flat, hybrid)
    window.AtlasOverlay?.show("Caricamento mappa...");
    setTimeout(() => {
      router.push("/map" + (mode ? `?view=${mode}` : ""));
      window.AtlasOverlay?.hide();
    }, 500);
  };

  return (
    <div
      style={{
        background:
          "linear-gradient(180deg, #000814 0%, #001d3d 50%, #003566 100%)",
        minHeight: "100vh",
        color: "white",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: "20px",
        overflow: "hidden",
      }}
    >
      <h1 style={{ fontSize: "2.2rem", marginBottom: "18px" }}>
        👤 Profilo Atlas Eye
      </h1>

      {user ? (
        <>
          <div style={{ marginBottom: "25px", lineHeight: "1.5" }}>
            <p>Email: {user.email}</p>
            <p>ID Utente: {user.uid.slice(0, 8)}...</p>
            <p>Livello: 🌍 Free Explorer</p>
          </div>

          {/* 🌐 Modalità di visualizzazione */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "12px",
              marginBottom: "28px",
              width: "min(90%, 320px)",
            }}
          >
            <button
              onClick={() => goToMap("globe")}
              style={{
                backgroundColor: "#0077ff",
                border: "none",
                borderRadius: "12px",
                padding: "12px 18px",
                fontSize: "1rem",
                cursor: "pointer",
              }}
            >
              🌏 Modalità Globo
            </button>

            <button
              onClick={() => goToMap("flat")}
              style={{
                backgroundColor: "#0099cc",
                border: "none",
                borderRadius: "12px",
                padding: "12px 18px",
                fontSize: "1rem",
                cursor: "pointer",
              }}
            >
              🗺️ Modalità Atlante
            </button>

            <button
              onClick={() => goToMap("hybrid")}
              style={{
                backgroundColor: "#00b37a",
                border: "none",
                borderRadius: "12px",
                padding: "12px 18px",
                fontSize: "1rem",
                cursor: "pointer",
              }}
            >
              ⚡ Modalità Ibrida
            </button>
          </div>

          {/* 🔧 Pulsante impostazioni (placeholder per futura sezione) */}
          <button
            style={{
              backgroundColor: "rgba(255, 255, 255, 0.15)",
              border: "1px solid rgba(255, 255, 255, 0.25)",
              borderRadius: "12px",
              padding: "10px 18px",
              fontSize: "1rem",
              marginBottom: "20px",
              cursor: "pointer",
            }}
            onClick={() => alert("Impostazioni in arrivo ⚙️")}
          >
            ⚙️ Impostazioni
          </button>

          {/* 🚪 Logout */}
          <button
            onClick={handleLogout}
            style={{
              backgroundColor: "#ff3333",
              border: "none",
              borderRadius: "12px",
              padding: "10px 20px",
              fontSize: "1rem",
              cursor: "pointer",
            }}
          >
            🚪 Esci
          </button>
        </>
      ) : (
        <p style={{ fontSize: "1rem", marginTop: "20px" }}>
          Caricamento profilo...
        </p>
      )}
    </div>
  );
}
// ⬆️ FINE BLOCCO 5.2
