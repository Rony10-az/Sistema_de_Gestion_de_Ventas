'use client';

// Paginación para los listados del contrato: { data, total, pagina, limite }.
// <Paginacion pagina={r.pagina} limite={r.limite} total={r.total} onCambiar={setPagina} />

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './button';

export function Paginacion({ pagina, limite, total, onCambiar }) {
  const paginas = Math.max(1, Math.ceil(total / limite));
  const desde = total === 0 ? 0 : (pagina - 1) * limite + 1;
  const hasta = Math.min(pagina * limite, total);

  return (
    <div className="flex flex-col items-center justify-between gap-3 py-3 text-sm sm:flex-row">
      <p className="text-muted-foreground tabular-nums">
        Mostrando {desde}–{hasta} de {total}
      </p>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={() => onCambiar(pagina - 1)} disabled={pagina <= 1}>
          <ChevronLeft className="size-4" aria-hidden="true" />
          Anterior
        </Button>
        <span className="tabular-nums text-muted-foreground">
          {pagina} / {paginas}
        </span>
        <Button variant="outline" size="sm" onClick={() => onCambiar(pagina + 1)} disabled={pagina >= paginas}>
          Siguiente
          <ChevronRight className="size-4" aria-hidden="true" />
        </Button>
      </div>
    </div>
  );
}
