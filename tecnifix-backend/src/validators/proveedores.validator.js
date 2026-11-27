// Validación de los datos de proveedores. Responde 400 con el formato acordado:
// { error: 'Datos inválidos', campos: { campo: 'mensaje' } }.

const { z } = require('zod');

const proveedor = z.object({
  ruc: z
    .string({ error: 'El RUC es obligatorio' })
    .trim()
    .regex(/^(10|20)\d{9}$/, 'El RUC debe tener 11 dígitos y empezar con 10 o 20'),
  razon_social: z
    .string({ error: 'La razón social es obligatoria' })
    .trim()
    .min(3, 'La razón social debe tener al menos 3 caracteres')
    .max(150, 'La razón social no puede pasar de 150 caracteres'),
  // Opcional: si no llega o llega vacío se guarda como NULL.
  telefono: z
    .string({ error: 'El teléfono debe ser un texto' })
    .trim()
    .regex(/^(\d{9})?$/, 'El teléfono debe tener 9 dígitos')
    .nullish()
    .transform((valor) => valor || null),
});

// El id es un SERIAL de PostgreSQL: entero positivo de 32 bits.
const parametros = z.object({
  id: z.coerce.number().int().positive().max(2147483647, 'El id no es válido'),
});

// Un valor de consulta ausente o mal escrito toma el valor por defecto.
const consulta = z.object({
  pagina: z.coerce.number().int().min(1).max(100000).catch(1),
  limite: z.coerce.number().int().min(1).max(100).catch(10),
  buscar: z.string().trim().max(60).catch(''),
});

// Valida req[origen] y deja el resultado ya limpio en res.locals[origen].
function validarCon(esquema, origen) {
  return (req, res, next) => {
    const resultado = esquema.safeParse(req[origen] ?? {});
    if (!resultado.success) {
      const campos = {};
      for (const { path, message } of resultado.error.issues) {
        const campo = path[0] ?? origen;
        campos[campo] ??= message;
      }
      return res.status(400).json({ error: 'Datos inválidos', campos });
    }
    res.locals[origen] = resultado.data;
    return next();
  };
}

module.exports = {
  validarProveedor: validarCon(proveedor, 'body'),
  validarId: validarCon(parametros, 'params'),
  validarConsulta: validarCon(consulta, 'query'),
};
