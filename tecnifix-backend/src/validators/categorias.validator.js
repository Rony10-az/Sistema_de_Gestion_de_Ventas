// Validación de los datos de categorías. Responde 400 con el formato acordado:
// { error: 'Datos inválidos', campos: { campo: 'mensaje' } }.

const { z } = require('zod');

const categoria = z.object({
  nombre: z
    .string({ error: 'El nombre es obligatorio' })
    .trim()
    .min(3, 'El nombre debe tener al menos 3 caracteres')
    .max(60, 'El nombre no puede pasar de 60 caracteres'),
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
  validarCategoria: validarCon(categoria, 'body'),
  validarId: validarCon(parametros, 'params'),
  validarConsulta: validarCon(consulta, 'query'),
};
