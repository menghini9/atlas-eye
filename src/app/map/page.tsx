// ⬇️ BLOCCO 5.6 — Atlas Eye “Terra Reale Fotometrica”
"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import MapboxGeocoder from "@mapbox/mapbox-gl-geocoder";
import SunCalc from "suncalc";
import "mapbox-gl/dist/mapbox-gl.css";
import "@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";

export default function MapPage() {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();
  const [isNight, setIsNight] = useState(false);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // 🌍 Inizializza mappa interattiva
    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/satellite-v9",
      center: [12, 20],
      zoom: 1.4,
      pitch: 45,
      bearing: 0,
      projection: "globe",
      dragPan: true,
      scrollZoom: true,
      touchZoomRotate: true,
    });

    map.on("style.load", () => {
      map.setFog({
        color: "rgb(0, 10, 40)",
        "horizon-blend": 0.4,
        "high-color": "rgb(100,150,255)",
        "space-color": "rgb(0,0,15)",
        "star-intensity": 0.5,
      });

      // 🌗 Texture NASA giorno/notte
      map.addSource("earth-day", {
        type: "raster",
        tiles: [
          "https://eoimages.gsfc.nasa.gov/images/imagerecords/57000/57730/land_ocean_ice_8192.tif"
        ],
        tileSize: 256,
      });

      map.addSource("earth-night", {
        type: "raster",
        tiles: [
          "https://eoimages.gsfc.nasa.gov/images/imagerecords/79000/79765/earth_lights_lrg.jpg"
        ],
        tileSize: 256,
      });

      map.addLayer({
        id: "earth-day",
        type: "raster",
        source: "earth-day",
        paint: { "raster-opacity": 1 },
      });

      map.addLayer({
        id: "earth-night",
        type: "raster",
        source: "earth-night",
        paint: { "raster-opacity": 0.0 },
      });

      // ☀️ Calcolo dinamico del sole
      const updateLighting = () => {
        const now = new Date();
        const { lat, lng } = map.getCenter();
        const sunPos = SunCalc.getPosition(now, lat, lng);
        const sunAngle = (sunPos.altitude * 180) / Math.PI;

        const opacityNight = Math.max(0, Math.min(1, (10 - sunAngle) / 10));
        map.setPaintProperty("earth-night", "raster-opacity", opacityNight);
        setIsNight(opacityNight > 0.4);

        map.setLight({
          color: isNight ? "#88bbff" : "white",
          intensity: isNight ? 0.2 : 0.8,
          position: [1, 180, sunAngle],
        });
      };

      updateLighting();
      const interval = setInterval(updateLighting, 30000);

      // 🌍 Rotazione lenta per effetto orbita
      let rotation = 0;
      const animate = () => {
        rotation += 0.01;
        map.setBearing(rotation % 360);
        requestAnimationFrame(animate);
      };
      animate();

      // 🔍 Barra di ricerca
      const geocoder = new (MapboxGeocoder as any)({
        accessToken: mapboxgl.accessToken,
        mapboxgl,
        placeholder: "Cerca luogo...",
        marker: false,
      });
      map.addControl(geocoder);

      // 🧭 Controlli standard
      map.addControl(new mapboxgl.NavigationControl({ showCompass: true }), "bottom-right");
      map.addControl(new mapboxgl.ScaleControl({ unit: "metric" }), "bottom-left");

      // Centra la barra
      setTimeout(() => {
        const gc = document.querySelector(".mapboxgl-ctrl-geocoder") as HTMLElement;
        if (gc) {
          gc.style.position = "absolute";
          gc.style.top = "20px";
          gc.style.left = "50%";
          gc.style.transform = "translateX(-50%)";
          gc.style.width = "350px";
          gc.style.zIndex = "3";
        }
      }, 1000);

      map.on("remove", () => clearInterval(interval));
    });

    return () => map.remove();
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
// ⬆️ FINE BLOCCO 5.6 — Terra Reale Fotometrica
