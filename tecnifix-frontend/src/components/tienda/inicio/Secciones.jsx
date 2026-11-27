// Secciones de la portada que no necesitan estado: marca propia (bento), compra con
// respaldo, opiniones, preguntas frecuentes y cierre. Las animaciones de scroll las da <Revelar>.

import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, BadgeCheck, Check, Plus, Receipt, ShieldCheck, Tag, Warehouse, Search } from 'lucide-react';
import { formatearSoles } from '../../../lib/formato';
import { PREGUNTAS, RESENAS, foto, productoPorSlug } from '../../../mocks/tienda.mock';
import { Estrellas } from '../Estrellas';
import { Contador, Revelar } from '../Revelar';
import { ChipEtiqueta } from '../TarjetaProducto';
import { EncabezadoSeccion, claseBotonBorde } from './EncabezadoSeccion';

const contenedor = 'mx-auto max-w-[1400px] px-4 md:px-8';

/* ---------- 04 · Marca propia ---------- */
export function MarcaPropia() {
  const kits = ['kit-destornilladores-64', 'kit-mantenimiento-pc'].map(productoPorSlug);

  return (
    <section className="py-24 lg:py-32">
      <div className={contenedor}>
        <EncabezadoSeccion
          numero="04"
          etiqueta="Hecho en nuestro taller"
          titulo={
            <>
              Lo que solo encuentras <span className="texto-marca">en TecniFix.</span>
            </>
          }
          descripcion="Armamos nuestros propios kits con lo que usamos todos los días en el mostrador de reparación."
          accion={
            <Link href="/catalogo?categoria=herramientas" className={claseBotonBorde}>
              Ver herramientas <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
            </Link>
          }
        />

        <div className="mt-14 grid gap-5 lg:grid-cols-[1.15fr_1fr_1fr]">
          <Revelar className="lg:row-span-1">
            <div className="group relative flex h-full min-h-[26rem] flex-col justify-end overflow-hidden rounded-3xl border border-white/[0.08] bg-black p-8">
              <Image
                src={foto('photo-1769085794153-54fd3d57efaf')}
                alt=""
                fill
                sizes="(min-width: 1024px) 34vw, 92vw"
                className="zoom-entrada object-cover opacity-70 transition-transform duration-1000 group-hover:scale-110"
              />
              <span className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" aria-hidden="true" />
              <ChipEtiqueta className="absolute right-6 top-6 gap-2">
                <span className="size-1.5 animate-respirar rounded-full bg-primary" aria-hidden="true" /> En el taller
              </ChipEtiqueta>
              <div className="relative flex flex-col gap-3">
                <ChipEtiqueta className="w-fit">Servicio</ChipEtiqueta>
                <p className="font-display text-3xl font-semibold text-white">Instalación gratis de SSD y RAM</p>
                <p className="max-w-[40ch] text-sm leading-relaxed text-white/75">
                  Compra tu SSD o tu memoria en tienda y la instalamos en el momento. Te devolvemos el equipo probado.
                </p>
                <Link href="/catalogo?categoria=almacenamiento" className="mt-2 inline-flex w-fit items-center gap-2 font-display text-sm font-semibold uppercase tracking-[0.08em] text-white">
                  Ver SSD y memorias <ArrowRight className="size-4 text-accent-foreground transition-transform group-hover:translate-x-1" aria-hidden="true" />
                </Link>
              </div>
            </div>
          </Revelar>

          {kits.map((k, i) => (
            <Revelar key={k.id} retraso={i + 1}>
              <Link
                href={`/catalogo/${k.slug}`}
                className="group relative flex h-full min-h-[26rem] flex-col justify-end overflow-hidden rounded-3xl border border-white/[0.08] bg-black p-7 transition-all duration-500 hover:-translate-y-1.5 hover:border-primary/50"
              >
                <Image
                  src={k.imagenes[0]}
                  alt=""
                  fill
                  sizes="(min-width: 1024px) 28vw, 92vw"
                  className="zoom-entrada object-cover opacity-75 transition-transform duration-1000 group-hover:scale-110"
                />
                <span className="absolute inset-0 bg-gradient-to-t from-black via-black/55 to-transparent" aria-hidden="true" />
                <span className="relative flex flex-col gap-3">
                  <ChipEtiqueta className="w-fit">{k.etiqueta}</ChipEtiqueta>
                  <span className="font-display text-2xl font-semibold leading-tight text-white">{k.nombre}</span>
                  <span className="text-sm leading-relaxed text-white/75">{k.resumen}</span>
                  <span className="mt-2 flex items-center justify-between">
                    <span className="font-display text-2xl font-semibold text-white">{formatearSoles(k.precio_venta)}</span>
                    <span className="inline-flex items-center gap-2 font-display text-xs font-semibold uppercase tracking-[0.1em] text-white">
                      Descubrir <ArrowRight className="size-4 text-accent-foreground transition-transform group-hover:translate-x-1" aria-hidden="true" />
                    </span>
                  </span>
                </span>
              </Link>
            </Revelar>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- 05 · Compra con respaldo ---------- */
const RESPALDOS = [
  { icono: Receipt, nombre: 'Comprobante electrónico', detalle: 'Boleta o factura con IGV de 18 %, con serie y número, enviada a tu correo.' },
  { icono: Warehouse, nombre: 'Stock en tiempo real', detalle: 'La tienda y la caja usan el mismo inventario: cada venta descuenta el stock al instante.' },
  { icono: ShieldCheck, nombre: 'Garantía por escrito', detalle: 'Seis meses por defecto de fábrica; tres meses en pantallas de repuesto.' },
  { icono: Tag, nombre: 'Precio final', detalle: 'El precio que ves ya incluye IGV. Sin recargo por pagar con Yape o tarjeta.' },
  { icono: BadgeCheck, nombre: 'Productos sellados', detalle: 'Todo sale de su caja original. Lo abres frente al vendedor si quieres revisarlo.' },
];

export function Respaldo() {
  return (
    <section id="respaldo" className="scroll-mt-24 py-24 lg:py-32">
      <div className={contenedor}>
        <EncabezadoSeccion
          centrado
          numero="05"
          etiqueta="Compra con respaldo"
          titulo={
            <>
              No lo decimos. <span className="texto-marca">Lo puedes comprobar.</span>
            </>
          }
          descripcion="Estos son los compromisos de la tienda. Cada uno se ve en tu comprobante, en tu garantía o en el mostrador."
          className="mx-auto max-w-3xl [&_h2]:max-w-none"
        />

        <Revelar retraso={2} className="vidrio mx-auto mt-14 max-w-5xl overflow-hidden rounded-3xl">
          <div className="flex items-center justify-between border-b border-white/[0.06] px-6 py-4">
            <p className="etiqueta text-[0.62rem]">Compromisos de la tienda</p>
            <p className="etiqueta text-[0.62rem]">
              Cumplidos: <Contador valor={RESPALDOS.length} className="text-accent-foreground" />/{RESPALDOS.length}
            </p>
          </div>
          <ul className="divide-y divide-white/[0.06]">
            {RESPALDOS.map(({ icono: Icono, nombre, detalle }, i) => (
              <Revelar
                as="li"
                key={nombre}
                retraso={i}
                className="grid grid-cols-[auto_1fr] items-center gap-x-5 gap-y-2 px-6 py-5 transition-colors hover:bg-white/[0.02] sm:grid-cols-[5rem_auto_1fr_auto]"
              >
                <span className="hidden font-mono text-xs text-muted-foreground sm:block">
                  {String(i + 1).padStart(3, '0')}
                  <span className="block text-[0.6rem] text-white/25">TFX·{(0x3a7 * (i + 3)).toString(16)}</span>
                </span>
                <span className="grid size-11 place-items-center rounded-xl border border-primary/30 bg-primary/10 text-accent-foreground">
                  <Icono className="size-5" aria-hidden="true" />
                </span>
                <span>
                  <span className="block font-semibold text-white">{nombre}</span>
                  <span className="mt-0.5 block text-sm text-muted-foreground">{detalle}</span>
                </span>
                <span className="col-span-2 inline-flex w-fit items-center gap-1.5 rounded-full border border-success/30 bg-success/10 px-3 py-1 font-mono text-[0.66rem] uppercase tracking-[0.14em] text-success sm:col-span-1">
                  <Check className="size-3.5" aria-hidden="true" /> Comprobable
                </span>
              </Revelar>
            ))}
          </ul>
        </Revelar>
      </div>
    </section>
  );
}

/* ---------- 06 · Opiniones ---------- */
export function Opiniones() {
  return (
    <section id="opiniones" className="scroll-mt-24 py-24 lg:py-32">
      <div className={contenedor}>
        <div className="flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
          <EncabezadoSeccion
            numero="06"
            etiqueta="Opiniones"
            titulo={
              <>
                Lo que dicen <span className="texto-marca">nuestros clientes.</span>
              </>
            }
            descripcion="Reseñas de ejemplo para la demostración (datos de prueba)."
          />
          <Revelar retraso={2} className="flex items-center gap-5">
            <Contador valor={4.8} decimales={1} className="texto-marca font-display text-[5.5rem] font-bold leading-none" />
            <div>
              <Estrellas valor={4.8} tamano="size-5" />
              <p className="mt-1 text-sm text-muted-foreground">de 126 reseñas de ejemplo</p>
            </div>
          </Revelar>
        </div>

        <div className="mt-14 gap-5 md:columns-2 lg:columns-3">
          {RESENAS.map((r, i) => (
            <Revelar key={r.autor} retraso={i % 3} className="mb-5 break-inside-avoid">
              <figure className="vidrio flex flex-col gap-4 rounded-3xl p-7 transition-colors duration-500 hover:border-primary/40">
                <Estrellas valor={r.estrellas} />
                <blockquote className="text-[1.05rem] leading-relaxed text-white/90">{r.texto}</blockquote>
                <figcaption className="border-t border-white/[0.06] pt-4">
                  <span className="block font-semibold text-white">{r.autor}</span>
                  <span className="block text-xs text-muted-foreground">
                    Reseña de ejemplo · {r.fecha}
                  </span>
                  <span className="mt-1 block truncate text-xs text-accent-foreground/90">{r.producto}</span>
                </figcaption>
              </figure>
            </Revelar>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- 07 · Preguntas frecuentes ---------- */
export function Preguntas() {
  return (
    <section id="preguntas" className="scroll-mt-24 py-24 lg:py-32">
      <div className={`${contenedor} grid gap-12 lg:grid-cols-[0.8fr_1.2fr]`}>
        <div className="flex flex-col gap-6 lg:sticky lg:top-28 lg:self-start">
          <EncabezadoSeccion
            numero="07"
            etiqueta="Preguntas frecuentes"
            titulo={
              <>
                Respuestas <span className="texto-marca">antes de que preguntes.</span>
              </>
            }
            descripcion="Lo que más nos consultan en el mostrador, resumido."
          />
          <Revelar retraso={3}>
            <Link href="#asistente" className={claseBotonBorde}>
              <Search className="size-4 text-accent-foreground" aria-hidden="true" /> Usar el asistente
            </Link>
          </Revelar>
        </div>

        <div className="flex flex-col gap-3">
          {PREGUNTAS.map(({ p, r }, i) => (
            <Revelar key={p} retraso={i}>
              <details className="group vidrio rounded-2xl px-6 transition-colors open:border-primary/40">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-5 font-display text-lg font-medium text-white marker:hidden [&::-webkit-details-marker]:hidden">
                  {p}
                  <span className="grid size-8 shrink-0 place-items-center rounded-full border border-white/15 transition-all duration-300 group-open:rotate-45 group-open:border-primary/60 group-open:bg-primary/15">
                    <Plus className="size-4 text-accent-foreground" aria-hidden="true" />
                  </span>
                </summary>
                <p className="animate-in fade-in slide-in-from-top-1 pb-6 pr-12 leading-relaxed text-muted-foreground duration-300">{r}</p>
              </details>
            </Revelar>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- Cierre ---------- */
export function Cierre() {
  return (
    <section className="relative isolate overflow-hidden py-28 lg:py-40">
      <div className="pointer-events-none absolute left-1/2 top-1/2 -z-10 -translate-x-1/2 -translate-y-1/2" aria-hidden="true">
        {[44, 34, 24].map((t, i) => (
          <span
            key={t}
            className="girar-lento absolute left-1/2 top-1/2 block rounded-full border border-dashed border-primary/40"
            style={{ width: `${t}rem`, height: `${t}rem`, marginLeft: `-${t / 2}rem`, marginTop: `-${t / 2}rem`, animationDuration: `${60 + i * 25}s`, animationDirection: i % 2 ? 'reverse' : 'normal' }}
          />
        ))}
        <span className="absolute left-1/2 top-1/2 block size-[26rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/15 blur-[100px]" />
      </div>
      <div className={`${contenedor} flex flex-col items-center gap-8 text-center`}>
        <Revelar as="p" className="etiqueta text-[0.68rem]">Último paso</Revelar>
        <Revelar as="h2" retraso={1} className="max-w-[18ch] font-display text-[clamp(2.4rem,6vw,5rem)] font-semibold leading-[1.02] tracking-tight text-white">
          ¿Listo para dejar tu equipo <span className="texto-marca">como nuevo?</span>
        </Revelar>
        <Revelar as="p" retraso={2} className="max-w-[52ch] text-lg text-muted-foreground">
          Reserva en línea, paga en tienda y llévate tu comprobante electrónico el mismo día.
        </Revelar>
        <Revelar retraso={3} className="flex flex-wrap justify-center gap-3">
          <Link
            href="/catalogo"
            className="degradado-marca inline-flex h-14 items-center gap-3 rounded-full px-8 font-display text-sm font-semibold uppercase tracking-[0.1em] text-white shadow-brillo transition-all hover:-translate-y-0.5 hover:shadow-brillo-fuerte"
          >
            Ver el catálogo <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
          <Link href="#asistente" className={claseBotonBorde}>
            Encontrar mi repuesto
          </Link>
        </Revelar>
      </div>
    </section>
  );
}
