// ⬇️ BLOCCO 6.3 — Cesium 1.134.1 + Next 15 compatibile
// ⬇️ BLOCCO 6.3 — Cesium 1.134.1 + Next 15 compatibile
// @ts-nocheck

"use client";

import { useEffect, useRef } from "react";
// @ts-ignore – Cesium ha definizioni incomplete in ESM
import { Viewer } from "cesium";
import "@cesium/widgets/Source/widgets.css";
 // ✅ compatibile anche su Vercel




export default function MapPage() {
  const containerRef = useRef<HTMLDivElement | null>(null);

useEffect(() => {
  // @ts-ignore
  let viewer: any;

  (async () => {
    // 🌍 Path agli asset statici Cesium
    (window as any).CESIUM_BASE_URL = "/cesium";

    // 🔑 Chiave Cesium Ion
    // @ts-ignore
    Cesium.Ion.defaultAccessToken = process.env.NEXT_PUBLIC_CESIUM_API_KEY || "";

    // @ts-ignore
    const terrain = await Cesium.createWorldTerrainAsync();
    // @ts-ignore
    viewer = new Cesium.Viewer(containerRef.current!, {
      terrainProvider: terrain,
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
      useBrowserRecommendedResolution: true,
      requestRenderMode: true,
      maximumRenderTimeChange: 0.0,
    });

    // 🌞 Illuminazione
    // @ts-ignore
    viewer.scene.globe.enableLighting = true;
    // @ts-ignore
    viewer.scene.globe.dynamicAtmosphereLighting = true;

    // 🌍 Vista iniziale
    // @ts-ignore
    viewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(12.0, 20.0, 12_000_000),
    });
  })();

  return () => {
    // @ts-ignore
    if (viewer && !viewer.isDestroyed()) viewer.destroy();
  };
}, []);

}
// ⬆️ FINE BLOCCO 6.3
