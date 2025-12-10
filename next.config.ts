import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Configura o projeto para funcionar sob o caminho /links
  // Isso isola os assets em /links/_next/..., evitando conflito com o portfolio
  basePath: "/links",
  
  // Evita redirects automáticos que podem causar loops
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

