// ⬇️ BLOCCO 10.7 — Cesium funzionante su Next 15.5 + Engine moderno
"use client";
import { useEffect, useRef } from "react";

export default function MapPage() {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let viewer: any;

    const initCesium = async () => {
      try {
        // Importa il namespace Cesium completo
        const Cesium = await import("cesium");
        const Engine = await import("@cesium/engine");
        const Widgets = await import("@cesium/widgets");

        // Imposta token e path base
        (Engine as any).Ion.defaultAccessToken =
        process.env.NEXT_PUBLIC_CESIUM_TOKEN || "";
        (window as any).CESIUM_BASE_URL = "/cesium";

        // Usa Viewer dal namespace corretto
        const CesiumViewer = (Widgets as any).Viewer || (Engine as any).Viewer;

        if (!CesiumViewer) {
          throw new Error("❌ Viewer non trovato nei moduli Cesium!");
        }

        // Crea viewer solo se esiste il container
        if (mapRef.current) {
          viewer = new CesiumViewer(mapRef.current, {
            baseLayerPicker: false,
            animation: false,
            timeline: false,
            terrainProvider: await (Engine as any).createWorldTerrainAsync(),
          });

          // Layer satellitare
          const imageryProvider = await (Engine as any).IonImageryProvider.fromAssetId(2);
          viewer.imageryLayers.removeAll();
          viewer.imageryLayers.addImageryProvider(imageryProvider);

          // Vista iniziale su Roma 🌍
          viewer.camera.flyTo({
            destination: (Engine as any).Cartesian3.fromDegrees(12.5, 41.9, 2500000),
          });
        }
      } catch (err) {
        console.error("❌ Errore inizializzazione Cesium:", err);
      }
    };

    initCesium();

    return () => {
      if (viewer && viewer.destroy && !viewer.isDestroyed()) viewer.destroy();
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
// ⬆️ FINE BLOCCO 10.7
