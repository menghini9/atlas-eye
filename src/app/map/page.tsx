"use client";
import { useEffect, useRef } from "react";

export default function MapPage() {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let viewer: any = null;

    const init = async () => {
      try {
        // Import Cesium moderni
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

        (window as any).CESIUM_BASE_URL = "/cesium";
        Ion.defaultAccessToken = process.env.NEXT_PUBLIC_CESIUM_TOKEN || "";

        if (!mapRef.current) return;

        // ✅ Viewer base con controlli completi
        viewer = new Viewer(mapRef.current, {
          animation: false,
          timeline: false,
          baseLayerPicker: false, // Lo sostituiremo con un selettore nostro
          homeButton: true,
          navigationHelpButton: false,
          geocoder: true,
          fullscreenButton: true,
          sceneModePicker: true,
          infoBox: false,
          selectionIndicator: false,
          creditContainer: document.createElement("div"),
          scene3DOnly: true,
          terrainProvider: await createWorldTerrainAsync(),
        });

        // ✅ Atmosfera e illuminazione solare
        viewer.scene.skyAtmosphere = new SkyAtmosphere();
        viewer.scene.backgroundColor = Color.BLACK;
        viewer.scene.globe.enableLighting = true;
        viewer.scene.globe.depthTestAgainstTerrain = true;
        viewer.scene.light = new SunLight();

        // ✅ Layer satellitare (Ion asset 2)
        const satelliteLayer = await IonImageryProvider.fromAssetId(2);
        viewer.imageryLayers.removeAll();
        const baseLayer = viewer.imageryLayers.addImageryProvider(satelliteLayer);

        // ✅ Confini e nomi (Ion asset 3)
        const labelLayer = await IonImageryProvider.fromAssetId(3);
        viewer.imageryLayers.addImageryProvider(labelLayer);

        // ✅ Layer stradale "cartina"
        const roadLayer = new UrlTemplateImageryProvider({
          url: "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
          credit: "OpenStreetMap contributors",
        });

        // ✅ Layer luci notturne realistiche
        const nightLayer = new UrlTemplateImageryProvider({
          url: "https://tiles.arcgis.com/tiles/qHLhCfIG1z3XJ1Yk/arcgis/rest/services/Earth_at_Night/MapServer/tile/{z}/{y}/{x}",
          credit: "NASA Earth at Night",
        });
        const addedNightLayer = viewer.imageryLayers.addImageryProvider(nightLayer);
        addedNightLayer.alpha = 0.0;

        // 🔁 Blending dinamico notte/giorno
        viewer.scene.postRender.addEventListener(() => {
          const sun = viewer.scene.light?.direction;
          if (sun) {
            const nightFactor = Math.max(0, 1 - sun.z);
            addedNightLayer.alpha = nightFactor * 0.8;
          }
        });

        // ✅ Limite zoom aumentato (fino alle città)
        viewer.scene.screenSpaceCameraController.minimumZoomDistance = 50;
        viewer.scene.screenSpaceCameraController.maximumZoomDistance = 30_000_000;

        // ✅ Vista iniziale sull’Europa
        viewer.camera.flyTo({
          destination: Cartesian3.fromDegrees(12.5, 41.9, 2_500_000),
          duration: 2.5,
        });

        // ✅ Aggiunge "picker" manuale per gli stili
        const control = document.createElement("div");
        control.style.position = "absolute";
        control.style.top = "15px";
        control.style.right = "15px";
        control.style.background = "rgba(10, 10, 20, 0.8)";
        control.style.padding = "8px 12px";
        control.style.borderRadius = "10px";
        control.style.color = "#fff";
        control.style.fontSize = "13px";
        control.style.zIndex = "1000";
        control.style.backdropFilter = "blur(5px)";
        control.style.userSelect = "none";
        control.innerHTML = `
          <b>🗺️ Mappa:</b>
          <select id="mapStyle" style="margin-left:8px;padding:3px 5px;border-radius:6px;background:#111;color:#fff;">
            <option value="satellite">Satellite</option>
            <option value="roads">Cartina</option>
            <option value="hybrid">Ibrida</option>
          </select>
        `;
        document.body.appendChild(control);

        const styleSelect = document.getElementById("mapStyle") as HTMLSelectElement;
        styleSelect.addEventListener("change", () => {
          const value = styleSelect.value;
          viewer.imageryLayers.removeAll();

          if (value === "satellite") {
            viewer.imageryLayers.addImageryProvider(satelliteLayer);
            viewer.imageryLayers.addImageryProvider(labelLayer);
          } else if (value === "roads") {
            viewer.imageryLayers.addImageryProvider(roadLayer);
          } else if (value === "hybrid") {
            viewer.imageryLayers.addImageryProvider(satelliteLayer);
            viewer.imageryLayers.addImageryProvider(labelLayer);
            viewer.imageryLayers.addImageryProvider(roadLayer);
          }
          viewer.imageryLayers.addImageryProvider(nightLayer);
        });

        console.log("🌍 Atlas Eye — realistico e completo con layer dinamici attivo.");
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
