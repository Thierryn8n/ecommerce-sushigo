/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Desabilitar Turbopack para evitar problemas de resolução de módulos
  turbopack: false,
}

export default nextConfig
