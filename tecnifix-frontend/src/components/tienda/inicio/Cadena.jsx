'use client';

// "Tu equipo funciona en cadena": tres eslabones (energía, conexión, mantenimiento)
// unidos por una línea con un brillo que la recorre. Al pasar el mouse por una tarjeta
// se ilumina su eslabón.

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { ArrowRight, Cable, Wrench, Zap } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { foto } from '../../../mocks/tienda.mock';
import { Revelar } from '../Revelar';
import { EncabezadoSeccion } from './EncabezadoSeccion';

const ESLABONES = [
  {
    icono: Zap, codigo: 'TFX-E1', titulo: 'Energía', imagen: foto('photo-1557767382-97b28f5488e7'),
    texto: 'Un buen cargador y un cable que aguante. Sin eso, todo lo demás se queda sin batería.',
    enlace: { texto: 'Cargadores y cables', href: '/catalogo?categoria=cargadores-y-cables' },
  },
  {
    icono: Cable, codigo: 'TFX-E2', titulo: 'Conexión', imagen: foto('photo-1760376789487-994070337c76'),
    texto: 'Hubs, HDMI y Wi-Fi para que tu laptop hable con el monitor, la red y tus accesorios.',
    enlace: { texto: 'Periféricos', href: '/catalogo?categoria=perifericos' },
  },
  {
    icono: Wrench, codigo: 'TFX-E3', titulo: 'Mantenimiento', imagen: foto('photo-1597138804456-e7dca7f59d54'),
    texto: 'Limpieza, pasta térmica y repuestos a tiempo. Es lo que hace que tu equipo dure años.',
    enlace: { texto: 'Repuestos y herramientas', href: '/catalogo?categoria=repuestos' },
  },
];

export function Cadena() {
  const [activo, setActivo] = useState(0);

  return (
    <section className="py-24 lg:py-32">
      <div className="mx-auto max-w-[1400px] px-4 md:px-8">
        <EncabezadoSeccion
          centrado
          numero="02"
          etiqueta="Cómo elegir"
          titulo={
            <>
              Tu equipo funciona en cadena. <span className="texto-marca">Cuida los tres eslabones.</span>
            </>
          }
          descripcion="Cuando algo falla casi siempre es uno de estos tres: la energía que recibe, cómo se conecta o el mantenimiento que le falta."
          className="mx-auto max-w-4xl [&_h2]:max-w-none"
        />

        <Revelar retraso={2} className="relative mx-auto mt-16 hidden max-w-5xl grid-cols-3 md:grid" aria-hidden="true">
          <span className="absolute left-[16.6%] right-[16.6%] top-7 h-px bg-white/10" />
          <span className="linea-viaje absolute left-[16.6%] right-[16.6%] top-7 h-px" />
          {ESLABONES.map(({ icono: Icono, codigo }, i) => (
            <div key={codigo} className="relative flex flex-col items-center gap-4">
              <span
                className={cn(
                  'grid size-14 place-items-center transition-all duration-500 [clip-path:polygon(25%_0,75%_0,100%_50%,75%_100%,25%_100%,0_50%)]',
                  activo === i ? 'degradado-marca scale-110 text-white' : 'bg-[hsl(270_14%_14%)] text-accent-foreground',
                )}
              >
                <Icono className="size-5" />
              </span>
              <span className={cn('font-mono text-xs transition-colors', activo === i ? 'text-accent-foreground' : 'text-muted-foreground')}>
                Eslabón {i + 1} · {codigo}
              </span>
            </div>
          ))}
        </Revelar>

        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {ESLABONES.map((e, i) => (
            <Revelar key={e.codigo} retraso={i + 1} onPointerEnter={() => setActivo(i)} onFocus={() => setActivo(i)}>
              <Link
                href={e.enlace.href}
                className="group relative flex aspect-[4/5] flex-col justify-end overflow-hidden rounded-3xl border border-white/[0.08] bg-black p-7 transition-all duration-500 hover:-translate-y-1.5 hover:border-primary/50 hover:shadow-[0_30px_80px_-30px_hsl(var(--brillo)/0.8)]"
              >
                <Image
                  src={e.imagen}
                  alt=""
                  fill
                  sizes="(min-width: 768px) 30vw, 90vw"
                  className="zoom-entrada object-cover opacity-80 transition-[transform,opacity] duration-1000 group-hover:scale-110 group-hover:opacity-100"
                />
                <span className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/10" aria-hidden="true" />
                <span className="relative flex flex-col gap-3">
                  <span className="font-mono text-[0.68rem] uppercase tracking-[0.18em] text-accent-foreground">
                    Eslabón {i + 1}
                  </span>
                  <span className="font-display text-3xl font-semibold text-white">{e.titulo}</span>
                  <span className="text-sm leading-relaxed text-white/75">{e.texto}</span>
                  <span className="mt-2 inline-flex items-center gap-2 text-sm font-semibold text-white">
                    {e.enlace.texto}
                    <ArrowRight className="size-4 text-accent-foreground transition-transform group-hover:translate-x-1" aria-hidden="true" />
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
