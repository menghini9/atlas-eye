// ⬇️ BLOCCO 12.2 — Atlas Eye (Full Performance + Overlay + Precaricamento + Fix Esri)
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

    const ENTER_MAPBOX_H = 350_000;
    const EXIT_MAPBOX_H = 450_000;
    let inMapbox = false;
    let switching = false;

    // ⚡️ Overlay immediato (prima che parta tutto)
    const overlay = document.createElement("div");
    overlay.id = "atlas-loader";
    overlay.style.cssText =
      "position:fixed;inset:0;display:grid;place-items:center;background:#000;" +
      "color:#fff;font:600 16px system-ui;letter-spacing:.5px;z-index:9999;opacity:1;transition:opacity .5s;";
    overlay.innerHTML = `<div style='text-align:center'>
        <div style="font-size:18px;margin-bottom:8px;">🛰️ Atlas Eye</div>
        <div style="font-size:13px;">Caricamento in corso...</div>
      </div>`;
    document.body.appendChild(overlay);

    const init = async () => {
      // ✅ Token caricati da localStorage se disponibili
      const mapToken =
        localStorage.getItem("mapbox_token") || process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";
      const cesiumToken =
        localStorage.getItem("cesium_token") || process.env.NEXT_PUBLIC_CESIUM_TOKEN || "";
      mapboxgl.accessToken = mapToken;

      // ✅ Caricamento Cesium.js (se non già in cache)
      let Cesium: any;
      try {
        if (typeof window !== "undefined") {
          if (!(window as any).Cesium) {
            await new Promise((resolve, reject) => {
              const s = document.createElement("script");
              s.src = "/cesium/Cesium.js";
              s.async = true;
              s.onload = () => resolve(true);
              s.onerror = reject;
              document.head.appendChild(s);
            });
            console.log("🛰 Cesium.js caricato");
          }
          Cesium = (window as any).Cesium;
        } else {
          const mod = await import("cesium");
          Cesium = mod.default ?? mod;
        }
      } catch (err) {
        console.error("❌ Errore Cesium:", err);
        return;
      }

      (window as any).CESIUM_BASE_URL = "/cesium";
      Cesium.Ion.defaultAccessToken = cesiumToken;

      // ✅ Viewer Cesium (ottimizzato)
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
        requestRenderMode: true,
        targetFrameRate: 60,
      });

      viewer.scene.backgroundColor = Cesium.Color.BLACK;
      viewer.scene.skyAtmosphere = new Cesium.SkyAtmosphere();
      viewer.scene.globe.enableLighting = true;
      viewer.scene.globe.depthTestAgainstTerrain = true;
      viewer.scene.globe.showGroundAtmosphere = false; // ⚡ ottimizzazione

      // ✅ Layer base + labels
      const sat = await Cesium.IonImageryProvider.fromAssetId(2);
      const labels = await Cesium.IonImageryProvider.fromAssetId(3);
      viewer.imageryLayers.removeAll();
      viewer.imageryLayers.addImageryProvider(sat);
      const labelsLayer = viewer.imageryLayers.addImageryProvider(labels);

      // 🌃 Luci urbane dinamiche (fix Esri)
      const nightProvider = new Cesium.UrlTemplateImageryProvider({
        url: "https://tiles.arcgis.com/tiles/P3ePLMYs2RVChkJx/arcgis/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        credit: "Esri World Imagery (night simulation)",
      });
      const nightLayer = viewer.imageryLayers.addImageryProvider(nightProvider);
      nightLayer.alpha = 0.0;
      let lightsOn = true;

      viewer.scene.postRender.addEventListener(() => {
        try {
          if (!lightsOn) {
            nightLayer.alpha = 0;
            return;
          }
          const sun = Cesium.Simon1994PlanetaryPositions.computeSunPosition(Cesium.JulianDate.now());
          const camera = viewer.scene.camera.positionWC;
          const dot = Cesium.Cartesian3.dot(
            Cesium.Cartesian3.normalize(sun, new Cesium.Cartesian3()),
            Cesium.Cartesian3.normalize(camera, new Cesium.Cartesian3())
          );
          const brightness = Math.max(0, Math.min(1, (0.2 - dot) * 2));
          nightLayer.alpha = brightness * 0.7;
        } catch {}
      });

      // ✅ Limiti zoom 3D
      const ctrl = viewer.scene.screenSpaceCameraController;
      ctrl.minimumZoomDistance = 300_000;
      ctrl.maximumZoomDistance = 20_000_000;

      // ✅ Avvio immediato
      await new Promise((resolve) => {
  const checkReady = () => {
    if (viewer.scene.globe.tilesLoaded) resolve(true);
    else requestAnimationFrame(checkReady);
  };
  checkReady();
});

      viewer.camera.setView({
        destination: Cesium.Cartesian3.fromDegrees(12.5, 41.9, 2_500_000),
      });

      // ✅ Mapbox
      map = new mapboxgl.Map({
        container: mapboxRef.current!,
        style: "mapbox://styles/mapbox/satellite-streets-v12",
        center: [12.5, 41.9],
        zoom: 4.5,
        pitch: 45,
        bearing: 0,
      });
      mapboxRef.current!.style.display = "none";

      // 🔄 Switch Cesium ↔ Mapbox
      let raf: number;
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
        raf = requestAnimationFrame(watchHeight);
      };
      raf = requestAnimationFrame(watchHeight);

      // ✅ UI
      const ui = uiRef.current!;
      ui.innerHTML = `
        <div id="atlas-ui" style="position:absolute;top:0;left:0;right:0;padding:20px;
          display:flex;justify-content:space-between;align-items:flex-start;z-index:1000;">
          <div style="display:flex;gap:10px;align-items:center;">
            <div style="background:rgba(10,10,20,0.8);padding:6px 10px;border-radius:8px;color:white;">
              <b>Vista:</b>
              <select id="viewMode" style="background:#111;color:#fff;border-radius:6px;padding:2px 5px;">
                <option value="globe" selected>Globo</option>
                <option value="flat">Atlante</option>
              </select>
            </div>
            <button id="lights" title="Luci urbane" style="background:rgba(25,25,30,0.9);
              color:#ffb400;border:none;border-radius:6px;padding:6px 10px;font-size:16px;cursor:pointer;">🌓</button>
            <button id="help" title="Aiuto" style="background:rgba(20,20,25,0.9);
              color:#fff;border:none;border-radius:6px;padding:6px 10px;font-size:16px;cursor:pointer;">?</button>
          </div>
          <input id="search" placeholder="Cerca luogo..." style="padding:8px 14px;border-radius:8px;
            border:1px solid #555;width:280px;background:rgba(15,15,20,0.86);color:white;"/>
          <div style="display:flex;gap:10px;align-items:center;">
            <div style="background:rgba(10,10,20,0.8);padding:6px 10px;border-radius:8px;color:white;">
              <b>Stile:</b>
              <select id="styleMode" style="background:#111;color:#fff;border-radius:6px;padding:2px 5px;">
                <option value="satellite">Satellite</option>
                <option value="hybrid" selected>Ibrida</option>
              </select>
            </div>
            <button id="fullscreen" style="background:rgba(20,20,25,0.9);color:white;border:none;border-radius:6px;
              padding:6px 10px;font-size:16px;cursor:pointer;">⛶</button>
          </div>
        </div>
        <div id="helpPanel" style="position:absolute;top:64px;left:20px;max-width:360px;
          background:rgba(10,10,15,0.95);color:#fff;border:1px solid #333;border-radius:10px;
          padding:12px 14px;z-index:1001;display:none;font-size:14px;line-height:1.45;">
          <b>Istruzioni</b><br/>
          • Zoom: rotellina / touch / <b>↑</b>=in, <b>↓</b>=out, <b>+</b>/<b>-</b>.<br/>
          • Atlante: vista globale fissa, solo zoom.<br/>
          • Globo: movimento libero, inclinazione, rotazione.<br/>
          • 🌓: attiva/disattiva luci urbane dinamiche.<br/>
          • Ricerca: digita e scegli un luogo.
        </div>
      `;

      const helpPanel = ui.querySelector<HTMLDivElement>("#helpPanel")!;
      ui.querySelector<HTMLButtonElement>("#help")!.onclick = () => {
        helpPanel.style.display = helpPanel.style.display === "none" ? "block" : "none";
      };
      ui.querySelector<HTMLButtonElement>("#fullscreen")!.onclick = () => {
        if (!document.fullscreenElement) document.documentElement.requestFullscreen();
        else document.exitFullscreen();
      };
      ui.querySelector<HTMLButtonElement>("#lights")!.onclick = () => {
        lightsOn = !lightsOn;
        nightLayer.alpha = lightsOn ? 0.7 : 0.0;
      };

      // ✅ Ricerca + Zoom tastiera (invariati)
      const search = ui.querySelector("#search")! as HTMLInputElement;
      const suggestions = document.createElement("div");
      suggestions.id = "suggestions";
      suggestions.style.cssText = `
        position:absolute;top:60px;left:50%;transform:translateX(-50%);
        background:rgba(10,10,15,0.95);border:1px solid #333;border-radius:8px;
        width:280px;max-height:220px;overflow-y:auto;z-index:1001;color:white;font-size:14px;display:none;`;
      ui.appendChild(suggestions);

      async function showSuggestions(q: string) {
        if (!q.trim()) return (suggestions.style.display = "none");
        const r = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(q)}.json?access_token=${mapboxgl.accessToken}&autocomplete=true&limit=5`
        );
        const d = await r.json();
        const feats = d.features || [];
        if (!feats.length) return (suggestions.style.display = "none");
        suggestions.innerHTML = feats
          .map(
            (f: any) =>
              `<div class="suggestion" data-coords='${JSON.stringify(f.center)}'
               style="padding:6px 10px;border-bottom:1px solid rgba(255,255,255,0.1);cursor:pointer;">
               ${f.place_name}</div>`
          )
          .join("");
        suggestions.style.display = "block";
        suggestions.querySelectorAll(".suggestion").forEach((el) =>
          el.addEventListener("click", (ev) => {
            const coords = JSON.parse((ev.target as HTMLElement).dataset.coords!);
            const [lon, lat] = coords;
            if (inMapbox && map) map.flyTo({ center: [lon, lat], zoom: 6 });
            else
              viewer.camera.flyTo({
                destination: Cesium.Cartesian3.fromDegrees(lon, lat, 1_000_000),
                duration: 1.5,
              });
            search.value = (ev.target as HTMLElement).textContent || "";
            suggestions.style.display = "none";
          })
        );
      }
      let typing: any;
      search.oninput = (e: any) => {
        clearTimeout(typing);
        typing = setTimeout(() => showSuggestions(e.target.value), 250);
      };
      document.addEventListener("click", (e) => {
        if (
          !(e.target as HTMLElement).closest("#search") &&
          !(e.target as HTMLElement).closest("#suggestions")
        )
          suggestions.style.display = "none";
      });

      // ⌨️ Zoom tastiera
      const keyZoom = (dir: "in" | "out") => {
        const h = viewer.camera.positionCartographic.height;
        const step = dir === "in" ? -400_000 : 400_000;
        const newH = Cesium.Math.clamp(
          h + step,
          ctrl.minimumZoomDistance,
          ctrl.maximumZoomDistance
        );
        viewer.camera.moveForward(h - newH);
      };
      window.addEventListener("keydown", (e) => {
        if (["ArrowUp", "+"].includes(e.key)) keyZoom("in");
        if (["ArrowDown", "-"].includes(e.key)) keyZoom("out");
      });

      // 🟢 Fine overlay
      overlay.style.opacity = "0";
      setTimeout(() => overlay.remove(), 700);

      // Cleanup
      return () => {
        if (map) map.remove();
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
// ⬆️ FINE BLOCCO 12.2  questo è il codice attuale