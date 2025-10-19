// ⬇️ BLOCCO 9.4 — Cesium funzionante su Next 15.5 + Vercel (build stabile)
"use client";
import { useEffect, useRef } from "react";

export default function MapPage() {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let viewer: any;

    const initCesium = async () => {
      try {
        // Importa i moduli base dal pacchetto completo
        const Cesium = await import("cesium");

        // Imposta token e percorso base
        Cesium.Ion.defaultAccessToken =
          process.env.NEXT_PUBLIC_CESIUM_ION_TOKEN || "";
        (window as any).CESIUM_BASE_URL = "/";

        if (mapRef.current) {
          // Crea il viewer 3D
          viewer = new Cesium.Viewer(mapRef.current, {
            baseLayerPicker: false,
            animation: false,
            timeline: false,
            terrainProvider: await Cesium.createWorldTerrainAsync(),
          });

          // Layer satellitare globale
          const imageryProvider = await Cesium.IonImageryProvider.fromAssetId(2);
          viewer.imageryLayers.removeAll();
          viewer.imageryLayers.addImageryProvider(imageryProvider);

          // Imposta la visuale iniziale sull’Europa
          viewer.camera.flyTo({
            destination: Cesium.Cartesian3.fromDegrees(12.5, 41.9, 2500000), // Roma
          });
        }
      } catch (err) {
        console.error("❌ Errore inizializzazione Cesium:", err);
      }
    };

    initCesium();

    // cleanup
    return () => {
      if (viewer && !viewer.isDestroyed()) viewer.destroy();
    };
  }, []);

  return (
    <div
      ref={mapRef}
      style={{
        width: "100vw",
        height: "100vh",
        backgroundColor: "black",
        overflow: "hidden",
      }}
    />
  );
}
// ⬆️ FINE BLOCCO 9.4
