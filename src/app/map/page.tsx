// ⬇️ BLOCCO 10.8 — Atlas Eye View (Cesium personalizzato, senza watermark)
"use client";

import { useRef, useEffect } from "react";

export default function MapPage() {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let viewer: any = null;

    const initCesium = async () => {
      try {
        // ✅ Import dinamico compatibile con Next.js (ESM + CommonJS)
        const CesiumModule = await import("cesium");
        const Cesium = CesiumModule.default || CesiumModule;

        // ✅ Token e base URL
        (window as any).CESIUM_BASE_URL = "/cesium";
        Cesium.Ion.defaultAccessToken =
          process.env.NEXT_PUBLIC_CESIUM_TOKEN || "";

        // ✅ Creazione Viewer
        if (!mapRef.current) return;
        viewer = new Cesium.Viewer(mapRef.current, {
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
          creditContainer: document.createElement("div"), // ❗️Rimuove watermark Cesium
          skyBox: new Cesium.SkyBox({
            sources: {
              positiveX: "images/space_right.png",
              negativeX: "images/space_left.png",
              positiveY: "images/space_top.png",
              negativeY: "images/space_bottom.png",
              positiveZ: "images/space_front.png",
              negativeZ: "images/space_back.png",
            },
          }),
          scene3DOnly: true,
          terrainProvider: await Cesium.createWorldTerrainAsync(),
        });

        // ✅ Spazio e atmosfera
        viewer.scene.skyAtmosphere = new Cesium.SkyAtmosphere();
        viewer.scene.skyBox.show = true;
        viewer.scene.backgroundColor = Cesium.Color.BLACK;
        viewer.scene.globe.enableLighting = true;
        viewer.scene.globe.depthTestAgainstTerrain = true;

        // ✅ Layer satellitare Ion
        const imageryProvider = await Cesium.IonImageryProvider.fromAssetId(2);
        viewer.imageryLayers.removeAll();
        viewer.imageryLayers.addImageryProvider(imageryProvider);

        // ✅ Volo iniziale: Europa
        viewer.camera.flyTo({
          destination: Cesium.Cartesian3.fromDegrees(12.5, 41.9, 2500000),
          duration: 3,
        });

        console.log("🌍 Atlas Eye View attiva!");
      } catch (err) {
        console.error("❌ Errore inizializzazione Cesium:", err);
      }
    };

    initCesium();

    // ✅ Pulizia alla chiusura
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
        backgroundColor: "black",
      }}
    />
  );
}
// ⬆️ FINE BLOCCO 10.8
