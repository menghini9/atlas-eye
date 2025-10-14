// ⬇️ BLOCCO 5.4 — Atlas Eye “Terra Viva”: mappa realistica giorno/notte
"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import MapboxGeocoder from "@mapbox/mapbox-gl-geocoder";
import "mapbox-gl/dist/mapbox-gl.css";
import "@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css";
import SunCalc from "suncalc";

// ✅ Token Mapbox
mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";
const mapboxglAny = mapboxgl as unknown as any;

export default function MapPage() {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const router = useRouter();
  const [isNight, setIsNight] = useState(false);

  // 🕐 Calcola giorno o notte in base all'ora e posizione
  const updateLighting = (map: mapboxgl.Map) => {
    const now = new Date();
    const { lat, lng } = map.getCenter();
    const times = SunCalc.getTimes(now, lat, lng);
    const isNightNow = now < times.sunrise || now > times.sunset;

    setIsNight(isNightNow);

    if (isNightNow) {
      // 🌙 Modalità notturna
      map.setStyle("mapbox://styles/mapbox/dark-v11");
      map.once("style.load", () => {
        map.addSource("night-lights", {
          type: "raster",
          tiles: [
            "https://tiles.arcgis.com/tiles/wlVTGRSYTzAbjjiC/arcgis/rest/services/VIIRS_2023_Global/MapServer/tile/{z}/{y}/{x}",
          ],
          tileSize: 256,
        });

        map.addLayer({
          id: "night-lights",
          type: "raster",
          source: "night-lights",
          paint: { "raster-opacity": 0.75 },
        });

        map.setFog({
          color: "rgb(5,5,25)",
          "horizon-blend": 0.2,
          "high-color": "rgb(60,100,255)",
          "space-color": "rgb(0,0,15)",
          "star-intensity": 0.4,
        });
        map.setLight({ color: "#88bbff", intensity: 0.2 });
      });
    } else {
      // ☀️ Modalità diurna
      map.setStyle("mapbox://styles/mapbox/satellite-streets-v12");
      map.once("style.load", () => {
        map.setFog({
          color: "rgb(200,220,255)",
          "horizon-blend": 0.5,
          "high-color": "rgb(255,255,255)",
          "space-color": "rgb(135,206,250)",
          "star-intensity": 0.0,
        });
        map.setLight({ color: "white", intensity: 0.7 });
      });
    }
  };

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // 🌍 Inizializza mappa
    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/satellite-streets-v12",
      center: [10, 20],
      zoom: 1.6,
      pitch: 45,
      bearing: -10,
      projection: "globe",
    });
    mapRef.current = map;

    // 🌇 Imposta illuminazione iniziale
    map.on("load", () => updateLighting(map));

    // 🔄 Aggiorna ogni 10 minuti
    const interval = setInterval(() => updateLighting(map), 600000);

    // 🔍 Geocoder (cerca luogo)
    const geocoder = new (MapboxGeocoder as any)({
      accessToken: (mapboxgl as any).accessToken,
      mapboxgl: mapboxglAny,
      marker: false,
      placeholder: "Cerca luogo...",
      proximity: { longitude: 12, latitude: 20 },
      countries: "it,fr,de,gb,es,pt,us,ca",
    });
    map.addControl(geocoder);

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

    // 🎨 Centra la barra
    const styleSearchBar = () => {
      const gc = document.querySelector(".mapboxgl-ctrl-geocoder") as HTMLElement;
      if (gc) {
        gc.style.position = "absolute";
        gc.style.top = "20px";
        gc.style.left = "50%";
        gc.style.transform = "translateX(-50%)";
        gc.style.width = "350px";
        gc.style.zIndex = "3";
      }
    };
    setTimeout(styleSearchBar, 1000);

    // 🧭 Controlli base
    map.addControl(new mapboxgl.NavigationControl({ showCompass: true }), "bottom-right");
    map.addControl(new mapboxgl.ScaleControl({ unit: "metric" }), "bottom-left");

    return () => {
      clearInterval(interval);
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
        {isNight ? "🌙 Modalità Notturna Attiva" : "☀️ Modalità Diurna Attiva"}
      </div>
    </div>
  );
}
// ⬆️ FINE BLOCCO 5.4 — Terra Viva
