// next.config.ts

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true, // ✅ Disattiva controlli ESLint in deploy
  },
};

export default nextConfig;
