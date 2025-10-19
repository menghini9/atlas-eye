"use client";
import { useEffect, useRef } from "react";

export default function MapPage() {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let viewer: any = null;

    const init = async () => {
      try {
        // 1) Import dinamico: copre sia mod.namespace sia mod.default
        const mod: any = await import("cesium");
        const C: any = mod?.default && (mod.default.Viewer || mod.default.Ion)
          ? mod.default
          : mod;

        // 2) Estraggo tutto ciò che mi serve dal namespace corretto
        const {
          Viewer,
          Ion,
          IonImageryProvider,
          createWorldTerrainAsync,
          SkyAtmosphere,
          Color,
          Cartesian3,
          // SkyBox // <- riattiva se vuoi lo skybox personalizzato
        } = C;

        // 3) Sanity check: se Viewer non è una funzione/constructor, fermo tutto qui
        if (typeof Viewer !== "function") {
          throw new Error(
            `Cesium.Viewer non trovato (typeof Viewer = ${typeof Viewer}). ` +
              `Namespace keys: ${Object.keys(C || {}).slice(0, 20).join(", ")}`
          );
        }

        // 4) Base URL per asset e token
        (window as any).CESIUM_BASE_URL = "/cesium";
        Ion.defaultAccessToken = process.env.NEXT_PUBLIC_CESIUM_TOKEN || "";

        if (!mapRef.current) return;

        // 5) Istanzio il Viewer
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
          creditContainer: document.createElement("div"), // 🔕 niente watermark
          scene3DOnly: true,
          terrainProvider: await createWorldTerrainAsync(),
          // skyBox: new SkyBox({ ... }) // <- opzionale
        });

        // 6) Scena “spazio profondo” sobria
        viewer.scene.skyAtmosphere = new SkyAtmosphere();
        viewer.scene.skyBox.show = true;
        viewer.scene.backgroundColor = Color.BLACK;
        viewer.scene.globe.enableLighting = true;
        viewer.scene.globe.depthTestAgainstTerrain = true;

        // 7) Layer satellitare Ion (assetId 2 = imagery globale)
        const imagery = await IonImageryProvider.fromAssetId(2);
        viewer.imageryLayers.removeAll();
        viewer.imageryLayers.addImageryProvider(imagery);

        // 8) Inquadratura iniziale: Europa
        viewer.camera.flyTo({
          destination: Cartesian3.fromDegrees(12.5, 41.9, 2_500_000),
          duration: 2.5,
        });

        console.log("🌍 Atlas Eye: Cesium attivo.");
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
