// ⬇️ BLOCCO 11.1 — Atlas Eye Hybrid View (Cesium + Mapbox)
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
      try {
        // ✅ Import Cesium dinamico
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

        // ✅ Token
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
          creditContainer: document.createElement("div"), // niente watermark
          scene3DOnly: true,
          terrainProvider: await createWorldTerrainAsync(),
        });

        // ✅ Imposta atmosfera e luce
        viewer.scene.skyAtmosphere = new SkyAtmosphere();
        viewer.scene.backgroundColor = Color.BLACK;
        viewer.scene.globe.enableLighting = true;
        viewer.scene.light = new SunLight();

        // ✅ Layer base Ion
        const satelliteLayer = await IonImageryProvider.fromAssetId(2);
        viewer.imageryLayers.removeAll();
        viewer.imageryLayers.addImageryProvider(satelliteLayer);

        // ✅ Layer confini e toponimi
        const labelsLayer = await IonImageryProvider.fromAssetId(3);
        viewer.imageryLayers.addImageryProvider(labelsLayer);

        // ✅ Layer notturno (NASA Night)
        const nightLayer = new UrlTemplateImageryProvider({
          url: "https://tiles.arcgis.com/tiles/qHLhCfIG1z3XJ1Yk/arcgis/rest/services/Earth_at_Night/MapServer/tile/{z}/{y}/{x}",
          credit: "NASA Earth at Night",
        });
        const addedNightLayer = viewer.imageryLayers.addImageryProvider(nightLayer);
        addedNightLayer.alpha = 0.0;

        // ✅ Limiti di zoom Cesium (sia verso il basso che verso l'alto)
        const controller = viewer.scene.screenSpaceCameraController;
        controller.minimumZoomDistance = 300000;   // non più vicino di 300 km
        controller.maximumZoomDistance = 25000000; // non più lontano di ~25.000 km

        // ✅ Blend dinamico giorno/notte
        viewer.scene.postRender.addEventListener(() => {
          const sun = viewer.scene.light?.direction;
          if (sun) {
            const nightFactor = Math.max(0, 1 - sun.z);
            addedNightLayer.alpha = nightFactor * 0.8;
          }

          // Gestione switch Mapbox/Cesium
          const height = viewer.camera.positionCartographic.height;
          const cesiumCanvas = cesiumRef.current!;
          const mapboxCanvas = mapboxRef.current!;

          if (height < 300000) {
            cesiumCanvas.style.display = "none";
            mapboxCanvas.style.display = "block";
          } else {
            cesiumCanvas.style.display = "block";
            mapboxCanvas.style.display = "none";
          }
        });

        // ✅ Vista iniziale sull'Europa
        viewer.camera.flyTo({
          destination: Cartesian3.fromDegrees(12.5, 41.9, 2500000),
          duration: 2.5,
        });

        // ✅ Inizializza Mapbox (nascosto di default)
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

        // Nascondi Mapbox all'avvio
        mapboxRef.current!.style.display = "none";

        console.log("🌍 Atlas Eye Hybrid View attiva (Cesium + Mapbox)");
      } catch (err) {
        console.error("❌ Errore inizializzazione:", err);
      }
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
// ⬆️ FINE BLOCCO 11.1
