// ⬇️ BLOCCO 5.5 — Atlas Eye “Terra Reale Dinamica”
"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import SunCalc from "suncalc";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";

export default function MapPage() {
  const router = useRouter();
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const [isNight, setIsNight] = useState(false);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // 🌍 Inizializza mappa 3D
    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/satellite-v9",
      center: [12, 20],
      zoom: 1.3,
      pitch: 45,
      bearing: 0,
      projection: "globe",
    });
    mapRef.current = map;

    // ✨ Quando lo stile è caricato
    map.on("style.load", () => {
      map.setFog({
        color: "rgb(0, 10, 40)",
        "horizon-blend": 0.3,
        "high-color": "rgb(50,100,255)",
        "space-color": "rgb(0,0,15)",
        "star-intensity": 0.4,
      });

      // 🌌 Layer notte (texture reale NASA)
      map.addSource("earth-night", {
        type: "raster",
        tiles: [
          "https://eoimages.gsfc.nasa.gov/images/imagerecords/79000/79765/earth_lights_lrg.jpg"
        ],
        tileSize: 256,
      });

      map.addLayer({
        id: "earth-night",
        type: "raster",
        source: "earth-night",
        paint: { "raster-opacity": 0.0 },
      });

      // 🔄 Aggiorna ogni minuto luce e blending
      const updateLighting = () => {
        const now = new Date();
        const { lat, lng } = map.getCenter();
        const sunPos = SunCalc.getPosition(now, lat, lng);
        const sunAngle = (sunPos.altitude * 180) / Math.PI;
        const nightOpacity = Math.max(0, Math.min(1, (10 - sunAngle) / 10));

        setIsNight(nightOpacity > 0.4);

        // 🌙 Transizione tra texture giorno e notte
        map.setPaintProperty("earth-night", "raster-opacity", nightOpacity);

        // 💡 Luce dinamica del sole/luna
        map.setLight({
          color: isNight ? "#88bbff" : "white",
          intensity: isNight ? 0.2 : 0.8,
          position: [1, 180, sunAngle > 0 ? sunAngle * 2 : 0],
        });
      };

      updateLighting();
      const interval = setInterval(updateLighting, 60000);

      // 🌍 Rotazione continua lenta (orbita)
      let rotation = 0;
      const animateRotation = () => {
        rotation += 0.02;
        map.setBearing(rotation % 360);
        requestAnimationFrame(animateRotation);
      };
      animateRotation();

      // 🌫️ Rimuovi e ripulisci
      map.on("remove", () => clearInterval(interval));
    });

    return () => {
      map.remove();
    };
  }, []);

  return (
    <div style={{ width: "100vw", height: "100vh", position: "relative" }}>
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

      {/* 🌓 Stato visivo */}
      <div
        style={{
          position: "absolute",
          bottom: "20px",
          left: "50%",
          transform: "translateX(-50%)",
          background: "rgba(0,0,0,0.6)",
          color: "white",
          padding: "10px 20px",
          borderRadius: "8px",
          fontSize: "0.9rem",
          zIndex: 3,
        }}
      >
        {isNight ? "🌙 Modalità Notturna Reale" : "☀️ Modalità Diurna Reale"}
      </div>
    </div>
  );
}
// ⬆️ FINE BLOCCO 5.5
