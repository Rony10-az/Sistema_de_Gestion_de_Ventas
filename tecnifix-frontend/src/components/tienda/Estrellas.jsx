// Calificación con estrellas (de 0 a 5) y, si se pasa, el número de reseñas.

import { Star } from 'lucide-react';
import { cn } from '../../lib/utils';

export function Estrellas({ valor, resenas, className, tamano = 'size-3.5' }) {
  return (
    <span className={cn('inline-flex items-center gap-2 text-sm text-muted-foreground', className)}>
      <span className="flex items-center gap-0.5" role="img" aria-label={`${valor.toFixed(1)} de 5 estrellas`}>
        {[1, 2, 3, 4, 5].map((n) => (
          <Star
            key={n}
            aria-hidden="true"
            className={cn(tamano, n <= Math.round(valor) ? 'fill-[hsl(296_80%_62%)] text-[hsl(296_80%_62%)]' : 'text-white/20')}
          />
        ))}
      </span>
      {resenas != null && (
        <span>
          {valor.toFixed(1).replace('.', ',')} · {resenas} reseñas
        </span>
      )}
    </span>
  );
}
