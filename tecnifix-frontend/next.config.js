/** @type {import('next').NextConfig} */
// Configuración de Next.js. Se amplía aquí si se necesitan rewrites,
// imágenes externas, variables públicas adicionales, etc.
const nextConfig = {
  reactStrictMode: true,
  // Las fotos del catálogo de la tienda se piden a Unsplash ya redimensionadas.
  images: {
    loader: 'custom',
    loaderFile: './src/lib/cargador-imagenes.js',
  },
};

module.exports = nextConfig;
