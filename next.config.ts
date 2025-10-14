// ⬇️ BLOCCO CORRETTO NEXT CONFIG – compatibile con Cesium
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 🔄 eventuale redirect automatico su Vercel
  async redirects() {
    return [
      {
        source: "/:path*",
        destination: "https://atlas-eye.vercel.app/:path*",
        permanent: true,
      },
    ];
  },

  // ⚙️ Fix per Cesium e altri moduli Node (fs non supportato lato client)
  webpack: (config) => {
    config.resolve.fallback = { fs: false };
    return config;
  },
};

export default nextConfig;
// ⬆️ FINE BLOCCO CORRETTO
