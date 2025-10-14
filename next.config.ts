// ⬇️ BLOCCO 5.7.2 — Configurazione compatibile Cesium + Next 15
import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  webpack: (config, { isServer }) => {
    // 📦 Aggiunge alias per Cesium (evita /ROOT/…)
    config.resolve.alias = {
      ...config.resolve.alias,
      cesium: path.resolve(__dirname, "node_modules/cesium/Source"),
    };

    // 🚫 Disabilita moduli Node non disponibili lato client
    config.resolve.fallback = {
      fs: false,
      path: false,
      http: false,
      https: false,
      zlib: false,
    };

    // 🧱 Ignora le dipendenze server-side di Cesium
    config.externals = [...(config.externals || []), "cesium"];

    // ⚙️ Disabilita Turbopack e forza Webpack su Next 15
    config.experiments = { ...config.experiments, topLevelAwait: true };

    return config;
  },

  // 🚀 Per sicurezza, assicura il rendering solo client
  experimental: {
    serverComponentsExternalPackages: ["cesium"],
  },
};

export default nextConfig;
// ⬆️ FINE BLOCCO 5.7.2
