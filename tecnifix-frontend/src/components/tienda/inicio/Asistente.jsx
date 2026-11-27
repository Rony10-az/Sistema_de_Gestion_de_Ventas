'use client';

// Asistente de compra: tres preguntas (equipo, objetivo, presupuesto) y una recomendación
// de hasta tres productos del inventario, priorizando los que tienen stock.

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import {
  ArrowLeft, ArrowRight, Cable, Check, Clock, Coins, Gauge, Gem, Headphones, Keyboard, Laptop, Monitor,
  RotateCcw, ShieldCheck, Smartphone, Store, Wallet, Wrench, Zap,
} from 'lucide-react';
import { useCarrito } from '../../../context/CarritoContext';
import { formatearSoles } from '../../../lib/formato';
import { cn } from '../../../lib/utils';
import { ASISTENTE, recomendar } from '../../../mocks/tienda.mock';
import { Revelar } from '../Revelar';
import { ChipStock } from '../TarjetaProducto';

const ICONOS = {
  celular: Smartphone, laptop: Laptop, pc: Monitor,
  cargar: Zap, mejorar: Gauge, reparar: Wrench, conectar: Cable, escuchar: Headphones, trabajar: Keyboard,
  100: Coins, 250: Wallet, 10000: Gem,
};

const VENTAJAS = [
  { icono: Clock, texto: 'Toma unos 30 segundos' },
  { icono: ShieldCheck, texto: 'Sin registrarte, no guardamos nada' },
  { icono: Store, texto: '¿Prefieres en persona? Te atendemos en tienda' },
];

function Resultado({ respuestas, alReiniciar }) {
  const { agregar } = useCarrito();
  const { exacto, productos } = recomendar(respuestas);

  return (
    <div className="flex animate-in flex-col gap-5 fade-in slide-in-from-bottom-2 duration-500">
      <div>
        <p className="etiqueta text-[0.62rem] text-accent-foreground">Tu recomendación</p>
        <p className="mt-2 font-display text-2xl font-semibold text-white sm:text-3xl">
          {exacto ? 'Esto es lo que te sirve.' : 'Lo más cercano a lo que buscas.'}
        </p>
      </div>
      <ul className="flex flex-col gap-3">
        {productos.map((x, i) => (
          <li
            key={x.id}
            className="flex animate-in items-center gap-4 rounded-2xl border border-white/[0.08] bg-white/[0.02] p-3 fade-in slide-in-from-right-3 fill-mode-both"
            style={{ animationDelay: `${i * 90}ms` }}
          >
            <Link href={`/catalogo/${x.slug}`} className="relative size-20 shrink-0 overflow-hidden rounded-xl bg-black">
              <Image src={x.imagenes[0]} alt="" fill sizes="80px" className="object-cover transition-transform duration-500 hover:scale-110" />
            </Link>
            <div className="min-w-0 flex-1">
              <Link href={`/catalogo/${x.slug}`} className="font-medium leading-snug text-white hover:underline">
                {x.nombre}
              </Link>
              <ChipStock producto={x} className="mt-1 flex" />
              <p className="mt-1 font-display font-semibold text-white">{formatearSoles(x.precio_venta)}</p>
            </div>
            {x.stock > 0 && (
              <button
                type="button"
                onClick={() => agregar(x)}
                className="degradado-marca hidden h-10 shrink-0 items-center rounded-full px-4 font-display text-xs font-semibold uppercase tracking-[0.08em] text-white shadow-brillo sm:inline-flex"
              >
                Agregar
              </button>
            )}
          </li>
        ))}
      </ul>
      <button
        type="button"
        onClick={alReiniciar}
        className="inline-flex w-fit items-center gap-2 font-mono text-xs uppercase tracking-[0.16em] text-muted-foreground hover:text-white"
      >
        <RotateCcw className="size-3.5" aria-hidden="true" /> Volver a empezar
      </button>
    </div>
  );
}

export function Asistente() {
  const [paso, setPaso] = useState(0);
  const [respuestas, setRespuestas] = useState({});
  const terminado = paso >= ASISTENTE.length;
  const pregunta = ASISTENTE[Math.min(paso, ASISTENTE.length - 1)];
  const elegida = respuestas[pregunta.clave];

  const elegir = (valor) => setRespuestas((r) => ({ ...r, [pregunta.clave]: valor }));
  const reiniciar = () => {
    setRespuestas({});
    setPaso(0);
  };

  return (
    <section id="asistente" className="relative scroll-mt-24 overflow-hidden py-24 lg:py-32">
      <div className="pointer-events-none absolute bottom-0 right-0 -z-10 h-[40rem] w-[60rem] bg-[radial-gradient(closest-side,hsl(var(--primary)/0.18),transparent)]" aria-hidden="true" />
      <div className="mx-auto grid max-w-[1400px] items-center gap-14 px-4 md:px-8 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="flex flex-col gap-6">
          <Revelar as="p" className="etiqueta flex items-center gap-4 text-[0.68rem]">
            <span className="text-accent-foreground">01</span>
            <span className="h-px w-10 bg-white/25" aria-hidden="true" />
            Asistente de compra
          </Revelar>
          <Revelar as="h2" retraso={1} className="font-display text-[clamp(2.2rem,4.8vw,4.2rem)] font-semibold leading-[1.04] tracking-tight text-white">
            Tres preguntas. <span className="texto-marca">El repuesto correcto.</span>
          </Revelar>
          <Revelar as="p" retraso={2} className="max-w-[48ch] text-lg leading-relaxed text-muted-foreground">
            No necesitas saber de tecnología. Cuéntanos qué equipo tienes y qué quieres lograr, y te mostramos lo que sí le sirve,
            con el stock que hay hoy.
          </Revelar>
          <ul className="mt-2 flex flex-col gap-4">
            {VENTAJAS.map(({ icono: Icono, texto }, i) => (
              <Revelar as="li" key={texto} retraso={3 + i} className="flex items-center gap-3 text-white/90">
                <Icono className="size-5 text-accent-foreground" aria-hidden="true" />
                {texto}
              </Revelar>
            ))}
          </ul>
        </div>

        <Revelar retraso={2}>
          <div className="vidrio overflow-hidden rounded-[1.75rem] bg-[hsl(270_18%_6%/0.85)] shadow-[0_40px_100px_-40px_hsl(var(--brillo)/0.6)]">
            <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-3.5">
              <span className="flex gap-1.5" aria-hidden="true">
                <i className="size-2.5 rounded-full bg-primary" />
                <i className="size-2.5 rounded-full bg-white/15" />
                <i className="size-2.5 rounded-full bg-white/15" />
              </span>
              <span className="font-mono text-xs text-muted-foreground">asistente-tecnifix</span>
              <span className="font-mono text-xs text-muted-foreground">{terminado ? 'listo' : `${paso + 1}/3`}</span>
            </div>

            <div className="p-6 sm:p-8">
              <div className="mb-7 grid grid-cols-3 gap-2" aria-hidden="true">
                {ASISTENTE.map((q, i) => (
                  <span key={q.clave} className="h-1 overflow-hidden rounded-full bg-white/10">
                    <span
                      className="degradado-marca block h-full origin-left transition-transform duration-500"
                      style={{ transform: `scaleX(${i < paso || terminado ? 1 : i === paso && elegida != null ? 0.5 : 0})` }}
                    />
                  </span>
                ))}
              </div>

              {terminado ? (
                <Resultado respuestas={respuestas} alReiniciar={reiniciar} />
              ) : (
                <fieldset key={pregunta.clave} className="animate-in fade-in slide-in-from-right-4 duration-500">
                  <legend className="font-display text-2xl font-semibold text-white sm:text-3xl">{pregunta.titulo}</legend>
                  <p className="mt-2 text-sm text-muted-foreground">{pregunta.ayuda}</p>
                  <div className={cn('mt-6 grid gap-3', pregunta.opciones.length > 3 ? 'sm:grid-cols-2' : 'sm:grid-cols-3')}>
                    {pregunta.opciones.map((o) => {
                      const Icono = ICONOS[o.valor] ?? Check;
                      const activa = elegida === o.valor;
                      return (
                        <button
                          key={o.valor}
                          type="button"
                          aria-pressed={activa}
                          onClick={() => elegir(o.valor)}
                          className={cn(
                            'group flex items-start gap-3.5 rounded-2xl border p-4 text-left transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                            activa
                              ? 'border-primary/70 bg-primary/10 shadow-[0_0_0_1px_hsl(var(--primary)/0.4)]'
                              : 'border-white/[0.08] bg-white/[0.02] hover:-translate-y-0.5 hover:border-white/20',
                          )}
                        >
                          <span
                            className={cn(
                              'grid size-11 shrink-0 place-items-center rounded-xl border transition-colors',
                              activa ? 'degradado-marca border-transparent text-white' : 'border-primary/30 bg-primary/10 text-accent-foreground',
                            )}
                          >
                            <Icono className="size-5" aria-hidden="true" />
                          </span>
                          <span>
                            <span className="block font-semibold text-white">{o.nombre}</span>
                            <span className="mt-0.5 block text-sm text-muted-foreground">{o.detalle}</span>
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </fieldset>
              )}

              {!terminado && (
                <div className="mt-8 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setPaso((p) => p - 1)}
                    disabled={paso === 0}
                    className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.16em] text-muted-foreground transition-colors hover:text-white disabled:invisible"
                  >
                    <ArrowLeft className="size-3.5" aria-hidden="true" /> Atrás
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaso((p) => p + 1)}
                    disabled={elegida == null}
                    className="degradado-marca inline-flex h-11 items-center gap-2 rounded-full px-6 font-mono text-xs font-semibold uppercase tracking-[0.18em] text-white shadow-brillo transition-all hover:shadow-brillo-fuerte disabled:bg-none disabled:bg-white/[0.06] disabled:text-muted-foreground disabled:shadow-none"
                  >
                    {paso === ASISTENTE.length - 1 ? 'Ver resultado' : 'Siguiente'} <ArrowRight className="size-3.5" aria-hidden="true" />
                  </button>
                </div>
              )}
              <p className="mt-6 border-t border-white/[0.06] pt-4 text-xs leading-relaxed text-muted-foreground">
                Es una orientación. Antes de pagar, el vendedor confirma que el repuesto sea compatible con tu modelo.
              </p>
            </div>
          </div>
        </Revelar>
      </div>
    </section>
  );
}
