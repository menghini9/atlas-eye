// ⬇️ BLOCCO 5.7 — Atlas Eye / Cesium Reale
"use client";
import dynamic from "next/dynamic";
const { Viewer, ImageryLayer, Ion, createWorldTerrain } = require("resium");
const { UrlTemplateImageryProvider } = require("@cesium/engine");
Ion.defaultAccessToken = ""; // opzionale, se vuoi aggiungere layer Cesium

export default function MapPage() {
  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <Viewer
        full
        scene3DOnly
        baseLayerPicker={false}
        timeline={false}
        animation={false}
        terrainProvider={createWorldTerrain()}
        style={{ background: "black" }}
      >
        {/* 🌞 Texture giorno (Blue Marble) */}
        <ImageryLayer
          imageryProvider={
            new UrlTemplateImageryProvider({
              url: "https://eoimages.gsfc.nasa.gov/images/imagerecords/57000/57730/land_ocean_ice_8192.tif",
            })
          }
        />
        {/* 🌙 Texture notte (Earth at Night) */}
        <ImageryLayer
          imageryProvider={
            new UrlTemplateImageryProvider({
              url: "https://eoimages.gsfc.nasa.gov/images/imagerecords/79000/79765/earth_lights_lrg.jpg",
            })
          }
          brightness={0.4}
          alpha={0.6}
        />
      </Viewer>
    </div>
  );
}
// ⬆️ FINE BLOCCO 5.7
