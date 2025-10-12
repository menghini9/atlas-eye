// ⬇️ BLOCCO 5.2 — MapPage (vista globale 3D + pulsanti)
"use client";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";

// ✅ Imposta token Mapbox da variabile d'ambiente
mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";

export default function MapPage() {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // 🌍 Inizializza la mappa
    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/satellite-streets-v12",
      center: [0, 20], // vista globale
      zoom: 1.5,
      pitch: 45, // angolo 3D satellite
      bearing: -10,
      projection: "globe", // 🌐 vista sferica
    });

    // Effetto luminoso atmosfera
    map.on("style.load", () => {
      map.setFog({
        color: "rgb(0, 0, 50)",
        "horizon-blend": 0.3,
        "high-color": "rgb(80, 160, 255)",
        "space-color": "rgb(11, 11, 25)",
        "star-intensity": 0.3,
      });
    });

    return () => map.remove();
  }, []);

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        position: "relative",
      }}
    >
      {/* 🌍 Contenitore mappa */}
      <div ref={mapContainerRef} style={{ width: "100%", height: "100%" }} />

      {/* 🔍 Barra di ricerca fittizia (sarà attiva in seguito) */}
      <input
        type="text"
        placeholder="🔎 Cerca luogo..."
        style={{
          position: "absolute",
          top: "20px",
          left: "50%",
          transform: "translateX(-50%)",
          width: "60%",
          padding: "10px",
          borderRadius: "8px",
          border: "none",
          outline: "none",
          fontSize: "1rem",
        }}
      />

      {/* 🔘 Pulsanti angolari */}
      <button
        onClick={() => router.push("/profile")}
        style={{
          position: "absolute",
          top: "20px",
          left: "20px",
          padding: "10px 20px",
          borderRadius: "8px",
          border: "none",
          background: "#004080",
          color: "white",
          cursor: "pointer",
        }}
      >
        👤 Profilo
      </button>

      <button
        onClick={() => router.push("/login")}
        style={{
          position: "absolute",
          top: "20px",
          right: "20px",
          padding: "10px 20px",
          borderRadius: "8px",
          border: "none",
          background: "#ff4444",
          color: "white",
          cursor: "pointer",
        }}
      >
        🚪 Esci
      </button>
    </div>
  );
}
// ⬆️ FINE BLOCCO 5.2
