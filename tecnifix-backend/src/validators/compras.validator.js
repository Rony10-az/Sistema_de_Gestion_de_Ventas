// Validación de los datos de compras. Responde 400 con el formato acordado:
// { error: 'Datos inválidos', campos: { 'items.0.cantidad': 'mensaje' } }.

const { z } = require('zod');

const idDe = (mensaje) =>
  z.number({ error: mensaje }).int(mensaje).positive(mensaje).max(2147483647, mensaje);

const linea = z.object(
  {
    producto_id: idDe('Elige un producto'),
    cantidad: z
      .number({ error: 'La cantidad es obligatoria' })
      .int('La cantidad debe ser un número entero')
      .positive('La cantidad debe ser mayor que 0')
      .max(1000000, 'La cantidad es demasiado alta'),
    costo_unitario: z
      .number({ error: 'El costo unitario es obligatorio' })
      .positive('El costo unitario debe ser mayor que 0')
      .max(99999999.99, 'El costo unitario es demasiado alto')
      .multipleOf(0.01, 'El costo unitario admite como máximo dos decimales'),
  },
  { error: 'La línea no es válida' }
);

// El total no figura: se calcula en el servidor.
const compra = z.object({
  proveedor_id: idDe('Elige un proveedor'),
  items: z
    .array(linea, { error: 'Agrega al menos un producto' })
    .min(1, 'Agrega al menos un producto')
    .max(100, 'Una compra admite hasta 100 productos')
    .refine((items) => new Set(items.map((item) => item.producto_id)).size === items.length, {
      error: 'No repitas un producto: suma las cantidades en una sola línea',
    }),
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
        const campo = path.join('.') || origen;
        campos[campo] ??= message;
      }
      return res.status(400).json({ error: 'Datos inválidos', campos });
    }
    res.locals[origen] = resultado.data;
    return next();
  };
}

module.exports = {
  validarCompra: validarCon(compra, 'body'),
  validarId: validarCon(parametros, 'params'),
  validarConsulta: validarCon(consulta, 'query'),
};
