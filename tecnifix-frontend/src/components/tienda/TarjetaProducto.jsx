'use client';

// Tarjeta de producto del catálogo. Al pasar el mouse la tarjeta se eleva, el borde
// se ilumina y la foto se acerca. Muestra el stock real (con el stock mínimo del inventario).

import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Plus } from 'lucide-react';
import { useCarrito } from '../../context/CarritoContext';
import { formatearSoles } from '../../lib/formato';
import { cn } from '../../lib/utils';
import { categoriaPorId, estadoStock } from '../../mocks/tienda.mock';
import { Estrellas } from './Estrellas';

export function ChipEtiqueta({ children, className }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border border-primary/40 bg-black/60 px-2.5 py-1 font-mono text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-accent-foreground backdrop-blur',
        className,
      )}
    >
      {children}
    </span>
  );
}

export function ChipStock({ producto, className }) {
  const estado = estadoStock(producto);
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 font-mono text-[0.68rem] uppercase tracking-[0.12em]',
        estado.tono === 'disponible' && 'text-success',
        estado.tono === 'pocos' && 'text-warning',
        estado.tono === 'agotado' && 'text-destructive',
        className,
      )}
    >
      <span className="size-1.5 animate-respirar rounded-full bg-current" aria-hidden="true" />
      {estado.texto}
    </span>
  );
}

export function TarjetaProducto({ producto, prioridad = false, className }) {
  const { agregar } = useCarrito();
  const agotado = producto.stock <= 0;
  const enlace = `/catalogo/${producto.slug}`;

  return (
    <article
      className={cn(
        'group relative flex h-full flex-col overflow-hidden rounded-3xl border border-white/[0.08] bg-card/80 transition-all duration-500 ease-out',
        'hover:-translate-y-1.5 hover:border-primary/50 hover:shadow-[0_24px_60px_-24px_hsl(var(--brillo)/0.7)]',
        className,
      )}
    >
      <Link href={enlace} className="relative block aspect-[4/3.4] overflow-hidden bg-black" tabIndex={-1} aria-hidden="true">
        <Image
          src={producto.imagenes[0]}
          alt=""
          fill
          priority={prioridad}
          sizes="(min-width: 1280px) 22rem, (min-width: 768px) 40vw, 90vw"
          className={cn(
            'object-cover transition-transform duration-700 ease-out group-hover:scale-110',
            agotado && 'grayscale',
          )}
        />
        <span
          className="absolute inset-0 bg-[radial-gradient(70%_55%_at_50%_100%,hsl(var(--primary)/0.45),transparent)] opacity-60 transition-opacity duration-500 group-hover:opacity-100"
          aria-hidden="true"
        />
        <span className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-card to-transparent" aria-hidden="true" />
      </Link>

      <div className="absolute left-4 top-4 flex flex-wrap gap-2">
        {producto.etiqueta && <ChipEtiqueta>{producto.etiqueta}</ChipEtiqueta>}
        {agotado && <ChipEtiqueta className="border-destructive/50 text-destructive">Agotado</ChipEtiqueta>}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <p className="font-mono text-[0.65rem] uppercase tracking-[0.16em] text-accent-foreground/90">
          {producto.marca} · {categoriaPorId(producto.categoria_id)?.nombre}
        </p>
        <h3 className="font-display text-lg font-semibold leading-snug text-white">
          <Link href={enlace} className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none">
            {producto.nombre}
          </Link>
        </h3>
        <Estrellas valor={producto.calificacion} resenas={producto.resenas} />
        <p className="text-sm text-muted-foreground">{producto.resumen}</p>

        <dl className="mt-1 divide-y divide-white/[0.06] border-y border-white/[0.06] text-sm">
          {producto.ficha.slice(0, 2).map(([clave, valor]) => (
            <div key={clave} className="flex justify-between gap-4 py-2">
              <dt className="font-mono text-[0.68rem] uppercase tracking-[0.12em] text-muted-foreground">{clave}</dt>
              <dd className="text-right text-white/90">{valor}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-auto flex items-end justify-between gap-3 pt-2">
          <div>
            <ChipStock producto={producto} />
            <p className="mt-1 flex items-baseline gap-2">
              <span className="font-display text-2xl font-semibold text-white">{formatearSoles(producto.precio_venta)}</span>
              {producto.precio_anterior && (
                <span className="text-sm text-muted-foreground line-through">{formatearSoles(producto.precio_anterior)}</span>
              )}
            </p>
          </div>
          {agotado ? (
            <span className="relative z-10 inline-flex items-center gap-1 font-display text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
              Ver <ArrowRight className="size-3.5" aria-hidden="true" />
            </span>
          ) : (
            <button
              type="button"
              onClick={() => agregar(producto)}
              className="degradado-marca relative z-10 grid size-11 shrink-0 place-items-center rounded-full text-white shadow-brillo transition-transform duration-300 hover:scale-110 hover:shadow-brillo-fuerte focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-95"
              aria-label={`Agregar ${producto.nombre} al carrito`}
            >
              <Plus className="size-5" aria-hidden="true" />
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
