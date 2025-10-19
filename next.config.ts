// ⬇️ BLOCCO 8.2 — Next 15.5 + Cesium build fix stabile
import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // 🔁 Redirect iniziale (profilo o mappa)
  async redirects() {
    return [
      {
        source: "/",
        destination: "/profile", // cambia in "/map" se vuoi aprire la mappa
        permanent: false,
      },
    ];
  },

  // ⚙️ Webpack: alias e fallback per Cesium
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

  // 🚀 Opzioni Next moderne
  output: "standalone",
experimental: {
  optimizeCss: {
    inlineFonts: false,
  },
  externalDir: true,
},


  // ✅ Ignora errori di tipo/linting in build
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
};

export default nextConfig;
// ⬆️ FINE BLOCCO 8.2
