// ⬇️ BLOCCO 5.8.2 — Mappa 3D realistica senza errori TS o dynamic()
"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import "mapbox-gl/dist/mapbox-gl.css";
import "@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css";

export default function MapPage() {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (typeof window === "undefined") return;

    const loadMap = async () => {
      const mapboxgl = (await import("mapbox-gl")).default;
      const MapboxGeocoder = (await import("@mapbox/mapbox-gl-geocoder")).default;
      const SunCalc = (await import("suncalc")).default;

      mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";

      // 🌍 Crea mappa 3D
      const map = new mapboxgl.Map({
        container: mapContainerRef.current!,
        style: "mapbox://styles/mapbox/satellite-streets-v12",
        center: [12, 20],
        zoom: 1.6,
        pitch: 45,
        bearing: -15,
        projection: "globe",
      });

      // ☀️ Calcola posizione del sole
      const now = new Date();
      const sun = SunCalc.getPosition(now, 0, 0);
      const sunAltitude = (sun.altitude * 180) / Math.PI;
      const sunAzimuth = (sun.azimuth * 180) / Math.PI;

      // 🌌 Effetti giorno/notte
      map.on("style.load", () => {
        map.setFog({
          color: sunAltitude < 0 ? "rgb(5,5,15)" : "rgb(0,20,60)",
          "horizon-blend": 0.3,
          "high-color": sunAltitude < 0 ? "rgb(80,80,120)" : "rgb(80,160,255)",
          "space-color": "rgb(10,10,25)",
          "star-intensity": sunAltitude < 0 ? 0.4 : 0.1,
        });

        map.setLight({
          anchor: "viewport",
          color: sunAltitude < 0 ? "rgb(255,220,180)" : "white",
          intensity: sunAltitude < 0 ? 0.2 : 0.6,
          position: [sunAzimuth, sunAltitude, 90],
        });
      });

      // 🔍 Barra di ricerca
      const geocoder = new MapboxGeocoder({
  accessToken: mapboxgl.accessToken,
  // @ts-ignore
  mapboxgl,
  marker: false,
  placeholder: "Cerca luogo...",
  proximity: { longitude: 12, latitude: 20 },
  countries: "it,fr,de,gb,es,pt,us,ca",
});

      map.addControl(geocoder);

      // 🧭 Controlli base
      map.addControl(new mapboxgl.NavigationControl({ showCompass: true }), "bottom-right");
      map.addControl(new mapboxgl.ScaleControl({ unit: "metric" }), "bottom-left");

      return () => map.remove();
    };

    loadMap();
  }, []);

  return (
    <div style={{ width: "100vw", height: "100vh", position: "relative" }}>
      <div ref={mapContainerRef} style={{ width: "100%", height: "100%" }} />

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
          fontWeight: 600,
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
          fontWeight: 600,
        }}
      >
        🚪 Esci
      </button>
    </div>
  );
}
// ⬆️ FINE BLOCCO 5.8.2
