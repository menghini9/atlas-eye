// ⬇️ BLOCCO 5.3 — MapPage (FlyTo + cambio stile dinamico + geocoder centrato)
"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import MapboxGeocoder from "@mapbox/mapbox-gl-geocoder";
import "mapbox-gl/dist/mapbox-gl.css";
import "@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css";

// ✅ Token ambiente
mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";
const mapboxglAny = mapboxgl as unknown as any;

export default function MapPage() {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const router = useRouter();
  const [currentStyle, setCurrentStyle] = useState("mapbox://styles/mapbox/satellite-streets-v12");

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // 🌍 Inizializza la mappa
    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: currentStyle,
      center: [10, 20],
      zoom: 1.6,
      pitch: 45,
      bearing: -10,
      projection: "globe",
    });
    mapRef.current = map;

    // ✨ Effetto atmosfera
    map.on("style.load", () => {
      map.setFog({
        color: "rgb(0, 0, 50)",
        "horizon-blend": 0.3,
        "high-color": "rgb(80, 160, 255)",
        "space-color": "rgb(11, 11, 25)",
        "star-intensity": 0.3,
      });
    });

    // 🧭 Controlli base
    map.addControl(new mapboxgl.NavigationControl({ showCompass: true }), "bottom-right");
    map.addControl(new mapboxgl.ScaleControl({ unit: "metric" }), "bottom-left");

    // 🔍 Barra di ricerca funzionante con FlyTo
    const geocoder = new (MapboxGeocoder as any)({
  accessToken: (mapboxgl as any).accessToken,
  mapboxgl: mapboxglAny,

      marker: false,
      placeholder: "Cerca luogo...",
      proximity: { longitude: 12, latitude: 20 },
      countries: "it,fr,de,gb,es,pt,us,ca",
    });

    map.addControl(geocoder);

    // 📍 FlyTo animato sui risultati
    geocoder.on("result", (e: any) => {
      const coords = e.result.center;
      map.flyTo({
        center: coords,
        zoom: 4.5,
        pitch: 55,
        speed: 0.8,
        curve: 1.6,
        essential: true,
      });
    });

    // 🎨 Centra barra di ricerca
    const interval = setInterval(() => {
      const gc = document.querySelector(".mapboxgl-ctrl-geocoder") as HTMLElement;
      if (gc) {
        gc.style.position = "absolute";
        gc.style.top = "20px";
        gc.style.left = "50%";
        gc.style.transform = "translateX(-50%)";
        gc.style.width = "350px";
        gc.style.zIndex = "2";
        clearInterval(interval);
      }
    }, 300);

    return () => {
      clearInterval(interval);
      map.remove();
    };
  }, [currentStyle]);

  // 🎛 Cambio stile dinamico
  const handleStyleChange = (style: string) => {
    setCurrentStyle(style);
  };

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* 🌍 Contenitore mappa */}
      <div ref={mapContainerRef} style={{ width: "100%", height: "100%" }} />

      {/* 👤 Profilo */}
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

      {/* 🚪 Esci */}
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

      {/* 🎨 Selettore stile */}
      <div
        style={{
          position: "absolute",
          bottom: "20px",
          left: "50%",
          transform: "translateX(-50%)",
          background: "rgba(0,0,0,0.6)",
          borderRadius: "12px",
          padding: "10px 20px",
          display: "flex",
          gap: "12px",
          color: "white",
          zIndex: 5,
        }}
      >
        <button
          onClick={() => handleStyleChange("mapbox://styles/mapbox/satellite-streets-v12")}
          style={{
            background: currentStyle.includes("satellite") ? "#00aaff" : "#333",
            color: "white",
            border: "none",
            borderRadius: "8px",
            padding: "6px 10px",
            cursor: "pointer",
          }}
        >
          🌌 Satellite
        </button>
        <button
          onClick={() => handleStyleChange("mapbox://styles/mapbox/dark-v11")}
          style={{
            background: currentStyle.includes("dark") ? "#00aaff" : "#333",
            color: "white",
            border: "none",
            borderRadius: "8px",
            padding: "6px 10px",
            cursor: "pointer",
          }}
        >
          🌙 Dark
        </button>
        <button
          onClick={() => handleStyleChange("mapbox://styles/mapbox/streets-v12")}
          style={{
            background: currentStyle.includes("streets") ? "#00aaff" : "#333",
            color: "white",
            border: "none",
            borderRadius: "8px",
            padding: "6px 10px",
            cursor: "pointer",
          }}
        >
          🗺️ Streets
        </button>
      </div>
    </div>
  );
}
// ⬆️ FINE BLOCCO 5.3 — Atlas Eye MapPage
