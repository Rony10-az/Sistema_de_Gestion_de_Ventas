// robots.txt: TecniFix es un sistema interno, así que ningún buscador debe indexarlo.

export default function robots() {
  return {
    rules: { userAgent: '*', disallow: '/' },
  };
}
