// Dos cintas que se desplazan en sentidos opuestos: marcas que vendemos y compromisos
// de la tienda. Se pausan al pasar el mouse. Cada fila se duplica para que el giro no tenga cortes.

import { COMPROMISOS, MARCAS } from '../../mocks/tienda.mock';

function Fila({ etiqueta, children, inversa, duracion }) {
  return (
    <div className="grid grid-cols-1 items-center border-t border-white/[0.06] first:border-t-0 sm:grid-cols-[auto_minmax(0,1fr)]">
      <p className="etiqueta flex items-center gap-2.5 px-6 pt-4 text-[0.66rem] sm:h-full sm:pt-0 md:px-8">
        <i className="size-1.5 rounded-full bg-primary shadow-[0_0_10px_hsl(var(--primary))]" aria-hidden="true" />
        {etiqueta}
      </p>
      <div className="carril flex overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_6%,#000_94%,transparent)]">
        <div className={`cinta ${inversa ? 'cinta-inversa' : ''}`} style={{ animationDuration: duracion }}>
          {[false, true].map((copia) => (
            <ul key={String(copia)} className="flex shrink-0 items-center gap-16 px-8" aria-hidden={copia || undefined}>
              {children}
            </ul>
          ))}
        </div>
      </div>
    </div>
  );
}

export function Cintas() {
  return (
    <section aria-label="Marcas y compromisos" className="border-y border-white/[0.06] bg-[rgb(4_3_6)]">
      <Fila etiqueta="Marcas que vendemos" duracion="48s">
        {MARCAS.map((m) => (
          <li
            key={m}
            className="flex h-20 items-center font-display text-2xl font-semibold tracking-tight text-white/45 transition-colors duration-300 hover:text-white"
          >
            {m}
          </li>
        ))}
      </Fila>
      <Fila etiqueta="Compromisos" inversa duracion="40s">
        {COMPROMISOS.map((c) => (
          <li key={c} className="flex h-14 items-center gap-3.5 whitespace-nowrap font-mono text-[0.8rem] tracking-[0.04em] text-white/80">
            <span className="size-1.5 rotate-45 bg-primary" aria-hidden="true" />
            {c}
          </li>
        ))}
      </Fila>
    </section>
  );
}
