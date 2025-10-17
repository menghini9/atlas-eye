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
  webpack: (config, { isServer }) => {
    // 🔧 Alias: forza Cesium a puntare al build corretto (non @cesium/engine)
    config.resolve.alias = {
      ...config.resolve.alias,
      cesium: path.resolve(__dirname, "node_modules/cesium/Build/Cesium"),
    };

    // 🔒 Disattiva moduli server-side non usabili nel browser
    config.resolve.fallback = {
      fs: false,
      path: false,
      http: false,
      https: false,
      zlib: false,
    };

    // 🧱 Permette l’import dinamico con top-level await
    config.experiments = {
      ...config.experiments,
      topLevelAwait: true,
    };

    return config;
  },

  // 🧰 Esperimenti necessari per pacchetti non ESM puri (come Cesium)
  experimental: {
    serverComponentsExternalPackages: ["cesium"],
  },
};

export default nextConfig;
// ⬆️ FINE BLOCCO 5.9
