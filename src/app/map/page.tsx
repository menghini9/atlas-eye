// ⬇️ BLOCCO 11.4 — Atlas Eye Hybrid Ultra+ (Atlante + Luci + Fullscreen)
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
        WebMercatorProjection,
      } = CesiumEngine;
      const { Viewer } = CesiumWidgets;

      (window as any).CESIUM_BASE_URL = "/cesium";
      Ion.defaultAccessToken = process.env.NEXT_PUBLIC_CESIUM_TOKEN || "";
      mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";

      // ✅ Inizializza Cesium (2D abilitato)
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
        scene3DOnly: false, // ⚡ permette anche la vista 2D
        mapProjection: new WebMercatorProjection(),
        terrainProvider: await createWorldTerrainAsync(),
      });

      viewer.scene.skyAtmosphere = new SkyAtmosphere();
      viewer.scene.backgroundColor = Color.BLACK;
      viewer.scene.globe.enableLighting = true;
      viewer.scene.light = new SunLight();

      // ✅ Layers
      const satLayer = await IonImageryProvider.fromAssetId(2);
      const labelsLayer = await IonImageryProvider.fromAssetId(3);

      // 🌃 Nuova texture notturna NASA (affidabile)
      const nightLayer = new UrlTemplateImageryProvider({
        url: "https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/VIIRS_CityLights_2012/default/{Time}/{TileMatrixSet}/{TileMatrix}/{TileRow}/{TileCol}.jpg",
        credit: "NASA Blue Marble Night",
        maximumLevel: 8,
      });

      viewer.imageryLayers.removeAll();
      viewer.imageryLayers.addImageryProvider(satLayer);
      viewer.imageryLayers.addImageryProvider(labelsLayer);
      const night = viewer.imageryLayers.addImageryProvider(nightLayer);
      night.alpha = 0.0;

      // ✅ Zoom limits
      const ctrl = viewer.scene.screenSpaceCameraController;
      ctrl.minimumZoomDistance = 300000;
      ctrl.maximumZoomDistance = 25000000;

      // ✅ Transizione fluida + switch Cesium/Mapbox
      viewer.scene.postRender.addEventListener(() => {
        const sun = viewer.scene.light?.direction;
        if (sun) {
          const targetAlpha = Math.max(0, 1 - sun.z);
          night.alpha += (targetAlpha * 0.9 - night.alpha) * 0.05;
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

      // ✅ Mapbox base
      map = new mapboxgl.Map({
        container: mapboxRef.current!,
        style: "mapbox://styles/mapbox/satellite-streets-v12",
        center: [12.5, 41.9],
        zoom: 4.5,
        pitch: 45,
        bearing: 0,
        antialias: true,
      });

      // 🖥️ Schermo intero condiviso
      const fullBtn = document.createElement("button");
      fullBtn.innerText = "⛶";
      Object.assign(fullBtn.style, {
        position: "absolute",
        bottom: "20px",
        right: "20px",
        fontSize: "20px",
        background: "rgba(20,20,25,0.8)",
        color: "#fff",
        border: "none",
        borderRadius: "6px",
        padding: "5px 10px",
        cursor: "pointer",
        zIndex: "1000",
      });
      fullBtn.onclick = () => {
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen();
        } else {
          document.exitFullscreen();
        }
      };
      document.body.appendChild(fullBtn);

      // ✅ Barra di ricerca
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

      // ✅ Stile (satellite / ibrido)
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

      // ✅ Vista (Globo ↔ Atlante)
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
          viewer.scene.morphTo2D(1.5);
        } else {
          viewer.scene.morphTo3D(1.5);
        }
      });

      console.log("🌍 Atlas Eye Hybrid Ultra+ attivo");
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
// ⬆️ FINE BLOCCO 11.4
