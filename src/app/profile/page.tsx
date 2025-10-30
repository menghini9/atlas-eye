// ⬇️ BLOCCO 5.3 — ProfilePage (Fast Transition + Cesium Preload)
"use client";

import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "../lib/authClient";
import { useEffect, useState } from "react";

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  // ✅ Controllo autenticazione
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      if (!currentUser) router.push("/login");
      else setUser(currentUser);
    });
    return () => unsubscribe();
  }, [router]);

  // ⚡️ Precarica Cesium.js e salva i token
  useEffect(() => {
    const preload = () => {
      // Salva token in cache locale (una sola volta)
      if (!localStorage.getItem("mapbox_token")) {
        localStorage.setItem(
          "mapbox_token",
          process.env.NEXT_PUBLIC_MAPBOX_TOKEN || ""
        );
      }
      if (!localStorage.getItem("cesium_token")) {
        localStorage.setItem(
          "cesium_token",
          process.env.NEXT_PUBLIC_CESIUM_TOKEN || ""
        );
      }
      // Precarica Cesium.js silenziosamente
      if (!document.getElementById("cesium-preload")) {
        const s = document.createElement("script");
        s.src = "/cesium/Cesium.js";
        s.async = true;
        s.id = "cesium-preload";
        document.head.appendChild(s);
      }
    };
    preload();
  }, []);

  // ✅ Logout con overlay
  const handleLogout = async () => {
    const overlay = showOverlay("Uscita in corso...");
    try {
      await signOut(auth);
      setTimeout(() => router.push("/login"), 500);
    } catch {
      alert("Errore durante il logout.");
    } finally {
      hideOverlay(overlay);
    }
  };

  // ✅ Accesso rapido alla mappa
  const goToMap = () => {
    const overlay = showOverlay("Caricamento mappa...");
    setTimeout(() => {
      router.push("/map");
      hideOverlay(overlay);
    }, 300);
  };

  // 🔹 Overlay semplice e riutilizzabile
  function showOverlay(text: string) {
    const o = document.createElement("div");
    o.style.cssText =
      "position:fixed;inset:0;display:grid;place-items:center;" +
      "background:black;color:white;z-index:9999;font:600 15px system-ui;";
    o.textContent = text;
    document.body.appendChild(o);
    return o;
  }
  function hideOverlay(el: HTMLElement) {
    setTimeout(() => el.remove(), 500);
  }

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

          {/* 🌎 Unico pulsante mappa */}
          <button
            onClick={goToMap}
            style={{
              backgroundColor: "#0077ff",
              border: "none",
              borderRadius: "12px",
              padding: "14px 24px",
              fontSize: "1.05rem",
              cursor: "pointer",
              marginBottom: "22px",
            }}
          >
            🌎 Entra nella Mappa
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
// ⬆️ FINE BLOCCO 5.3
