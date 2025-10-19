// ⬇️ BLOCCO 11.2 — Atlas Eye Hybrid Pro (Ricerca + Stile + Luci notturne)
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
      } = CesiumEngine;
      const { Viewer } = CesiumWidgets;

      (window as any).CESIUM_BASE_URL = "/cesium";
      Ion.defaultAccessToken = process.env.NEXT_PUBLIC_CESIUM_TOKEN || "";
      mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";

      // ✅ Cesium
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

      // ✅ Layers Cesium
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

      // ✅ Zoom limits (no troppo vicino o troppo lontano)
      const ctrl = viewer.scene.screenSpaceCameraController;
      ctrl.minimumZoomDistance = 300000;
      ctrl.maximumZoomDistance = 25000000;

      // ✅ Dynamic blending notte/giorno
      viewer.scene.postRender.addEventListener(() => {
        const sun = viewer.scene.light?.direction;
        if (sun) {
          const factor = Math.max(0, 1 - sun.z);
          night.alpha = factor * 0.9; // 🌃 città che si accendono
        }

        const h = viewer.camera.positionCartographic.height;
        const cesium = cesiumRef.current!;
        const mapbox = mapboxRef.current!;
        cesium.style.display = h < 300000 ? "none" : "block";
        mapbox.style.display = h < 300000 ? "block" : "none";
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
      map.addControl(new mapboxgl.ScaleControl());
      mapboxRef.current!.style.display = "none";

      // ✅ 🔍 Barra di ricerca universale
      const searchBox = document.createElement("input");
      searchBox.type = "text";
      searchBox.placeholder = "Cerca un luogo...";
      Object.assign(searchBox.style, {
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
      document.body.appendChild(searchBox);

      searchBox.addEventListener("keydown", async (e) => {
        if (e.key === "Enter") {
          const query = searchBox.value.trim();
          if (!query) return;
          const resp = await fetch(
            `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
              query
            )}.json?access_token=${mapboxgl.accessToken}`
          );
          const data = await resp.json();
          const place = data.features?.[0];
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

      // ✅ 🗺 Selettore stile
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
        userSelect: "none",
      });
      styleBox.innerHTML = `
        <b>Stile:</b>
        <select id="mapStyle" style="margin-left:6px;padding:2px 5px;border-radius:6px;background:#111;color:#fff;">
          <option value="satellite">Satellite</option>
          <option value="road">Cartina</option>
          <option value="hybrid">Ibrida</option>
        </select>
      `;
      document.body.appendChild(styleBox);

      const styleSelect = document.getElementById("mapStyle") as HTMLSelectElement;
      styleSelect.addEventListener("change", async () => {
        const val = styleSelect.value;
        viewer.imageryLayers.removeAll();
        if (val === "satellite") {
          viewer.imageryLayers.addImageryProvider(satLayer);
        } else if (val === "road") {
          const osm = new UrlTemplateImageryProvider({
            url: "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
            credit: "© OpenStreetMap",
          });
          viewer.imageryLayers.addImageryProvider(osm);
        } else {
          viewer.imageryLayers.addImageryProvider(satLayer);
          viewer.imageryLayers.addImageryProvider(labelsLayer);
        }
        viewer.imageryLayers.addImageryProvider(nightLayer);

        map.setStyle(
          val === "satellite"
            ? "mapbox://styles/mapbox/satellite-v9"
            : val === "road"
            ? "mapbox://styles/mapbox/streets-v12"
            : "mapbox://styles/mapbox/satellite-streets-v12"
        );
      });

      console.log("🌍 Atlas Eye Hybrid Pro attivo.");
    };

    init();

    return () => {
      if (viewer && !viewer.isDestroyed()) viewer.destroy();
      if (map) map.remove();
    };
  }, []);

  return (
    <div style={{ width: "100vw", height: "100vh", overflow: "hidden" }}>
      <div
        id="cesiumContainer"
        ref={cesiumRef}
        style={{ position: "absolute", inset: 0 }}
      />
      <div
        id="mapboxContainer"
        ref={mapboxRef}
        style={{ position: "absolute", inset: 0 }}
      />
    </div>
  );
}
// ⬆️ FINE BLOCCO 11.2
