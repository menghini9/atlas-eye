// ⬇️ BLOCCO 6.1 — Cesium Orbital Earth (realistico + API key Cesium)
"use client";

import { useEffect, useRef } from "react";
import "/public/cesium/Widgets/widgets.css";

export default function MapPage() {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let viewer: any;

    (async () => {
      // ⚙️ Importa Cesium solo lato client
      const Cesium = await import("cesium");
      const {
        Ion,
        Viewer,
        createWorldTerrain,
        IonWorldImageryStyle,
        createWorldImagery,
        Cartesian3,
        Math: CMath,
        SunLight,
        JulianDate,
        SceneMode,
        UrlTemplateImageryProvider,
        ImageryLayer,
      } = Cesium as any;

      // 🌍 Base URL per gli asset Cesium (richiesti in /public/cesium)
      (window as any).CESIUM_BASE_URL = "/cesium";

      // 🔑 Imposta la chiave Cesium Ion
      Ion.defaultAccessToken = process.env.NEXT_PUBLIC_CESIUM_API_KEY || "";

      // 🪐 Crea il viewer (senza UI extra)
      viewer = new Viewer(containerRef.current!, {
        animation: false,
        timeline: false,
        baseLayerPicker: false,
        geocoder: false,
        homeButton: false,
        navigationHelpButton: false,
        sceneModePicker: false,
        fullscreenButton: false,
        infoBox: false,
        selectionIndicator: false,
        terrainProvider: createWorldTerrain(),
        useBrowserRecommendedResolution: true,
        requestRenderMode: true,
        maximumRenderTimeChange: 0.0,
      });

      // 🌞 Attiva illuminazione solare realistica
      viewer.scene.globe.enableLighting = true;
      viewer.scene.light = new SunLight();
      viewer.scene.globe.dynamicAtmosphereLighting = true;
      viewer.scene.globe.showGroundAtmosphere = true;

      // ——— LIVELLI IMMAGINI ———
      // 1️⃣ AERIAL (fotorealistico, senza confini)
      const layerAerial = viewer.imageryLayers.addImageryProvider(
        createWorldImagery({ style: IonWorldImageryStyle.AERIAL })
      );
      layerAerial.alpha = 1.0;

      // 2️⃣ AERIAL + LABELS (visibile solo da vicino)
      const layerLabels = viewer.imageryLayers.addImageryProvider(
        createWorldImagery({ style: IonWorldImageryStyle.AERIAL_WITH_LABELS })
      );
      layerLabels.alpha = 0.0;

      // 3️⃣ LAYER NOTTURNO (NASA VIIRS, overlay realistico)
      const nightProvider = new UrlTemplateImageryProvider({
        url: "https://tiles.arcgis.com/tiles/wlVTGRSYTzAbjjiC/arcgis/rest/services/VIIRS_2023_Global/MapServer/tile/{z}/{y}/{x}",
        tilingScheme: viewer.scene.globe.ellipsoid.tilingScheme,
        maximumLevel: 8,
      });
      const nightLayer: typeof ImageryLayer = viewer.imageryLayers.addImageryProvider(
        nightProvider
      );
      nightLayer.alpha = 0.0;

      // 🔭 Limita zoom (niente livello strada)
      const controller = viewer.scene.screenSpaceCameraController;
      controller.minimumZoomDistance = 1_000_000;
      controller.maximumZoomDistance = 25_000_000;
      controller.enableCollisionDetection = true;

      // ——— SWITCH AUTOMATICO LABELS ———
      const LABELS_ON_HEIGHT = 2_200_000; // Mostra confini sotto i 2200 km
      const NIGHT_BLEND_MIN = 0.1;
      const NIGHT_BLEND_MAX = 0.7;

      function updateLayers() {
        const height = viewer.camera.positionCartographic.height;

        // Gestione confini
        const targetAlpha = height < LABELS_ON_HEIGHT ? 1.0 : 0.0;
        layerLabels.alpha += (targetAlpha - layerLabels.alpha) * 0.15;

        // Calcola posizione del Sole e blend notte in base alla luce reale
        const now = JulianDate.now();
        viewer.scene.globe.enableLighting = true;
        const sunlightDir = viewer.scene.sunDirection;
        const lightIntensity = Math.max(0.0, sunlightDir.z); // z = intensità verso camera
        const targetNightAlpha = NIGHT_BLEND_MAX - lightIntensity * (NIGHT_BLEND_MAX - NIGHT_BLEND_MIN);
        nightLayer.alpha += (targetNightAlpha - nightLayer.alpha) * 0.05;

        viewer.scene.requestRender();
      }

      viewer.scene.postRender.addEventListener(updateLayers);

      // 🌍 Posizione iniziale (centrata su Africa/Europa)
      viewer.camera.flyTo({
        destination: Cartesian3.fromDegrees(12.0, 20.0, 12_000_000),
        orientation: {
          heading: CMath.toRadians(-10),
          pitch: CMath.toRadians(-25),
          roll: 0,
        },
        duration: 2.0,
      });
    })();

    return () => {
      if (viewer && !viewer.isDestroyed()) viewer.destroy();
    };
  }, []);

  return (
    <div style={{ width: "100vw", height: "100vh", position: "relative" }}>
      <div ref={containerRef} style={{ width: "100%", height: "100%" }} />
    </div>
  );
}
// ⬆️ FINE BLOCCO 6.1
