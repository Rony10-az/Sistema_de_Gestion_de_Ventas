'use client';

// Estados que toda pantalla con datos debe mostrar:
// - <TablaCargando columnas={5} />  mientras llegan los datos
// - <EstadoVacio titulo="..." descripcion="..." accion={<Button>..</Button>} />  si no hay registros
// - <EstadoError mensaje={error.message} onReintentar={cargar} />  si la API falló

import { Inbox, TriangleAlert } from 'lucide-react';
import { Button } from './button';
import { Skeleton } from './skeleton';

export function TablaCargando({ filas = 5, columnas = 4 }) {
  return (
    <div className="flex flex-col gap-3 py-2" role="status" aria-label="Cargando">
      {Array.from({ length: filas }).map((_, f) => (
        <div key={f} className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columnas}, minmax(0, 1fr))` }}>
          {Array.from({ length: columnas }).map((__, c) => (
            <Skeleton key={c} className="h-5" />
          ))}
        </div>
      ))}
    </div>
  );
}

export function EstadoVacio({ titulo = 'No hay registros', descripcion, accion }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed px-6 py-12 text-center">
      <Inbox className="size-10 text-muted-foreground" aria-hidden="true" />
      <div>
        <p className="font-medium">{titulo}</p>
        {descripcion && <p className="mt-1 text-sm text-muted-foreground">{descripcion}</p>}
      </div>
      {accion}
    </div>
  );
}

export function EstadoError({ titulo = 'No se pudieron cargar los datos', mensaje, onReintentar }) {
  return (
    <div role="alert" className="flex flex-col items-center gap-3 rounded-lg border border-destructive/30 bg-destructive/5 px-6 py-12 text-center">
      <TriangleAlert className="size-10 text-destructive" aria-hidden="true" />
      <div>
        <p className="font-medium">{titulo}</p>
        {mensaje && <p className="mt-1 text-sm text-muted-foreground">{mensaje}</p>}
      </div>
      {onReintentar && (
        <Button variant="outline" onClick={onReintentar}>
          Reintentar
        </Button>
      )}
    </div>
  );
}
