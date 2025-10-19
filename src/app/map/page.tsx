// ⬇️ BLOCCO 9.5 — Cesium funzionante con import completo
"use client";
import { useEffect, useRef } from "react";
import "cesium/Build/Cesium/Widgets/widgets.css";

export default function MapPage() {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let viewer: any;

    const initCesium = async () => {
      try {
        // 🔧 Import dinamico dal pacchetto principale
        const Cesium = await import("cesium");

        // 🔑 Token e base URL
        Cesium.Ion.defaultAccessToken = process.env.NEXT_PUBLIC_CESIUM_ION_TOKEN || "";
        (window as any).CESIUM_BASE_URL = "/";

        // 🌍 Inizializza il Viewer 3D
        if (mapRef.current) {
          viewer = new Cesium.Viewer(mapRef.current, {
            baseLayerPicker: false,
            animation: false,
            timeline: false,
            terrainProvider: await Cesium.createWorldTerrainAsync(),
          });

          // 🛰️ Layer satellitare globale
          const imageryProvider = await Cesium.IonImageryProvider.fromAssetId(2);
          viewer.imageryLayers.removeAll();
          viewer.imageryLayers.addImageryProvider(imageryProvider);

          // 🧭 Visuale iniziale su Roma
          viewer.camera.flyTo({
            destination: Cesium.Cartesian3.fromDegrees(12.5, 41.9, 2500000),
          });

          console.log("✅ Cesium caricato correttamente");
        }
      } catch (err) {
        console.error("❌ Errore inizializzazione Cesium:", err);
      }
    };

    initCesium();

    // 🧹 Distruzione viewer al dismount
    return () => {
      if (viewer && !viewer.isDestroyed()) viewer.destroy();
    };
  }, []);

  return (
    <div
      ref={mapRef}
      id="cesiumContainer"
      style={{
        width: "100vw",
        height: "100vh",
        backgroundColor: "black",
        overflow: "hidden",
      }}
    />
  );
}
// ⬆️ FINE BLOCCO 9.5
