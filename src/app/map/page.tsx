// ⬇️ BLOCCO 11.9 — Atlas Eye Real Hybrid (Atlante fissa + Fullscreen + Luci)
"use client";

import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";

export default function MapPage() {
  const cesiumRef = useRef<HTMLDivElement>(null);
  const mapboxRef = useRef<HTMLDivElement>(null);
  const uiRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let viewer: any = null;
    let map: any = null;

    const init = async () => {
      // ✅ Loader Cesium dinamico e compatibile Next.js
      let Cesium: any;
      try {
        if (typeof window !== "undefined") {
          if (!(window as any).Cesium) {
            await new Promise((resolve, reject) => {
              const script = document.createElement("script");
              script.src = "/cesium/Cesium.js";
              script.async = true;
              script.onload = () => resolve(true);
              script.onerror = (e) => reject(e);
              document.head.appendChild(script);
            });
            console.log("🛰 Cesium.js caricato dinamicamente nel browser");
          }
          Cesium = (window as any).Cesium;
          console.log("Cesium importato correttamente:", !!Cesium?.Viewer);
        } else {
          const mod = await import("cesium");
          Cesium = (mod as any).Viewer ? mod : (mod as any).default ?? mod;
          console.log("Cesium importato lato server:", !!Cesium?.Viewer);
        }
      } catch (err) {
        console.error("❌ Errore durante l’importazione di Cesium:", err);
        Cesium = {};
      }

      // ✅ Configurazioni base
      (window as any).CESIUM_BASE_URL = "/cesium";
      Cesium.Ion.defaultAccessToken = process.env.NEXT_PUBLIC_CESIUM_TOKEN || "";
      mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";

      // ✅ Crea il viewer Cesium
      viewer = new Cesium.Viewer(cesiumRef.current!, {
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
        terrainProvider: await Cesium.createWorldTerrainAsync(),
      });

      // ✅ Aspetto scena
      viewer.scene.skyAtmosphere = new Cesium.SkyAtmosphere();
      viewer.scene.backgroundColor = Cesium.Color.BLACK;
      viewer.scene.globe.enableLighting = true;
      viewer.scene.globe.depthTestAgainstTerrain = true;

      // ✅ Layer principali (satellite + etichette)
      const sat = await Cesium.IonImageryProvider.fromAssetId(2);
      const labels = await Cesium.IonImageryProvider.fromAssetId(3);
      viewer.imageryLayers.removeAll();
      viewer.imageryLayers.addImageryProvider(sat);
      viewer.imageryLayers.addImageryProvider(labels);

      // 🌃 Luci urbane (NASA)
      setTimeout(() => {
        const night = new Cesium.UrlTemplateImageryProvider({
          url: "https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/VIIRS_CityLights_2012/default/2012-01-01/GoogleMapsCompatible_Level9/{z}/{y}/{x}.jpg",
          credit: "NASA City Lights",
        });
        const nightLayer = viewer.imageryLayers.addImageryProvider(night);
        nightLayer.alpha = 0.35;
      }, 800);

      // ✅ Limiti zoom
      const ctrl = viewer.scene.screenSpaceCameraController;
      ctrl.minimumZoomDistance = 300000;
      ctrl.maximumZoomDistance = 20000000;

      // ✅ Volo iniziale
      viewer.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(12.5, 41.9, 2500000),
        duration: 2,
      });

      // ✅ Mapbox per viste ravvicinate
      map = new mapboxgl.Map({
        container: mapboxRef.current!,
        style: "mapbox://styles/mapbox/satellite-streets-v12",
        center: [12.5, 41.9],
        zoom: 4.5,
        pitch: 45,
        bearing: 0,
        antialias: true,
      });

      // 🔄 Transizione Cesium ↔ Mapbox
      viewer.scene.postRender.addEventListener(() => {
        const h = viewer.camera.positionCartographic.height;
        if (cesiumRef.current && mapboxRef.current) {
          cesiumRef.current.style.display = h < 400000 ? "none" : "block";
          mapboxRef.current.style.display = h < 400000 ? "block" : "none";
        }
      });

      // ✅ Interfaccia utente
      const ui = uiRef.current!;
      ui.innerHTML = `
        <div id="atlas-ui" style="
          position:absolute;top:0;left:0;right:0;
          padding:20px;
          display:flex;justify-content:space-between;align-items:start;
          z-index:1000;">
          <div style="display:flex;gap:10px">
            <div style="background:rgba(10,10,20,0.8);padding:6px 10px;border-radius:8px;color:white;">
              <b>Vista:</b>
              <select id="viewMode" style="background:#111;color:#fff;border-radius:6px;padding:2px 5px;">
                <option value="globe" selected>Globo</option>
                <option value="flat">Atlante</option>
              </select>
            </div>
          </div>

          <input id="search" placeholder="Cerca luogo..." 
            style="padding:8px 14px;border-radius:8px;border:1px solid #555;width:280px;background:rgba(15,15,20,0.8);color:white;"/>

          <div style="display:flex;gap:10px">
            <div style="background:rgba(10,10,20,0.8);padding:6px 10px;border-radius:8px;color:white;">
              <b>Stile:</b>
              <select id="styleMode" style="background:#111;color:#fff;border-radius:6px;padding:2px 5px;">
                <option value="satellite">Satellite</option>
                <option value="hybrid" selected>Ibrida</option>
              </select>
            </div>
            <button id="fullscreen" style="
              background:rgba(20,20,25,0.9);
              color:white;
              border:none;
              border-radius:6px;
              padding:6px 10px;
              font-size:16px;
              cursor:pointer;">⛶</button>
          </div>
        </div>
      `;

      // ⛶ Schermo intero
      const fs = ui.querySelector("#fullscreen")!;
      fs.addEventListener("click", () => {
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen();
        } else {
          document.exitFullscreen();
        }
      });

      // 🌍 Cambio vista (Globo ↔ Atlante)
      const viewSel = ui.querySelector("#viewMode")!;
      viewSel.addEventListener("change", (e: any) => {
        const mode = e.target.value;
        const ctrl = viewer.scene.screenSpaceCameraController;

        if (mode === "flat") {
          console.log("🗺 Passaggio a vista Atlante (2D)");
          viewer.scene.morphTo2D(1.5);
          viewer.camera.flyHome(0);

          ctrl.enableRotate = false;
          ctrl.enableTilt = false;
          ctrl.enableTranslate = false;
          ctrl.enableZoom = true;

          ctrl.minimumZoomDistance = 700000;
          ctrl.maximumZoomDistance = 15000000;

          viewer.scene.mapProjection = new Cesium.WebMercatorProjection();
          viewer.camera.setView({
            destination: Cesium.Rectangle.fromDegrees(-180, -85, 180, 85),
          });

          viewer.scene.skyAtmosphere.show = false;
          viewer.scene.backgroundColor = Cesium.Color.BLACK;
          console.log("✅ Modalità Atlante attiva: fissa e zoomabile");
        } else {
          console.log("🌍 Passaggio a vista Globo (3D)");
          viewer.scene.morphTo3D(1.5);

          ctrl.enableRotate = true;
          ctrl.enableTilt = true;
          ctrl.enableTranslate = true;
          ctrl.enableZoom = true;

          ctrl.minimumZoomDistance = 300000;
          ctrl.maximumZoomDistance = 20000000;

          viewer.scene.skyAtmosphere.show = true;
          viewer.scene.backgroundColor = Cesium.Color.BLACK;
          console.log("✅ Modalità Globo ripristinata");
        }
      });

      // 🗺️ Cambio stile
      const styleSel = ui.querySelector("#styleMode")!;
      styleSel.addEventListener("change", (e: any) => {
        const v = e.target.value;
        viewer.imageryLayers.removeAll();
        viewer.imageryLayers.addImageryProvider(sat);
        if (v === "hybrid") viewer.imageryLayers.addImageryProvider(labels);
      });

      // 🔍 Ricerca Mapbox
      const search = ui.querySelector("#search")! as HTMLInputElement;
      search.addEventListener("keydown", async (e: any) => {
        if (e.key === "Enter") {
          const q = search.value.trim();
          if (!q) return;
          const r = await fetch(
            `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(q)}.json?access_token=${mapboxgl.accessToken}`
          );
          const d = await r.json();
          const p = d.features?.[0];
          if (!p) return;
          const [lon, lat] = p.center;
          if (mapboxRef.current!.style.display === "block") {
            map.flyTo({ center: [lon, lat], zoom: 6 });
          } else {
            viewer.camera.flyTo({
              destination: Cesium.Cartesian3.fromDegrees(lon, lat, 1000000),
              duration: 2,
            });
          }
        }
      });
    };

    init();
  }, []);

  return (
    <div style={{ width: "100vw", height: "100vh", overflow: "hidden" }}>
      <div ref={cesiumRef} style={{ position: "absolute", inset: 0 }} />
      <div ref={mapboxRef} style={{ position: "absolute", inset: 0, display: "none" }} />
      <div ref={uiRef} />
    </div>
  );
}
// ⬆️ FINE BLOCCO 11.9
