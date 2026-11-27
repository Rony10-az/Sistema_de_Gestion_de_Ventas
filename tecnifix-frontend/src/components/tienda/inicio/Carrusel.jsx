'use client';

// Carrusel horizontal de productos (lo más vendido). Se desliza con el dedo, la rueda
// o las flechas; los rombos de abajo marcan en qué parte vas.

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { Revelar } from '../Revelar';
import { TarjetaProducto } from '../TarjetaProducto';
import { EncabezadoSeccion, claseBotonBorde } from './EncabezadoSeccion';

export function Carrusel({ productos, numero = '03', etiqueta, titulo, descripcion }) {
  const pista = useRef(null);
  const [indice, setIndice] = useState(0);

  useEffect(() => {
    const el = pista.current;
    if (!el) return undefined;
    let cuadro = 0;
    const medir = () => {
      cuadro = 0;
      const ancho = el.firstElementChild?.getBoundingClientRect().width ?? 1;
      setIndice(Math.round(el.scrollLeft / (ancho + 20)));
    };
    const alDesplazar = () => {
      if (!cuadro) cuadro = requestAnimationFrame(medir);
    };
    el.addEventListener('scroll', alDesplazar, { passive: true });
    return () => {
      el.removeEventListener('scroll', alDesplazar);
      cancelAnimationFrame(cuadro);
    };
  }, []);

  const mover = (dir) => {
    const el = pista.current;
    const ancho = el?.firstElementChild?.getBoundingClientRect().width ?? 300;
    el?.scrollBy({ left: dir * (ancho + 20), behavior: 'smooth' });
  };
  const irA = (i) => {
    const el = pista.current;
    const ancho = el?.firstElementChild?.getBoundingClientRect().width ?? 300;
    el?.scrollTo({ left: i * (ancho + 20), behavior: 'smooth' });
  };

  return (
    <section className="py-24 lg:py-32">
      <div className="mx-auto max-w-[1400px] px-4 md:px-8">
        <EncabezadoSeccion
          numero={numero}
          etiqueta={etiqueta}
          titulo={titulo}
          descripcion={descripcion}
          accion={
            <Link href="/catalogo" className={claseBotonBorde}>
              Todo el catálogo <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
            </Link>
          }
        />
      </div>

      <Revelar retraso={2} className="relative mt-14">
        <ul
          ref={pista}
          className="sin-barra flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth px-[var(--g)] pb-6 pt-2 [--g:1rem] scroll-px-[var(--g)] md:[--g:2rem] xl:[--g:max(2rem,calc((100vw-1400px)/2+2rem))]"
          aria-label="Productos más vendidos"
        >
          {productos.map((x, i) => (
            <li key={x.id} className="w-[min(20rem,82vw)] shrink-0 snap-start">
              <TarjetaProducto producto={x} prioridad={i < 2} />
            </li>
          ))}
        </ul>
      </Revelar>

      <div className="mx-auto mt-6 flex max-w-[1400px] items-center justify-between gap-4 px-4 md:px-8">
        <p className="font-mono text-xs text-muted-foreground sm:hidden" aria-live="polite">
          {String(indice + 1).padStart(2, '0')} / {String(productos.length).padStart(2, '0')}
        </p>
        <div className="hidden items-center gap-1 rounded-full border border-white/10 bg-white/[0.02] px-3 py-2 sm:flex">
          {productos.map((x, i) => (
            <button
              key={x.id}
              type="button"
              onClick={() => irA(i)}
              aria-label={`Ir al producto ${i + 1}`}
              className="grid size-5 place-items-center"
            >
              <span
                className={cn(
                  'block size-2 rotate-45 border transition-all duration-300',
                  i === indice ? 'scale-125 border-transparent bg-[hsl(296_80%_62%)] shadow-[0_0_10px_hsl(var(--primary))]' : 'border-white/30',
                )}
              />
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          {[-1, 1].map((dir) => (
            <button
              key={dir}
              type="button"
              onClick={() => mover(dir)}
              aria-label={dir < 0 ? 'Anterior' : 'Siguiente'}
              className="grid size-12 place-items-center rounded-full border border-white/15 text-white transition-colors hover:border-primary/60 hover:bg-primary/10"
            >
              {dir < 0 ? <ArrowLeft className="size-4" aria-hidden="true" /> : <ArrowRight className="size-4" aria-hidden="true" />}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
