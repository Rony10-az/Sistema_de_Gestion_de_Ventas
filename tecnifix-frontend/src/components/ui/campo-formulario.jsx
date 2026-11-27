// Campo de formulario con etiqueta arriba, texto de ayuda y error debajo.
// El error puede venir de la validación del navegador o del campo "campos" de la API.
// <CampoFormulario id="documento" etiqueta="DNI" error={errores.documento} ayuda="8 dígitos">
//   <Input id="documento" ... aria-invalid={!!errores.documento} />
// </CampoFormulario>

import { Label } from './label';

export function CampoFormulario({ id, etiqueta, error, ayuda, children }) {
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id}>{etiqueta}</Label>
      {children}
      {error ? (
        <p id={`${id}-error`} className="text-sm text-destructive">
          {error}
        </p>
      ) : (
        ayuda && <p className="text-sm text-muted-foreground">{ayuda}</p>
      )}
    </div>
  );
}
