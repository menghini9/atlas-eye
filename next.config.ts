// ⬇️ BLOCCO 5.7.2 — Configurazione Cesium aggiornata per Next 15.5
import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // ✅ Gestione Webpack per compatibilità Cesium
  webpack: (config, { isServer }) => {
    // 📦 Alias per Cesium — corregge percorsi assoluti tipo /ROOT/...
    config.resolve.alias = {
      ...config.resolve.alias,
      cesium: path.resolve(__dirname, "node_modules/cesium/Source"),
    };

    // 🚫 Disabilita moduli Node non utilizzabili lato client
    config.resolve.fallback = {
      fs: false,
      path: false,
      http: false,
      https: false,
      zlib: false,
      url: false,
    };

    // 🧱 Esclude Cesium dalle build server-side
    config.externals = [...(config.externals || []), "cesium"];

    // ⚙️ Abilita top-level await (necessario per Cesium)
    config.experiments = {
      ...config.experiments,
      topLevelAwait: true,
    };

    return config;
  },

  // 🚀 Permette a Cesium di essere importato correttamente lato client
  serverExternalPackages: ["cesium"],

  // 🌐 Reindirizzamento automatico base (opzionale, se vuoi mantenerlo)
async redirects() {
  return [
    {
      source: "/",
      destination: "/profile", // oppure /map se vuoi che apra subito la mappa
      permanent: false,
    },
  ];
},

};

export default nextConfig;
// ⬆️ FINE BLOCCO 5.7.2
