"use client";
import { useEffect, useRef } from "react";

export default function MapPage() {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let viewer: any = null;

    const init = async () => {
      try {
        // 🔹 Import moduli moderni Cesium
        const CesiumEngine = await import("@cesium/engine");
        const CesiumWidgets = await import("@cesium/widgets");

        const {
          Ion,
          IonImageryProvider,
          createWorldTerrainAsync,
          SkyAtmosphere,
          Color,
          Cartesian3,
          UrlTemplateImageryProvider,
          SunLight,
        } = CesiumEngine;

        const { Viewer } = CesiumWidgets;
        if (!Viewer) throw new Error("Viewer non trovato nel modulo @cesium/widgets.");

        // 🔹 Token e base URL
        (window as any).CESIUM_BASE_URL = "/cesium";
        Ion.defaultAccessToken = process.env.NEXT_PUBLIC_CESIUM_TOKEN || "";

        if (!mapRef.current) return;

        // 🔹 Crea il Viewer con interfaccia completa
        viewer = new Viewer(mapRef.current, {
          animation: false,
          timeline: false,
          baseLayerPicker: true,       // 🌍 Selettore layer
          homeButton: true,            // 🏠 Reset visuale
          navigationHelpButton: true,  // ❔ Aiuto controlli
          geocoder: true,              // 🔍 Ricerca località
          fullscreenButton: true,      // ⛶ Schermo intero
          sceneModePicker: true,       // 2D / 3D toggle
          infoBox: false,
          selectionIndicator: false,
          creditContainer: document.createElement("div"), // niente watermark
          scene3DOnly: true,
          terrainProvider: await createWorldTerrainAsync(),
        });

        // 🔹 Colore base, illuminazione e atmosfera
        viewer.scene.skyAtmosphere = new SkyAtmosphere();
        viewer.scene.backgroundColor = Color.BLACK;
        viewer.scene.globe.enableLighting = true;
        viewer.scene.globe.depthTestAgainstTerrain = true;
        viewer.scene.light = new SunLight();

        // 🔹 Layer satellitare Ion (asset 2)
        const baseImagery = await IonImageryProvider.fromAssetId(2);
        viewer.imageryLayers.removeAll();
        viewer.imageryLayers.addImageryProvider(baseImagery);

        // 🔹 Confini e nomi (asset 3)
        const labelsLayer = await IonImageryProvider.fromAssetId(3);
        viewer.imageryLayers.addImageryProvider(labelsLayer);

        // 🌙 Layer luci notturne
        const nightLayer = new UrlTemplateImageryProvider({
          url: "https://tiles.arcgis.com/tiles/qHLhCfIG1z3XJ1Yk/arcgis/rest/services/Earth_at_Night/MapServer/tile/{z}/{y}/{x}",
          credit: "NASA Earth at Night",
        });
        const addedNightLayer = viewer.imageryLayers.addImageryProvider(nightLayer);
        addedNightLayer.alpha = 0.0; // inizialmente invisibile
        addedNightLayer.brightness = 1.0;

        // 🔁 Aggiorna il blending dinamico notte/giorno
        viewer.scene.postRender.addEventListener(() => {
          const sun = viewer.scene.light?.direction;
          if (sun) {
            const daySide = Math.max(0, sun.z);
            addedNightLayer.alpha = 1.0 - daySide; // più sole = meno luce artificiale
          }
        });

        // 🔹 Volo iniziale sull’Europa
        viewer.camera.flyTo({
          destination: Cartesian3.fromDegrees(12.5, 41.9, 2_500_000),
          duration: 2.5,
        });

        console.log("🌍 Atlas Eye completo: luce dinamica + layer notturni + confini OK");
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
