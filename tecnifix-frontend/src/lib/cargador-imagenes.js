'use client';

// Cargador de <Image> de Next: las fotos del catálogo vienen de Unsplash, que ya
// entrega cada tamaño optimizado (WebP/AVIF). Así no se gasta la optimización de Vercel.
// Las imágenes locales (de /public) se sirven tal cual.

export default function cargadorImagenes({ src, width, quality }) {
  if (src.startsWith('https://images.unsplash.com/')) {
    return `${src}?auto=format&fit=crop&w=${width}&q=${quality || 75}`;
  }
  return src;
}
