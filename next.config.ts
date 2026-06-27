import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Genera un build optimizado que copia solo los archivos necesarios de node_modules
  output: "standalone",
};
export default nextConfig;
