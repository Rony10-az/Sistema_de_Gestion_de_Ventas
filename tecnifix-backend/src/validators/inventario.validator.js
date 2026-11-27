// Validación de los datos de inventario. Responde 400 con el formato acordado:
// { error: 'Datos inválidos', campos: { campo: 'mensaje' } }.

const { z } = require('zod');

const ENTERO_MAXIMO = 2147483647; // INTEGER de PostgreSQL

const ajuste = z.object({
  producto_id: z
    .number({ error: 'Elige un producto' })
    .int('Elige un producto')
    .positive('Elige un producto')
    .max(ENTERO_MAXIMO, 'Elige un producto'),
  cantidad: z
    .number({ error: 'La cantidad es obligatoria' })
    .int('La cantidad debe ser un número entero')
    .min(-1000000, 'La cantidad es demasiado baja')
    .max(1000000, 'La cantidad es demasiado alta')
    .refine((valor) => valor !== 0, { error: 'La cantidad no puede ser 0' }),
  motivo: z
    .string({ error: 'El motivo es obligatorio' })
    .trim()
    .min(5, 'El motivo debe tener al menos 5 caracteres')
    .max(200, 'El motivo no puede pasar de 200 caracteres'),
});

const parametros = z.object({
  id: z.coerce.number().int().positive().max(ENTERO_MAXIMO, 'El id no es válido'),
});

// Un valor de consulta ausente o mal escrito toma el valor por defecto.
const consulta = z.object({
  pagina: z.coerce.number().int().min(1).max(100000).catch(1),
  limite: z.coerce.number().int().min(1).max(100).catch(10),
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
  validarAjuste: validarCon(ajuste, 'body'),
  validarId: validarCon(parametros, 'params'),
  validarConsulta: validarCon(consulta, 'query'),
};
