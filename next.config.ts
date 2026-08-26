import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Inlinea el CSS en el HTML en vez de servirlo como <link> aparte. Elimina el
  // recurso que bloqueaba la renderización y acorta la cadena crítica.
  // Coste medido: +16.9 KB gzip en la primera carga. Ver notas del equipo.
  experimental: {
    inlineCss: true,
  },
  // Inlinea el CSS en el HTML en vez de servirlo como <link> aparte. Elimina el
  // recurso que bloqueaba la renderización y acorta la cadena crítica (~635ms -> ~340ms).
  images: {
    unoptimized: process.env.NODE_ENV === 'development',
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 2678400, // 31 días: caché larga para las imágenes optimizadas
    remotePatterns: [
      {
        protocol: "https",
        hostname: "medusa-public-images.s3.eu-west-1.amazonaws.com",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "9000",
      },
      {
        protocol: 'https',
        hostname: 'rnhwvaurswbnnxyedzsx.supabase.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'rnhwvaurswbnnxyedzsx.storage.supabase.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
