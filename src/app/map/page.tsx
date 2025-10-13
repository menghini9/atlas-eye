// ⬇️ BLOCCO 5.2 — MapPage (3D realistico + Geocoder + controlli)  // <--- SOSTITUISCI TUTTO
"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";

// CSS necessari
import "mapbox-gl/dist/mapbox-gl.css";
import MapboxGeocoder from "@mapbox/mapbox-gl-geocoder";
import "@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css";
const mapboxglAny = mapboxgl as unknown as any;

// ✅ Token da variabile d'ambiente (client-side)
mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";

export default function MapPage() {
  const router = useRouter();
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    // 🔒 Guard-rail: token mancante -> avviso visibile
    if (!mapboxgl.accessToken) {
      // Messaggio visibile in pagina
      const msg = document.createElement("div");
      msg.textContent =
        "⚠️ Mapbox token assente. Imposta NEXT_PUBLIC_MAPBOX_TOKEN e ricarica.";
      Object.assign(msg.style, {
        position: "absolute",
        top: "20px",
        left: "50%",
        transform: "translateX(-50%)",
        background: "#ffcc00",
        color: "#000",
        padding: "10px 14px",
        borderRadius: "10px",
        zIndex: "9999",
        fontWeight: "600",
      } as CSSStyleDeclaration);
      document.body.appendChild(msg);
      console.error("Mapbox token mancante (NEXT_PUBLIC_MAPBOX_TOKEN).");
      return;
    }

    if (mapRef.current || !mapContainerRef.current) return;

    // 🌍 Inizializza mappa (stile realistico ma con confini/etichette)
    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/satellite-streets-v12", // realistico + confini/label
      center: [12, 20], // long, lat (Africa-Europa in vista globale)
      zoom: 1.6,
      projection: "globe", // 🌐 globo 3D
      pitch: 45,
      bearing: -10,
      antialias: true,
    });
    mapRef.current = map;

    // ✨ Atmosfera/spazio per effetto "Earth from space"
    map.on("style.load", () => {
      map.setFog({
        range: [0.5, 10],
        color: "rgb(0, 6, 20)",
        "horizon-blend": 0.25,
        "high-color": "rgb(70, 150, 255)",
        "space-color": "rgb(8, 10, 24)",
        "star-intensity": 0.25,
      });

      // 🔳 Confini più marcati (stati + regioni) — se presenti nello stile
      const tweaks: Array<{
        id: string;
        paint: Record<string, any>;
        layout?: Record<string, any>;
      }> = [
        { id: "admin-0-boundary", paint: { "line-color": "#ffffff", "line-width": 1.1, "line-opacity": 0.9 } },
        { id: "admin-0-boundary-disputed", paint: { "line-color": "#ffd166", "line-width": 1.1, "line-opacity": 0.9 } },
        { id: "admin-1-boundary", paint: { "line-color": "#dddddd", "line-width": 0.7, "line-opacity": 0.8 } },
      ];
     // ⬇️ BLOCCO 5.2.1 — Tuning confini (FIX tipi)
tweaks.forEach(({ id, paint, layout }) => {
  try {
    if (layout) {
      (Object.entries(layout) as [string, any][])
        .forEach(([k, v]) => map.setLayoutProperty(id, k as any, v));
    }
    (Object.entries(paint) as [string, any][])
      .forEach(([k, v]) => map.setPaintProperty(id, k as any, v));
  } catch {
    // layer non presente: ignora senza rompere
  }
});
// ⬆️ FINE BLOCCO 5.2.1

    });

    // 🧭 Controlli base (zoom/rotazione) + scala
    map.addControl(new mapboxgl.NavigationControl({ showCompass: true }), "bottom-right");
    map.addControl(new mapboxgl.ScaleControl({ unit: "metric" }), "bottom-left");

    // 🔍 Geocoder (barra di ricerca funzionante)
    const geocoder = new MapboxGeocoder({
      accessToken: mapboxgl.accessToken,
      mapboxgl,
      marker: false,
      placeholder: "Cerca luogo...",
      proximity: { longitude: 12, latitude: 20 },
      countries: "it,fr,de,gb,es,pt,us,ca" // opzionale: indirizza i suggerimenti
    });
    map.addControl(geocoder);

    // 🎯 Posiziona la barra di ricerca al centro in alto
    map.once("load", () => {
      const el = document.querySelector(".mapboxgl-ctrl-geocoder") as HTMLElement | null;
      if (el) {
        Object.assign(el.style, {
          position: "absolute",
          top: "20px",
          left: "50%",
          transform: "translateX(-50%)",
          width: "420px",
          maxWidth: "80vw",
          zIndex: "5",
        } as CSSStyleDeclaration);
      }
    });

    // 🔒 Limita lo zoom per non scendere nelle città
    map.setMinZoom(1.2);
    map.setMaxZoom(6.2); // confini ben visibili, no street-level

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  return (
    <div style={{ width: "100vw", height: "100vh", position: "relative" }}>
      {/* Contenitore mappa */}
      <div ref={mapContainerRef} style={{ width: "100%", height: "100%" }} />

      {/* Pulsanti angolari */}
      <button
        onClick={() => router.push("/profile")}
        style={{
          position: "absolute",
          top: "20px",
          left: "20px",
          padding: "10px 20px",
          borderRadius: "12px",
          border: "none",
          background: "#064a8c",
          color: "#fff",
          cursor: "pointer",
          boxShadow: "0 6px 18px rgba(0,0,0,0.25)",
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
          borderRadius: "12px",
          border: "none",
          background: "#ff4444",
          color: "#fff",
          cursor: "pointer",
          boxShadow: "0 6px 18px rgba(0,0,0,0.25)",
        }}
      >
        🚪 Esci
      </button>
    </div>
  );
}
// ⬆️ FINE BLOCCO 5.2
