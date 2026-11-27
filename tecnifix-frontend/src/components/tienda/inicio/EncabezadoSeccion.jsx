// Encabezado de cada sección de la portada: "01 —— ETIQUETA", título grande con una
// parte resaltada, descripción y, opcionalmente, un botón a la derecha.

import { cn } from '../../../lib/utils';
import { Revelar } from '../Revelar';

export function EncabezadoSeccion({ numero, etiqueta, titulo, descripcion, accion, centrado = false, className }) {
  return (
    <div
      className={cn(
        'flex flex-col gap-6',
        centrado ? 'items-center text-center' : 'lg:flex-row lg:items-end lg:justify-between',
        className,
      )}
    >
      <div className={cn('flex flex-col gap-5', centrado && 'items-center')}>
        <Revelar as="p" className="etiqueta flex items-center gap-4 text-[0.68rem]">
          <span className="text-accent-foreground">{numero}</span>
          <span className="h-px w-10 bg-white/25" aria-hidden="true" />
          {etiqueta}
        </Revelar>
        <Revelar as="h2" retraso={1} className="max-w-[20ch] font-display text-[clamp(2.1rem,4.6vw,4rem)] font-semibold leading-[1.04] tracking-tight text-white">
          {titulo}
        </Revelar>
        {descripcion && (
          <Revelar as="p" retraso={2} className="max-w-[60ch] text-base leading-relaxed text-muted-foreground sm:text-lg">
            {descripcion}
          </Revelar>
        )}
      </div>
      {accion && <Revelar retraso={3} className="shrink-0">{accion}</Revelar>}
    </div>
  );
}

// Botón con borde (pill) que se usa como acción secundaria en las secciones.
export const claseBotonBorde =
  'group inline-flex h-14 items-center gap-3 rounded-full border border-white/15 bg-white/[0.02] px-8 font-display text-sm font-semibold uppercase tracking-[0.1em] text-white transition-all hover:-translate-y-0.5 hover:border-primary/60';
