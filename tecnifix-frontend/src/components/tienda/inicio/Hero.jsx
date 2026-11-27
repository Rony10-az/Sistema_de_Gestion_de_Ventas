// Portada: título que se descifra letra por letra, llamadas a la acción y una bóveda
// que se abre para mostrar tres productos flotando sobre pedestales de neón
// (como el hero de hodl.swiss).

import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, BadgeCheck, Receipt, Store, Search } from 'lucide-react';
import { productoPorSlug } from '../../../mocks/tienda.mock';
import { cn } from '../../../lib/utils';
import { Estrellas } from '../Estrellas';
import { TextoDescifrado } from '../TextoDescifrado';
import { EscenaBoveda } from './EscenaBoveda';

const ESCENA = [
  { slug: 'mouse-inalambrico-silencioso', etiqueta: 'Periférico', clase: 'left-[2%] top-[30%] w-[30%]', retraso: '0s' },
  { slug: 'audifonos-bluetooth-anc', etiqueta: 'Audio', clase: 'left-[34%] top-[6%] w-[34%]', retraso: '-2s', grande: true },
  { slug: 'ssd-portatil-1tb', etiqueta: 'Almacenamiento', clase: 'right-[2%] top-[34%] w-[30%]', retraso: '-4s' },
];

const CONFIANZA = [
  { icono: Receipt, texto: 'Boleta o factura electrónica' },
  { icono: BadgeCheck, texto: 'Garantía de 6 meses' },
  { icono: Store, texto: 'Recojo el mismo día' },
];

function ProductoEnEscena({ slug, etiqueta, clase, retraso, grande }) {
  const producto = productoPorSlug(slug);
  return (
    <Link
      href={`/catalogo/${slug}`}
      className={cn('group absolute flex flex-col items-center', clase)}
      aria-label={`${producto.nombre}, ${etiqueta}`}
    >
      <span className="relative block w-full">
        <span className="pedestal -bottom-[22%]" aria-hidden="true" />
        <span className="flotar relative block w-full" style={{ animationDelay: retraso }}>
          <span
            className={cn(
              'relative block aspect-square w-full overflow-hidden rounded-[1.6rem] border border-white/10 bg-black shadow-[0_30px_80px_-20px_hsl(var(--brillo)/0.55)] transition-all duration-700 group-hover:border-primary/60 group-hover:shadow-[0_30px_90px_-10px_hsl(var(--brillo)/0.9)]',
              grande && 'rounded-[2rem]',
            )}
          >
            <Image
              src={producto.imagenes[0]}
              alt=""
              fill
              priority
              sizes="(min-width: 1024px) 18rem, 33vw"
              className="object-cover transition-transform duration-1000 group-hover:scale-110"
            />
            <span className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" aria-hidden="true" />
          </span>
        </span>
      </span>
      <span className="mt-[20%] flex flex-col items-center gap-1 text-center">
        <span className="h-6 w-px bg-gradient-to-b from-transparent to-primary/80" aria-hidden="true" />
        <span className="font-mono text-[0.6rem] uppercase tracking-[0.2em] text-accent-foreground sm:text-[0.66rem]">{etiqueta}</span>
        <span className="hidden font-display text-sm font-semibold text-white sm:block">{producto.marca}</span>
      </span>
    </Link>
  );
}

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* Haces de luz y rejilla de fondo */}
      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden="true">
        <div className="absolute right-[-10%] top-[-20%] h-[50rem] w-[50rem] rounded-full bg-primary/15 blur-[120px]" />
        <div className="absolute right-[18%] top-0 h-[36rem] w-px rotate-[24deg] bg-gradient-to-b from-white/25 to-transparent" />
        <div className="absolute right-[38%] top-0 h-[30rem] w-px -rotate-[24deg] bg-gradient-to-b from-white/20 to-transparent" />
        <div className="absolute inset-0 bg-[linear-gradient(rgb(255_255_255/0.025)_1px,transparent_1px),linear-gradient(90deg,rgb(255_255_255/0.025)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(70%_60%_at_70%_40%,#000,transparent)]" />
      </div>

      <div className="mx-auto grid min-h-[calc(100dvh-7.25rem)] max-w-[1400px] items-center gap-10 px-4 pb-16 pt-10 md:px-8 lg:grid-cols-[1.02fr_1fr] lg:pb-20">
        <div className="flex flex-col gap-7">
          <p className="etiqueta inline-flex w-fit animate-aparecer items-center gap-2.5 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-[0.66rem]">
            <span className="size-1.5 animate-respirar rounded-full bg-primary" aria-hidden="true" />
            TecniFix · Repuestos y accesorios
          </p>

          <h1 className="font-display text-[clamp(2.6rem,6.4vw,5.6rem)] font-bold uppercase leading-[0.98] tracking-tight text-white">
            <TextoDescifrado texto="Tu equipo." className="block" />
            <TextoDescifrado texto="Tu repuesto." retraso={250} className="block" />
            <TextoDescifrado texto="Hoy mismo." retraso={500} className="texto-marca block" />
          </h1>

          <p className="flex animate-aparecer items-center gap-4 font-display text-xl text-accent-foreground sm:text-2xl" style={{ animationDelay: '600ms' }}>
            <span className="h-px w-10 bg-accent-foreground/60" aria-hidden="true" />
            Stock real, actualizado en cada venta.
          </p>

          <p className="max-w-[52ch] animate-aparecer text-base leading-relaxed text-muted-foreground sm:text-lg" style={{ animationDelay: '700ms' }}>
            Cargadores, audífonos, SSD, memorias y repuestos para celular y laptop. Elige en línea, reserva y recoge en tienda
            con tu comprobante electrónico.
          </p>

          <div className="flex animate-aparecer flex-wrap gap-3" style={{ animationDelay: '800ms' }}>
            <Link
              href="#asistente"
              className="degradado-marca inline-flex h-14 items-center gap-3 rounded-full px-8 font-display text-sm font-semibold uppercase tracking-[0.1em] text-white shadow-brillo transition-all hover:-translate-y-0.5 hover:shadow-brillo-fuerte active:translate-y-0"
            >
              Encontrar mi repuesto <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
            <Link
              href="/catalogo"
              className="inline-flex h-14 items-center gap-3 rounded-full border border-white/15 bg-white/[0.02] px-8 font-display text-sm font-semibold uppercase tracking-[0.1em] text-white transition-all hover:-translate-y-0.5 hover:border-primary/60"
            >
              <Search className="size-4 text-accent-foreground" aria-hidden="true" /> Ver catálogo
            </Link>
          </div>

          <div className="animate-aparecer" style={{ animationDelay: '900ms' }}>
            <Estrellas valor={4.8} className="text-white" tamano="size-4" />
            <span className="ml-3 text-sm text-muted-foreground">
              <strong className="text-white">4,8/5</strong> en reseñas de ejemplo
            </span>
          </div>

          <ul className="flex animate-aparecer flex-wrap gap-2" style={{ animationDelay: '1000ms' }}>
            {CONFIANZA.map(({ icono: Icono, texto }) => (
              <li key={texto} className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-white/85">
                <Icono className="size-4 text-accent-foreground" aria-hidden="true" />
                {texto}
              </li>
            ))}
          </ul>
        </div>

        <EscenaBoveda className="mx-auto aspect-[1.15/1] w-full max-w-[44rem]">
          <svg viewBox="0 0 200 200" className="absolute left-1/2 top-[2%] w-[62%] -translate-x-1/2 opacity-70" aria-hidden="true">
            <defs>
              <linearGradient id="hex-borde" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="hsl(296 80% 62%)" />
                <stop offset="1" stopColor="hsl(279 70% 55%)" stopOpacity="0.2" />
              </linearGradient>
            </defs>
            <polygon points="100,6 182,53 182,147 100,194 18,147 18,53" fill="hsl(296 73% 44% / 0.06)" stroke="url(#hex-borde)" strokeWidth="1.2" />
          </svg>
          {ESCENA.map((item) => (
            <ProductoEnEscena key={item.slug} {...item} />
          ))}
        </EscenaBoveda>
      </div>
    </section>
  );
}
