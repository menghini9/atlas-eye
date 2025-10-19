"use client";

import { useEffect, useRef } from "react";

export default function MapPage() {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let viewer: any = null;

    const init = async () => {
      try {
        // 🔹 Importa i due moduli moderni separati
        const CesiumEngine = await import("@cesium/engine");
        const CesiumWidgets = await import("@cesium/widgets");

        // Estraggo solo le classi necessarie da ciascun modulo
        const {
          Ion,
          IonImageryProvider,
          createWorldTerrainAsync,
          SkyAtmosphere,
          Color,
          Cartesian3,
        } = CesiumEngine;

        const { Viewer } = CesiumWidgets;

        if (!Viewer) throw new Error("Viewer non trovato nel modulo @cesium/widgets.");

        // 🔹 Imposta la base URL e token Ion
        (window as any).CESIUM_BASE_URL = "/cesium";
        Ion.defaultAccessToken = process.env.NEXT_PUBLIC_CESIUM_TOKEN || "";

        if (!mapRef.current) return;

        // 🔹 Crea il Viewer
        viewer = new Viewer(mapRef.current, {
          animation: false,
          timeline: false,
          baseLayerPicker: false,
          homeButton: false,
          navigationHelpButton: false,
          geocoder: false,
          fullscreenButton: false,
          sceneModePicker: false,
          infoBox: false,
          selectionIndicator: false,
          creditContainer: document.createElement("div"), // Rimuove watermark Cesium
          scene3DOnly: true,
          terrainProvider: await createWorldTerrainAsync(),
        });

        // 🔹 Spazio profondo e atmosfera
        viewer.scene.skyAtmosphere = new SkyAtmosphere();
        viewer.scene.backgroundColor = Color.BLACK;
        viewer.scene.globe.enableLighting = true;
        viewer.scene.globe.depthTestAgainstTerrain = true;

        // 🔹 Layer satellitare Ion
        const imagery = await IonImageryProvider.fromAssetId(2);
        viewer.imageryLayers.removeAll();
        viewer.imageryLayers.addImageryProvider(imagery);

        // 🔹 Volo iniziale sull’Europa
        viewer.camera.flyTo({
          destination: Cartesian3.fromDegrees(12.5, 41.9, 2_500_000),
          duration: 3,
        });

        console.log("🌍 Atlas Eye (engine+widgets) avviato correttamente!");
      } catch (err) {
        console.error("❌ Errore inizializzazione Cesium:", err);
      }
    };

    init();

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
        overflow: "hidden",
        background: "black",
      }}
    />
  );
}
