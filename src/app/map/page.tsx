// ⬇️ BLOCCO 11.3 — Atlas Eye Hybrid Ultra
"use client";

import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";

export default function MapPage() {
  const cesiumRef = useRef<HTMLDivElement>(null);
  const mapboxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let viewer: any = null;
    let map: any = null;

    const init = async () => {
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
        SceneMode,
      } = CesiumEngine;
      const { Viewer } = CesiumWidgets;

      (window as any).CESIUM_BASE_URL = "/cesium";
      Ion.defaultAccessToken = process.env.NEXT_PUBLIC_CESIUM_TOKEN || "";
      mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";

      // ✅ Inizializza Cesium
      viewer = new Viewer(cesiumRef.current!, {
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
        creditContainer: document.createElement("div"),
        scene3DOnly: true,
        terrainProvider: await createWorldTerrainAsync(),
      });

      viewer.scene.skyAtmosphere = new SkyAtmosphere();
      viewer.scene.backgroundColor = Color.BLACK;
      viewer.scene.globe.enableLighting = true;
      viewer.scene.light = new SunLight();

      // ✅ Layers
      const satLayer = await IonImageryProvider.fromAssetId(2);
      const labelsLayer = await IonImageryProvider.fromAssetId(3);
      const nightLayer = new UrlTemplateImageryProvider({
        url: "https://tiles.arcgis.com/tiles/qHLhCfIG1z3XJ1Yk/arcgis/rest/services/Earth_at_Night/MapServer/tile/{z}/{y}/{x}",
        credit: "NASA Earth at Night",
      });

      viewer.imageryLayers.removeAll();
      viewer.imageryLayers.addImageryProvider(satLayer);
      viewer.imageryLayers.addImageryProvider(labelsLayer);
      const night = viewer.imageryLayers.addImageryProvider(nightLayer);
      night.alpha = 0.0;

      // ✅ Zoom limitato
      const ctrl = viewer.scene.screenSpaceCameraController;
      ctrl.minimumZoomDistance = 300000;
      ctrl.maximumZoomDistance = 25000000;

      // ✅ Transizione morbida giorno/notte + switch Mapbox
      viewer.scene.postRender.addEventListener(() => {
        const sun = viewer.scene.light?.direction;
        if (sun) {
          const f = Math.max(0, 1 - sun.z);
          night.alpha += ((f * 0.9) - night.alpha) * 0.05; // fade fluido
        }
        const h = viewer.camera.positionCartographic.height;
        const c = cesiumRef.current!;
        const m = mapboxRef.current!;
        c.style.display = h < 300000 ? "none" : "block";
        m.style.display = h < 300000 ? "block" : "none";
      });

      viewer.camera.flyTo({
        destination: Cartesian3.fromDegrees(12.5, 41.9, 2500000),
        duration: 2.5,
      });

      // ✅ Mapbox
      map = new mapboxgl.Map({
        container: mapboxRef.current!,
        style: "mapbox://styles/mapbox/satellite-streets-v12",
        center: [12.5, 41.9],
        zoom: 4.5,
        pitch: 45,
        bearing: 0,
        antialias: true,
      });
      map.addControl(new mapboxgl.NavigationControl());
      map.addControl(new mapboxgl.FullscreenControl()); // 🌕 Schermo intero
      mapboxRef.current!.style.display = "none";

      // ✅ Ricerca
      const search = document.createElement("input");
      Object.assign(search, {
        placeholder: "Cerca luogo...",
      });
      Object.assign(search.style, {
        position: "absolute",
        top: "20px",
        left: "50%",
        transform: "translateX(-50%)",
        padding: "8px 14px",
        borderRadius: "8px",
        border: "1px solid #555",
        width: "280px",
        background: "rgba(15,15,20,0.8)",
        color: "#fff",
        fontSize: "14px",
        zIndex: "1000",
      });
      document.body.appendChild(search);

      search.addEventListener("keydown", async (e: any) => {
        if (e.key === "Enter") {
          const q = search.value.trim();
          if (!q) return;
          const r = await fetch(
            `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
              q
            )}.json?access_token=${mapboxgl.accessToken}`
          );
          const d = await r.json();
          const place = d.features?.[0];
          if (!place) return;
          const [lon, lat] = place.center;
          if (mapboxRef.current!.style.display === "block") {
            map.flyTo({ center: [lon, lat], zoom: 6 });
          } else {
            viewer.camera.flyTo({
              destination: Cartesian3.fromDegrees(lon, lat, 1000000),
              duration: 2,
            });
          }
        }
      });

      // ✅ Selettore stile (solo Satellite / Ibrido)
      const styleBox = document.createElement("div");
      Object.assign(styleBox.style, {
        position: "absolute",
        top: "20px",
        right: "20px",
        background: "rgba(10,10,20,0.8)",
        padding: "6px 10px",
        borderRadius: "8px",
        color: "#fff",
        zIndex: "1000",
        fontSize: "13px",
      });
      styleBox.innerHTML = `
        <b>Stile:</b>
        <select id="mapStyle" style="margin-left:6px;padding:2px 5px;border-radius:6px;background:#111;color:#fff;">
          <option value="satellite">Satellite</option>
          <option value="hybrid" selected>Ibrida</option>
        </select>
      `;
      document.body.appendChild(styleBox);

      const styleSel = document.getElementById("mapStyle") as HTMLSelectElement;
      styleSel.addEventListener("change", async () => {
        const v = styleSel.value;
        viewer.imageryLayers.removeAll();
        if (v === "satellite") {
          viewer.imageryLayers.addImageryProvider(satLayer);
        } else {
          viewer.imageryLayers.addImageryProvider(satLayer);
          viewer.imageryLayers.addImageryProvider(labelsLayer);
        }
        viewer.imageryLayers.addImageryProvider(nightLayer);

        map.setStyle(
          v === "satellite"
            ? "mapbox://styles/mapbox/satellite-v9"
            : "mapbox://styles/mapbox/satellite-streets-v12"
        );
      });

      // ✅ Controllo vista (sferica / piatta)
      const viewBox = document.createElement("div");
      Object.assign(viewBox.style, {
        position: "absolute",
        top: "20px",
        left: "20px",
        background: "rgba(10,10,20,0.8)",
        padding: "6px 10px",
        borderRadius: "8px",
        color: "#fff",
        zIndex: "1000",
        fontSize: "13px",
      });
      viewBox.innerHTML = `
        <b>Vista:</b>
        <select id="viewMode" style="margin-left:6px;padding:2px 5px;border-radius:6px;background:#111;color:#fff;">
          <option value="globe">Globo</option>
          <option value="flat">Atlante</option>
        </select>
      `;
      document.body.appendChild(viewBox);

      const viewSel = document.getElementById("viewMode") as HTMLSelectElement;
      viewSel.addEventListener("change", () => {
        if (viewSel.value === "flat") {
          viewer.scene.mode = SceneMode.SCENE2D; // vista piatta
        } else {
          viewer.scene.mode = SceneMode.SCENE3D; // globo
        }
      });

      console.log("🌍 Atlas Eye Hybrid Ultra attivo");
    };

    init();

    return () => {
      if (viewer && !viewer.isDestroyed()) viewer.destroy();
      if (map) map.remove();
    };
  }, []);

  return (
    <div style={{ width: "100vw", height: "100vh", overflow: "hidden" }}>
      <div ref={cesiumRef} style={{ position: "absolute", inset: 0 }} />
      <div ref={mapboxRef} style={{ position: "absolute", inset: 0 }} />
    </div>
  );
}
// ⬆️ FINE BLOCCO 11.3
