import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Configura o projeto para funcionar sob o caminho /links
  // Quando acessado via rewrite externo do projeto portfolio2026,
  // o Vercel preserva o path completo (/links/...) então o basePath é necessário
  basePath: "/links",
  
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

