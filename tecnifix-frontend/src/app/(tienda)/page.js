// Portada de la tienda pública. Cada sección vive en components/tienda/inicio/.

import { Cintas } from '../../components/tienda/Cintas';
import { Asistente } from '../../components/tienda/inicio/Asistente';
import { Cadena } from '../../components/tienda/inicio/Cadena';
import { Carrusel } from '../../components/tienda/inicio/Carrusel';
import { Hero } from '../../components/tienda/inicio/Hero';
import { Cierre, MarcaPropia, Opiniones, Preguntas, Respaldo } from '../../components/tienda/inicio/Secciones';
import { PRODUCTOS } from '../../mocks/tienda.mock';

export const metadata = {
  title: 'Repuestos y accesorios tecnológicos',
  description: 'Cargadores, audífonos, SSD, memorias y repuestos con stock real. Reserva en línea y recoge en tienda.',
};

const masVendidos = [...PRODUCTOS].filter((x) => x.stock > 0).sort((a, b) => b.resenas - a.resenas).slice(0, 10);

export default function InicioTienda() {
  return (
    <>
      <Hero />
      <Cintas />
      <Asistente />
      <Cadena />
      <Carrusel
        productos={masVendidos}
        etiqueta="Lo más vendido"
        titulo={
          <>
            Lo que más se llevan <span className="texto-marca">esta semana.</span>
          </>
        }
        descripcion="Pocos productos elegidos con cuidado, no un catálogo infinito. Las fichas técnicas vienen del fabricante."
      />
      <MarcaPropia />
      <Respaldo />
      <Opiniones />
      <Preguntas />
      <Cierre />
    </>
  );
}
