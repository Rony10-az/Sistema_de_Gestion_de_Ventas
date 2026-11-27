// /catalogo/[slug]: ficha de un producto, "¿es para ti?" con la ficha técnica y productos relacionados.

import { notFound } from 'next/navigation';
import { Check } from 'lucide-react';
import { FichaProducto } from '../../../../components/tienda/FichaProducto';
import { Revelar } from '../../../../components/tienda/Revelar';
import { TarjetaProducto } from '../../../../components/tienda/TarjetaProducto';
import { EncabezadoSeccion } from '../../../../components/tienda/inicio/EncabezadoSeccion';
import { PRODUCTOS, categoriaPorId, productoPorSlug } from '../../../../mocks/tienda.mock';

export function generateStaticParams() {
  return PRODUCTOS.map((x) => ({ slug: x.slug }));
}

export function generateMetadata({ params }) {
  const producto = productoPorSlug(params.slug);
  return producto ? { title: producto.nombre, description: producto.resumen } : { title: 'Producto no encontrado' };
}

const PERFIL = {
  celular: 'Celulares y tablets',
  laptop: 'Laptops',
  pc: 'PC de escritorio',
  cargar: 'Cargar más rápido',
  mejorar: 'Que tu equipo vaya más rápido',
  reparar: 'Reparar en casa o en el taller',
  conectar: 'Conectar más accesorios',
  escuchar: 'Escuchar y moverte sin cables',
  trabajar: 'Trabajar o estudiar cómodo',
  jugar: 'Jugar con precisión',
};

export default function ProductoPage({ params }) {
  const producto = productoPorSlug(params.slug);
  if (!producto) notFound();

  const relacionados = PRODUCTOS.filter((x) => x.id !== producto.id && (x.categoria_id === producto.categoria_id || x.para.some((t) => producto.para.includes(t))))
    .sort((a, b) => (b.categoria_id === producto.categoria_id) - (a.categoria_id === producto.categoria_id) || b.resenas - a.resenas)
    .slice(0, 4);

  return (
    <>
      <FichaProducto producto={producto} />

      <section className="mx-auto max-w-[1400px] px-4 py-20 md:px-8 lg:py-28">
        <EncabezadoSeccion
          numero="01"
          etiqueta="De un vistazo"
          titulo={
            <>
              ¿Es para <span className="texto-marca">ti?</span>
            </>
          }
        />
        <div className="mt-12 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
          <Revelar className="vidrio flex flex-col gap-5 rounded-3xl p-7">
            <p className="etiqueta text-[0.62rem] text-accent-foreground">Para quién</p>
            <p className="text-lg leading-relaxed text-white/90">{producto.resumen}</p>
            <ul className="flex flex-col gap-3">
              {producto.para.map((t) => (
                <li key={t} className="flex items-center gap-3 text-white/85">
                  <span className="grid size-6 place-items-center rounded-full border border-primary/40 bg-primary/10">
                    <Check className="size-3.5 text-accent-foreground" aria-hidden="true" />
                  </span>
                  {PERFIL[t] ?? t}
                </li>
              ))}
            </ul>
          </Revelar>

          <Revelar retraso={1} className="vidrio overflow-hidden rounded-3xl">
            <div className="flex items-center gap-3 border-b border-white/[0.06] px-6 py-3.5">
              <span className="flex gap-1.5" aria-hidden="true">
                <i className="size-2.5 rounded-full bg-primary" />
                <i className="size-2.5 rounded-full bg-white/15" />
                <i className="size-2.5 rounded-full bg-white/15" />
              </span>
              <span className="truncate font-mono text-xs text-muted-foreground">{producto.slug}/ficha-tecnica</span>
            </div>
            <dl className="divide-y divide-white/[0.06]">
              {[...producto.ficha, ['Marca', producto.marca], ['Categoría', categoriaPorId(producto.categoria_id).nombre], ['SKU', producto.sku]].map(
                ([clave, valor]) => (
                  <div key={clave} className="grid grid-cols-[9rem_1fr] gap-4 px-6 py-4 transition-colors hover:bg-white/[0.02] sm:grid-cols-[12rem_1fr]">
                    <dt className="font-mono text-[0.7rem] uppercase tracking-[0.14em] text-muted-foreground">{clave}</dt>
                    <dd className="text-white/90">{valor}</dd>
                  </div>
                ),
              )}
            </dl>
          </Revelar>
        </div>
      </section>

      {relacionados.length > 0 && (
        <section className="mx-auto max-w-[1400px] px-4 pb-10 md:px-8">
          <EncabezadoSeccion
            numero="02"
            etiqueta="Relacionados"
            titulo={
              <>
                También te puede <span className="texto-marca">servir.</span>
              </>
            }
          />
          <ul className="mt-12 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {relacionados.map((x, i) => (
              <Revelar as="li" key={x.id} retraso={i}>
                <TarjetaProducto producto={x} />
              </Revelar>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}
