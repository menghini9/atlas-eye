// ⬇️ BLOCCO 12.0 — Atlas Eye Real Hybrid (Atlante fissa + Fullscreen + Luci dinamiche + Help + Keyboard Zoom)
"use client";

import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";

export default function MapPage() {
  const cesiumRef = useRef<HTMLDivElement>(null);
  const mapboxRef = useRef<HTMLDivElement>(null);
  const uiRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let viewer: any = null;
    let map: mapboxgl.Map | null = null;

    // anti-glitch: isteresi per lo switch Cesium/Mapbox
    const ENTER_MAPBOX_H = 350_000;  // passa a Mapbox sotto questa quota
    const EXIT_MAPBOX_H  = 450_000;  // torna a Cesium sopra questa quota
    let inMapbox = false;
    let switching = false;

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
        }
      } catch (err) {
        console.error("❌ Errore durante l’importazione di Cesium:", err);
        Cesium = {};
      }

      // ✅ Configurazioni base
      (window as any).CESIUM_BASE_URL = "/cesium";
      Cesium.Ion.defaultAccessToken = process.env.NEXT_PUBLIC_CESIUM_TOKEN || "";
      mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";

      // ✅ Viewer Cesium
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

      // ✅ Scena
      viewer.scene.skyAtmosphere = new Cesium.SkyAtmosphere();
      viewer.scene.backgroundColor = Cesium.Color.BLACK;
      viewer.scene.globe.enableLighting = true;
      viewer.scene.globe.depthTestAgainstTerrain = true;

      // ✅ Immagini: satellite + etichette
      const sat = await Cesium.IonImageryProvider.fromAssetId(2);
      const labels = await Cesium.IonImageryProvider.fromAssetId(3);
      viewer.imageryLayers.removeAll();
      viewer.imageryLayers.addImageryProvider(sat);
      const labelsLayer = viewer.imageryLayers.addImageryProvider(labels);

      // 🌃 Luci urbane dinamiche sulla parte in ombra
      // (usa il layer VIIRS + dayAlpha=0, nightAlpha>0)
      const nightProvider = new Cesium.UrlTemplateImageryProvider({
        url: "https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/VIIRS_CityLights_2012/default/2012-01-01/GoogleMapsCompatible_Level9/{z}/{y}/{x}.jpg",
        credit: "NASA City Lights",
      });
      const nightLayer = viewer.imageryLayers.addImageryProvider(nightProvider);
      nightLayer.dayAlpha = 0.0;    // invisibile di giorno
      nightLayer.nightAlpha = 0.55; // visibile di notte
      nightLayer.brightness = 1.1;

      // ✅ Limiti zoom in 3D (Globo)
      const ctrl = viewer.scene.screenSpaceCameraController;
      ctrl.minimumZoomDistance = 300_000;
      ctrl.maximumZoomDistance = 20_000_000;

      // ✅ Volo iniziale su Europa
      viewer.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(12.5, 41.9, 2_500_000),
        duration: 1.8,
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
      mapboxRef.current!.style.display = "none";
      inMapbox = false;

      // 🔄 Switch con isteresi + antibounce
      let rafId: number | null = null;
      const watchHeight = () => {
        if (!viewer) return;
        const h = viewer.camera.positionCartographic.height;

        if (!switching) {
          if (!inMapbox && h < ENTER_MAPBOX_H) {
            switching = true;
            inMapbox = true;
            cesiumRef.current!.style.display = "none";
            mapboxRef.current!.style.display = "block";
            setTimeout(() => (switching = false), 120);
          } else if (inMapbox && h > EXIT_MAPBOX_H) {
            switching = true;
            inMapbox = false;
            mapboxRef.current!.style.display = "none";
            cesiumRef.current!.style.display = "block";
            setTimeout(() => (switching = false), 120);
          }
        }
        rafId = requestAnimationFrame(watchHeight);
      };
      rafId = requestAnimationFrame(watchHeight);

      // ✅ UI
      const ui = uiRef.current!;
      ui.innerHTML = `
        <div id="atlas-ui" style="
          position:absolute;top:0;left:0;right:0;
          padding:20px;
          display:flex;justify-content:space-between;align-items:flex-start;
          z-index:1000;">
          <div style="display:flex;gap:10px;align-items:center;">
            <div style="background:rgba(10,10,20,0.8);padding:6px 10px;border-radius:8px;color:white;">
              <b>Vista:</b>
              <select id="viewMode" style="background:#111;color:#fff;border-radius:6px;padding:2px 5px;">
                <option value="globe" selected>Globo</option>
                <option value="flat">Atlante</option>
              </select>
            </div>
            <button id="help" title="Aiuto" style="
              background:rgba(20,20,25,0.9);color:#fff;border:none;border-radius:6px;
              padding:6px 10px;font-size:16px;cursor:pointer;">?</button>
          </div>

          <input id="search" placeholder="Cerca luogo..."
            style="padding:8px 14px;border-radius:8px;border:1px solid #555;width:280px;background:rgba(15,15,20,0.86);color:white;"/>

          <div style="display:flex;gap:10px;align-items:center;">
            <div style="background:rgba(10,10,20,0.8);padding:6px 10px;border-radius:8px;color:white;">
              <b>Stile:</b>
              <select id="styleMode" style="background:#111;color:#fff;border-radius:6px;padding:2px 5px;">
                <option value="satellite">Satellite</option>
                <option value="hybrid" selected>Ibrida</option>
              </select>
            </div>
            <button id="fullscreen" style="
              background:rgba(20,20,25,0.9);color:white;border:none;border-radius:6px;
              padding:6px 10px;font-size:16px;cursor:pointer;">⛶</button>
          </div>
        </div>
        <div id="helpPanel" style="
          position:absolute;top:64px;left:20px;max-width:360px;
          background:rgba(10,10,15,0.95);color:#fff;border:1px solid #333;border-radius:10px;
          padding:12px 14px;z-index:1001;display:none;font-size:14px;line-height:1.45;">
          <b>Istruzioni</b><br/>
          • Zoom: rotellina mouse / pinch su touch / <b>↑</b>=zoom in, <b>↓</b>=zoom out, <b>+</b>/<b>-</b>.<br/>
          • Atlante: vista fissa globale, puoi solo cambiare lo zoom.<br/>
          • Globo: rotazione/inclinazione libere; passa a vista dettagliata vicino al suolo.<br/>
          • Ricerca: digita e scegli un suggerimento.
        </div>
      `;

      // ⛶ Fullscreen
      ui.querySelector<HTMLButtonElement>("#fullscreen")!.addEventListener("click", () => {
        if (!document.fullscreenElement) document.documentElement.requestFullscreen();
        else document.exitFullscreen();
      });

      // ❓ Help
      const helpBtn = ui.querySelector<HTMLButtonElement>("#help")!;
      const helpPanel = ui.querySelector<HTMLDivElement>("#helpPanel")!;
      helpBtn.addEventListener("click", () => {
        helpPanel.style.display = helpPanel.style.display === "none" ? "block" : "none";
      });

      // 🗺️ Stile
      ui.querySelector<HTMLSelectElement>("#styleMode")!.addEventListener("change", (e: any) => {
        const v = e.target.value;
        viewer.imageryLayers.remove(labelsLayer);
        if (v === "hybrid") viewer.imageryLayers.addImageryProvider(labels);
      });

      // 🔘 Cambio vista (Globo ↔ Atlante)
      ui.querySelector<HTMLSelectElement>("#viewMode")!.addEventListener("change", (e: any) => {
        const mode = e.target.value;
        const ctrl = viewer.scene.screenSpaceCameraController;

        if (mode === "flat") {
          // passa a 2D
          viewer.scene.morphTo2D(0.8);
          // quando finisce la morph, imposta la vista globale e blocca movimenti
          const once = () => {
            viewer.scene.morphComplete.removeEventListener(once);

            // vista sul mondo intero
            const world = Cesium.Rectangle.fromDegrees(-180, -85, 180, 85);
            viewer.scene.mapProjection = new Cesium.WebMercatorProjection();
            viewer.camera.setView({ destination: world });

            // blocca rotazione/inclinazione/traslazione: solo zoom
            ctrl.enableRotate = false;
            ctrl.enableTilt = false;
            ctrl.enableTranslate = false;
            ctrl.enableZoom = true;

            // zoom: massimo = mondo intero, minimo = allontanarsi
            ctrl.minimumZoomDistance = 10_000_000; // non oltre il mondo intero
            ctrl.maximumZoomDistance = 40_000_000;

            viewer.scene.skyAtmosphere.show = false;
            // non switchare a Mapbox in Atlante
            inMapbox = false;
            cesiumRef.current!.style.display = "block";
            mapboxRef.current!.style.display = "none";
          };
          viewer.scene.morphComplete.addEventListener(once);
        } else {
          // torna al globo 3D
          viewer.scene.morphTo3D(0.8);
          const once = () => {
            viewer.scene.morphComplete.removeEventListener(once);

            ctrl.enableRotate = true;
            ctrl.enableTilt = true;
            ctrl.enableTranslate = true;
            ctrl.enableZoom = true;
            ctrl.minimumZoomDistance = 300_000;
            ctrl.maximumZoomDistance = 20_000_000;

            viewer.scene.skyAtmosphere.show = true;

            viewer.camera.flyTo({
              destination: Cesium.Cartesian3.fromDegrees(12.5, 41.9, 2_500_000),
              duration: 1.2,
            });
          };
          viewer.scene.morphComplete.addEventListener(once);
        }
      });

      // 🔍 Ricerca con suggerimenti (già la usavi: la lascio identica)
      const search = ui.querySelector("#search")! as HTMLInputElement;
      const suggestions = document.createElement("div");
      suggestions.id = "suggestions";
      suggestions.style.cssText = `
        position:absolute;top:60px;left:50%;transform:translateX(-50%);
        background:rgba(10,10,15,0.95);border:1px solid #333;border-radius:8px;
        width:280px;max-height:220px;overflow-y:auto;z-index:1001;color:white;
        font-size:14px;display:none;`;
      ui.appendChild(suggestions);

      async function showSuggestions(q: string) {
        if (!q.trim()) { suggestions.style.display = "none"; return; }
        const r = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(q)}.json?access_token=${mapboxgl.accessToken}&autocomplete=true&limit=5`
        );
        const d = await r.json();
        const feats = d.features || [];
        if (!feats.length) { suggestions.style.display = "none"; return; }
        suggestions.innerHTML = feats.map(
          (f: any) => `<div class="suggestion" data-coords='${JSON.stringify(f.center)}'
              style="padding:6px 10px;border-bottom:1px solid rgba(255,255,255,0.1);cursor:pointer;">
              ${f.place_name}</div>`
        ).join("");
        suggestions.style.display = "block";
        suggestions.querySelectorAll(".suggestion").forEach((el) => {
          el.addEventListener("click", (ev) => {
            const coords = JSON.parse((ev.target as HTMLElement).dataset.coords!);
            const [lon, lat] = coords;
            if (inMapbox && map) map.flyTo({ center: [lon, lat], zoom: 6 });
            else viewer.camera.flyTo({
              destination: Cesium.Cartesian3.fromDegrees(lon, lat, 1_000_000),
              duration: 1.5,
            });
            search.value = (ev.target as HTMLElement).textContent || "";
            suggestions.style.display = "none";
          });
        });
      }
      let typingT: any;
      search.addEventListener("input", (e: any) => {
        clearTimeout(typingT);
        typingT = setTimeout(() => showSuggestions(e.target.value), 250);
      });
      document.addEventListener("click", (e) => {
        if (!(e.target as HTMLElement).closest("#search") &&
            !(e.target as HTMLElement).closest("#suggestions")) {
          suggestions.style.display = "none";
        }
      });

      // ⌨️ Zoom da tastiera (↑/↓ e +/-)
      const keyZoom = (dir: "in" | "out") => {
        if (inMapbox && map) {
          if (dir === "in") map.zoomIn({ duration: 150 });
          else map.zoomOut({ duration: 150 });
        } else {
          const step = dir === "in" ? -400_000 : 400_000; // negativo = avvicina
          viewer.camera.zoomIn(step);
        }
      };
      const onKey = (e: KeyboardEvent) => {
        if (e.key === "ArrowUp" || e.key === "+") keyZoom("in");
        if (e.key === "ArrowDown" || e.key === "-") keyZoom("out");
      };
      window.addEventListener("keydown", onKey);

      // 🧹 cleanup
      return () => {
        window.removeEventListener("keydown", onKey);
        if (rafId) cancelAnimationFrame(rafId);
        if (map) { map.remove(); map = null; }
        if (viewer && !viewer.isDestroyed()) viewer.destroy();
      };
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
// ⬆️ FINE BLOCCO 12.0
