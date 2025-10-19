// ⬇️ BLOCCO 9.2 — MapPage definitivo (Cesium + Next 15 compatibile)
"use client";
import { useEffect, useRef } from "react";

export default function MapPage() {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let viewer: any;

    // funzione asincrona per caricare Cesium solo lato client
    const initCesium = async () => {
      try {
        const Cesium = await import("cesium");

        // token Cesium Ion (metti il tuo in .env.local)
        Cesium.Ion.defaultAccessToken =
          process.env.NEXT_PUBLIC_CESIUM_ION_TOKEN || "";

        // base URL per gli asset statici Cesium
        (window as any).CESIUM_BASE_URL = "/";

        if (mapRef.current) {
          // Crea il viewer base
          viewer = new Cesium.Viewer(mapRef.current, {
            baseLayerPicker: false,
            timeline: false,
            animation: false,
          });

          // Carica layer satellitare (assetId 2 = Bing Maps global imagery)
          const provider = await Cesium.IonImageryProvider.fromAssetId(2);
          viewer.imageryLayers.removeAll();
          viewer.imageryLayers.addImageryProvider(provider);
        }
      } catch (err) {
        console.error("Errore inizializzazione Cesium:", err);
      }
    };

    initCesium();

    // cleanup quando la pagina viene chiusa o ricaricata
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
// ⬆️ FINE BLOCCO 9.2
