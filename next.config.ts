import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // TEMPORARIAMENTE REMOVIDO: basePath será adicionado depois que funcionar sem ele
  // basePath: "/links",
  
  // Evita redirects automáticos relacionados a trailing slashes que podem causar loops
  trailingSlash: false,
  
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cieqpmtoewwsiiuxmqes.supabase.co",
      },
    ],
  },
};

export default nextConfig;

