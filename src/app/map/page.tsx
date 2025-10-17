// ⬇️ BLOCCO 6.3 — Cesium 1.134.1 + Next 15 compatibile
"use client";

import { useEffect, useRef } from "react";
import * as Cesium from "cesium";
import "cesium/Build/Widgets/widgets.css";

export default function MapPage() {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let viewer: Cesium.Viewer | undefined;

    (async () => {
      // 🌍 Base URL per asset Cesium (in /public/cesium)
      (window as any).CESIUM_BASE_URL = "/cesium";

      // 🔑 Chiave API Cesium Ion
      Cesium.Ion.defaultAccessToken =
        process.env.NEXT_PUBLIC_CESIUM_API_KEY || "";

      // ✅ Crea il viewer
      viewer = new Cesium.Viewer(containerRef.current!, {
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
        terrainProvider: await Cesium.createWorldTerrainAsync(),
        useBrowserRecommendedResolution: true,
        requestRenderMode: true,
        maximumRenderTimeChange: 0.0,
      });

      // ☀️ Abilita luce e atmosfera
      viewer.scene.globe.enableLighting = true;
      viewer.scene.globe.dynamicAtmosphereLighting = true;
      viewer.scene.globe.showGroundAtmosphere = true;

      // 🗺️ Livelli immagini
      const layerAerial = viewer.imageryLayers.addImageryProvider(
        await Cesium.createWorldImageryAsync({
          style: Cesium.IonWorldImageryStyle.AERIAL,
        })
      );

      const layerLabels = viewer.imageryLayers.addImageryProvider(
        await Cesium.createWorldImageryAsync({
          style: Cesium.IonWorldImageryStyle.AERIAL_WITH_LABELS,
        })
      );
      layerLabels.alpha = 0.0;

      // 🌙 Livello notturno (NASA VIIRS)
      const nightProvider = new Cesium.UrlTemplateImageryProvider({
        url: "https://tiles.arcgis.com/tiles/wlVTGRSYTzAbjjiC/arcgis/rest/services/VIIRS_2023_Global/MapServer/tile/{z}/{y}/{x}",
        tilingScheme: Cesium.GeographicTilingScheme ? new Cesium.GeographicTilingScheme() : undefined,
        maximumLevel: 8,
      });

      const nightLayer = viewer.imageryLayers.addImageryProvider(nightProvider);
      nightLayer.alpha = 0.0;

      // 🔭 Zoom limits
      const c = viewer.scene.screenSpaceCameraController;
      c.minimumZoomDistance = 1_000_000;
      c.maximumZoomDistance = 25_000_000;

      // 🌗 Transizioni giorno/notte e labels
      const LABELS_ON_HEIGHT = 2_200_000;
      const NIGHT_BLEND_MIN = 0.1;
      const NIGHT_BLEND_MAX = 0.7;

      function updateLayers() {
        const height = viewer!.camera.positionCartographic.height;
        const targetAlpha = height < LABELS_ON_HEIGHT ? 1.0 : 0.0;
        layerLabels.alpha += (targetAlpha - layerLabels.alpha) * 0.15;

        const sunlightDir =
          (viewer!.scene as any).sunLight?.direction || new Cesium.Cartesian3(0, 0, 1);
        const lightIntensity = Math.max(0.0, sunlightDir.z);
        const targetNightAlpha =
          NIGHT_BLEND_MAX -
          lightIntensity * (NIGHT_BLEND_MAX - NIGHT_BLEND_MIN);
        nightLayer.alpha += (targetNightAlpha - nightLayer.alpha) * 0.05;

        viewer!.scene.requestRender();
      }

      viewer.scene.postRender.addEventListener(updateLayers);

      // 🌍 Posizione iniziale
      viewer.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(12.0, 20.0, 12_000_000),
        orientation: {
          heading: Cesium.Math.toRadians(-10),
          pitch: Cesium.Math.toRadians(-25),
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
// ⬆️ FINE BLOCCO 6.3
