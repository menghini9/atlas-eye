// ⬇️ BLOCCO 1: next.config.ts completo con controllo dominio e ESLint disattivato
/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true, // ✅ Disattiva controlli ESLint durante il deploy
  },

  reactStrictMode: true, // 🔒 Attiva modalità rigorosa di React

  // 🔁 Reindirizza automaticamente qualsiasi dominio "preview" o errato
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: '(?!atlas-eye\\.vercel\\.app).*', // Tutto ciò che NON è atlas-eye.vercel.app
          },
        ],
        destination: 'https://atlas-eye.vercel.app/:path*',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
// ⬆️ FINE BLOCCO 1
