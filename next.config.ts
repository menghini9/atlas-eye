// ⬇️ BLOCCO 5.9 — Configurazione definitiva Next 15 + Cesium (Webpack compatibile)
import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // 🔁 Redirect iniziale (puoi cambiarlo in /map se vuoi aprire direttamente la mappa)
  async redirects() {
    return [
      {
        source: "/",
        destination: "/profile",
        permanent: false,
      },
    ];
  },

  // ⚙️ Configurazione Webpack: Cesium richiede alias e fallback per moduli Node
// ⚙️ Configurazione Webpack — Cesium richiede alias e fallback node
webpack: (config) => {
  config.resolve.alias = {
    ...config.resolve.alias,
    cesium: "@cesium/engine",
  };

  config.resolve.fallback = {
    fs: false,
    path: false,
    http: false,
    https: false,
    zlib: false,
  };

  return config;
},

// 🚀 Nuova sintassi Next.js 15.5+ — import pacchetti server-side ESM (come Cesium)
serverExternalPackages: ["cesium"],

// 🧱 Disabilita Turbopack (già disattivato anche via package.json)
experimental: {
  optimizeCss: true,
},

};

export default nextConfig;
// ⬆️ FINE BLOCCO 5.9
