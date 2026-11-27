// Título de cada página del panel, con etiqueta opcional arriba, descripción y acciones
// a la derecha (por ejemplo el botón "Nuevo producto"). Úsenlo al inicio de cada página.
// <EncabezadoPagina etiqueta="Inventario" titulo="Productos" descripcion="...">
//   <Button>Nuevo producto</Button>
// </EncabezadoPagina>

export function EncabezadoPagina({ titulo, descripcion, etiqueta, children }) {
  return (
    <div className="mb-8 flex animate-aparecer flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        {etiqueta && <p className="etiqueta mb-2 flex items-center gap-2 text-accent-foreground/90">— {etiqueta}</p>}
        <h1 className="font-display text-3xl font-semibold tracking-tight text-white sm:text-4xl">{titulo}</h1>
        {descripcion && <p className="mt-2 max-w-[60ch] text-sm text-muted-foreground">{descripcion}</p>}
      </div>
      {children && <div className="flex flex-wrap gap-2">{children}</div>}
    </div>
  );
}
