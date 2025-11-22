import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Configura o projeto para funcionar sob o caminho /links
  // quando acessado através do domínio principal via rewrite
  basePath: "/links",
  
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

