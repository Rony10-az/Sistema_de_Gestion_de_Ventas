'use client';

// Ficha de producto: galería con zoom que sigue al mouse, precio, stock, cantidad y
// "Agregar al carrito". Cuando el botón principal sale de la pantalla aparece una barra
// fija abajo para comprar sin volver a subir.

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { BadgeCheck, Receipt, ShieldCheck, ShoppingBag, Store, Truck } from 'lucide-react';
import { useCarrito } from '../../context/CarritoContext';
import { formatearSoles } from '../../lib/formato';
import { cn } from '../../lib/utils';
import { categoriaPorId } from '../../mocks/tienda.mock';
import { Cantidad } from './CarritoLateral';
import { Estrellas } from './Estrellas';
import { ChipEtiqueta, ChipStock } from './TarjetaProducto';

function Galeria({ producto }) {
  const [actual, setActual] = useState(0);
  const [origen, setOrigen] = useState('50% 50%');
  const [zoom, setZoom] = useState(false);

  const mover = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    setOrigen(`${((e.clientX - r.left) / r.width) * 100}% ${((e.clientY - r.top) / r.height) * 100}%`);
  };

  return (
    <div className="flex flex-col gap-4">
      <div
        className="relative aspect-square cursor-zoom-in overflow-hidden rounded-[2rem] border border-white/[0.08] bg-black"
        onPointerMove={mover}
        onPointerEnter={(e) => e.pointerType === 'mouse' && setZoom(true)}
        onPointerLeave={() => setZoom(false)}
      >
        {producto.imagenes.map((src, i) => (
          <Image
            key={src}
            src={src}
            alt={i === actual ? producto.nombre : ''}
            fill
            priority={i === 0}
            sizes="(min-width: 1024px) 50vw, 92vw"
            className={cn(
              'object-cover transition-[opacity,transform] duration-500 ease-out',
              i === actual ? 'opacity-100' : 'opacity-0',
              producto.stock <= 0 && 'grayscale',
            )}
            style={{ transformOrigin: origen, transform: zoom && i === actual ? 'scale(1.8)' : 'scale(1)' }}
          />
        ))}
        <span className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_50%_at_50%_100%,hsl(var(--primary)/0.35),transparent)]" aria-hidden="true" />
        {producto.etiqueta && <ChipEtiqueta className="absolute left-5 top-5">{producto.etiqueta}</ChipEtiqueta>}
      </div>
      {producto.imagenes.length > 1 && (
        <div className="flex gap-3">
          {producto.imagenes.map((src, i) => (
            <button
              key={src}
              type="button"
              onClick={() => setActual(i)}
              aria-label={`Ver foto ${i + 1}`}
              aria-pressed={i === actual}
              className={cn(
                'relative size-20 overflow-hidden rounded-2xl border-2 bg-black transition-all',
                i === actual ? 'border-primary shadow-brillo' : 'border-white/10 opacity-60 hover:opacity-100',
              )}
            >
              <Image src={src} alt="" fill sizes="80px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function FichaProducto({ producto }) {
  const { agregar } = useCarrito();
  const [cantidad, setCantidad] = useState(1);
  const [barraVisible, setBarraVisible] = useState(false);
  const zonaCompra = useRef(null);
  const agotado = producto.stock <= 0;
  const categoria = categoriaPorId(producto.categoria_id);

  // La barra aparece cuando el botón principal ya quedó arriba, fuera de la pantalla.
  useEffect(() => {
    let cuadro = 0;
    const medir = () => {
      cuadro = 0;
      const el = zonaCompra.current;
      if (el) setBarraVisible(el.getBoundingClientRect().bottom < 0);
    };
    const alDesplazar = () => {
      if (!cuadro) cuadro = requestAnimationFrame(medir);
    };
    medir();
    window.addEventListener('scroll', alDesplazar, { passive: true });
    window.addEventListener('resize', alDesplazar);
    return () => {
      window.removeEventListener('scroll', alDesplazar);
      window.removeEventListener('resize', alDesplazar);
      cancelAnimationFrame(cuadro);
    };
  }, []);

  // Sube el chat y el sello flotantes mientras se ve la barra fija de compra.
  useEffect(() => {
    const raiz = document.documentElement;
    raiz.style.setProperty('--barra-compra', barraVisible && !agotado ? '4.5rem' : '0px');
    return () => raiz.style.removeProperty('--barra-compra');
  }, [barraVisible, agotado]);

  const comprar = () => agregar(producto, cantidad);

  return (
    <>
      <div className="mx-auto grid max-w-[1400px] gap-10 px-4 pb-10 pt-8 md:px-8 lg:grid-cols-[1.05fr_1fr] lg:gap-16 lg:pt-12">
        <div className="animate-aparecer lg:sticky lg:top-24 lg:self-start">
          <Galeria producto={producto} />
        </div>

        <div className="flex flex-col gap-6">
          <nav aria-label="Ruta" className="etiqueta animate-aparecer text-[0.62rem]">
            <Link href="/" className="hover:text-white">Inicio</Link> /{' '}
            <Link href={`/catalogo?categoria=${categoria.slug}`} className="hover:text-white">{categoria.nombre}</Link> /{' '}
            <span className="text-white/80">{producto.nombre}</span>
          </nav>

          <div className="flex animate-aparecer flex-col gap-4" style={{ animationDelay: '80ms' }}>
            <ChipEtiqueta className="w-fit gap-2">
              <span className="size-1.5 rounded-full bg-primary" aria-hidden="true" /> {producto.marca}
            </ChipEtiqueta>
            <h1 className="font-display text-[clamp(2rem,4vw,3.4rem)] font-semibold leading-[1.05] tracking-tight text-white">
              {producto.nombre}
            </h1>
            <Estrellas valor={producto.calificacion} resenas={producto.resenas} />
          </div>

          <div className="animate-aparecer" style={{ animationDelay: '160ms' }}>
            <p className="flex items-baseline gap-3">
              <span className="font-display text-4xl font-semibold text-white">{formatearSoles(producto.precio_venta)}</span>
              {producto.precio_anterior && (
                <>
                  <span className="text-lg text-muted-foreground line-through">{formatearSoles(producto.precio_anterior)}</span>
                  <span className="rounded-full bg-primary/15 px-2.5 py-1 font-mono text-xs text-accent-foreground">
                    −{Math.round((1 - producto.precio_venta / producto.precio_anterior) * 100)} %
                  </span>
                </>
              )}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">Incluye IGV. Boleta o factura electrónica.</p>
          </div>

          <p className="max-w-[56ch] animate-aparecer text-lg leading-relaxed text-white/80" style={{ animationDelay: '200ms' }}>
            {producto.descripcion}
          </p>

          <div ref={zonaCompra} className="flex animate-aparecer flex-col gap-4 rounded-3xl border border-white/[0.08] bg-white/[0.02] p-5" style={{ animationDelay: '240ms' }}>
            <ChipStock producto={producto} />
            {agotado ? (
              <p className="text-sm text-muted-foreground">
                Se agotó. Pregunta en tienda por la fecha de reposición o mira productos parecidos más abajo.
              </p>
            ) : (
              <div className="flex flex-wrap items-center gap-3">
                <Cantidad
                  tamano="lg"
                  valor={cantidad}
                  maximo={producto.stock}
                  nombre={producto.nombre}
                  alCambiar={(n) => setCantidad(Math.max(1, Math.min(n, producto.stock)))}
                />
                <button
                  type="button"
                  onClick={comprar}
                  className="degradado-marca inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-full px-8 font-display text-sm font-semibold uppercase tracking-[0.1em] text-white shadow-brillo transition-all hover:-translate-y-0.5 hover:shadow-brillo-fuerte active:translate-y-0 sm:flex-none"
                >
                  <ShoppingBag className="size-4" aria-hidden="true" /> Agregar al carrito
                </button>
              </div>
            )}
          </div>

          <ul className="flex animate-aparecer flex-wrap gap-2" style={{ animationDelay: '300ms' }}>
            {[
              { icono: BadgeCheck, texto: 'Original y sellado' },
              { icono: ShieldCheck, texto: producto.categoria_id === 5 ? 'Garantía de 3 a 6 meses' : 'Garantía de 6 meses' },
              { icono: Receipt, texto: 'Comprobante electrónico' },
            ].map(({ icono: Icono, texto }) => (
              <li key={texto} className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-white/85">
                <Icono className="size-4 text-accent-foreground" aria-hidden="true" /> {texto}
              </li>
            ))}
          </ul>

          <ul className="flex animate-aparecer flex-col gap-3 text-sm text-white/80" style={{ animationDelay: '340ms' }}>
            <li className="flex gap-3">
              <Store className="size-4 shrink-0 text-accent-foreground" aria-hidden="true" /> Reserva en línea y recoge hoy mismo en tienda.
            </li>
            <li className="flex gap-3">
              <Truck className="size-4 shrink-0 text-accent-foreground" aria-hidden="true" /> Envíos a todo Lima en 24 a 48 horas.
            </li>
          </ul>
        </div>
      </div>

      <div
        className={cn(
          'fixed inset-x-0 bottom-0 z-30 border-t border-white/[0.08] bg-background/85 backdrop-blur-xl transition-transform duration-500',
          barraVisible && !agotado ? 'translate-y-0' : 'translate-y-full',
        )}
        aria-hidden={!barraVisible}
      >
        <div className="mx-auto flex max-w-[1400px] items-center gap-4 px-4 py-3 md:px-8">
          <span className="relative hidden size-12 shrink-0 overflow-hidden rounded-xl bg-black sm:block">
            <Image src={producto.imagenes[0]} alt="" fill sizes="48px" className="object-cover" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-medium text-white">{producto.nombre}</span>
            <span className="font-display font-semibold text-white">{formatearSoles(producto.precio_venta)}</span>
          </span>
          <button
            type="button"
            onClick={comprar}
            tabIndex={barraVisible ? 0 : -1}
            className="degradado-marca inline-flex h-11 items-center gap-2 rounded-full px-6 font-display text-xs font-semibold uppercase tracking-[0.1em] text-white shadow-brillo"
          >
            <ShoppingBag className="size-4" aria-hidden="true" /> Agregar
          </button>
        </div>
      </div>
    </>
  );
}
