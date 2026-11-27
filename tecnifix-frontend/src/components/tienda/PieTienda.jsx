// Pie de la tienda: lema grande, columnas de enlaces, medios de pago y acceso del personal.

import Link from 'next/link';
import { CATEGORIAS } from '../../mocks/tienda.mock';
import { Logo } from './Cabecera';
import { Revelar } from './Revelar';

const COLUMNAS = [
  {
    titulo: 'Categorías',
    enlaces: CATEGORIAS.map((c) => ({ texto: c.nombre, href: `/catalogo?categoria=${c.slug}` })),
  },
  {
    titulo: 'Ayuda',
    enlaces: [
      { texto: 'Asistente de compra', href: '/#asistente' },
      { texto: 'Compra con respaldo', href: '/#respaldo' },
      { texto: 'Preguntas frecuentes', href: '/#preguntas' },
      { texto: 'Todo el catálogo', href: '/catalogo' },
    ],
  },
  {
    titulo: 'Personal',
    enlaces: [
      { texto: 'Acceso del personal', href: '/login' },
      { texto: 'Panel de ventas', href: '/dashboard' },
    ],
  },
];

const PAGOS = ['Efectivo', 'Yape', 'Tarjeta'];

export function PieTienda() {
  return (
    <footer className="relative mt-24 overflow-hidden border-t border-white/[0.06] bg-[rgb(4_3_6)]">
      <div className="pointer-events-none absolute -top-40 left-1/2 size-[44rem] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" aria-hidden="true" />
      <div className="relative mx-auto max-w-[1400px] px-4 pb-10 pt-20 md:px-8">
        <Revelar>
          <p className="font-display text-[clamp(2.4rem,7vw,6rem)] font-bold uppercase leading-[0.95] tracking-tight text-white">
            Tu equipo.
            <br />
            <span className="texto-marca">En buenas manos.</span>
          </p>
        </Revelar>

        <div className="mt-16 grid gap-12 border-t border-white/[0.06] pt-12 md:grid-cols-[1.3fr_repeat(3,1fr)]">
          <Revelar className="flex flex-col gap-4">
            <Logo />
            <p className="max-w-[34ch] text-sm leading-relaxed text-muted-foreground">
              Repuestos y accesorios tecnológicos con stock real, comprobante electrónico y asesoría para elegir bien.
            </p>
            <ul className="flex flex-wrap gap-2" aria-label="Medios de pago">
              {PAGOS.map((p) => (
                <li key={p} className="rounded-full border border-white/10 px-3 py-1 font-mono text-[0.68rem] uppercase tracking-[0.1em] text-white/70">
                  {p}
                </li>
              ))}
            </ul>
          </Revelar>
          {COLUMNAS.map((col, i) => (
            <Revelar key={col.titulo} retraso={i + 1}>
              <p className="etiqueta text-[0.64rem]">{col.titulo}</p>
              <ul className="mt-4 flex flex-col gap-2.5">
                {col.enlaces.map((e) => (
                  <li key={e.href}>
                    <Link href={e.href} className="text-sm text-white/75 transition-colors hover:text-white">
                      {e.texto}
                    </Link>
                  </li>
                ))}
              </ul>
            </Revelar>
          ))}
        </div>

        <div className="mt-14 flex flex-col gap-2 border-t border-white/[0.06] pt-6 text-xs text-muted-foreground sm:flex-row sm:justify-between">
          <p>© 2026 TecniFix · Proyecto de Desarrollo de Aplicaciones Web Avanzado · Tecsup</p>
          <p>Catálogo con datos de prueba · Fotos de Unsplash</p>
        </div>
      </div>
    </footer>
  );
}
