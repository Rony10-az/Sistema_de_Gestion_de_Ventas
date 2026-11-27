// Validación de los datos de productos. Responde 400 con el formato acordado:
// { error: 'Datos inválidos', campos: { campo: 'mensaje' } }.

const { z } = require('zod');

const ENTERO_MAXIMO = 2147483647; // INTEGER de PostgreSQL
const PRECIO_MAXIMO = 99999999.99; // NUMERIC(10, 2)

const precio = (nombre) =>
  z
    .number({ error: `El ${nombre} es obligatorio y debe ser un número` })
    .max(PRECIO_MAXIMO, `El ${nombre} es demasiado alto`)
    .multipleOf(0.01, `El ${nombre} admite como máximo dos decimales`);

const precioCompra = precio('precio de compra').min(0, 'El precio de compra no puede ser negativo');
const precioVenta = precio('precio de venta').positive('El precio de venta debe ser mayor que 0');

// El stock no figura: cualquier valor que llegue se descarta.
const datos = {
  sku: z
    .string({ error: 'El SKU es obligatorio' })
    .trim()
    .regex(/^[A-Za-z0-9-]{1,30}$/, 'El SKU admite letras, números y guiones (máximo 30)')
    .toUpperCase(),
  nombre: z
    .string({ error: 'El nombre es obligatorio' })
    .trim()
    .min(3, 'El nombre debe tener al menos 3 caracteres')
    .max(150, 'El nombre no puede pasar de 150 caracteres'),
  categoria_id: z
    .number({ error: 'La categoría es obligatoria' })
    .int('La categoría no es válida')
    .positive('La categoría no es válida')
    .max(ENTERO_MAXIMO, 'La categoría no es válida'),
  stock_minimo: z
    .number({ error: 'El stock mínimo es obligatorio' })
    .int('El stock mínimo debe ser un número entero')
    .min(0, 'El stock mínimo no puede ser negativo')
    .max(ENTERO_MAXIMO, 'El stock mínimo es demasiado alto'),
};

const productoNuevo = z.object({
  ...datos,
  precio_compra: precioCompra,
  precio_venta: precioVenta,
});

// Al editar, los precios son opcionales: el almacenero no los envía.
const productoEditado = z.object({
  ...datos,
  precio_compra: precioCompra.optional(),
  precio_venta: precioVenta.optional(),
  activo: z.boolean({ error: 'El estado debe ser verdadero o falso' }).optional(),
});

// El id es un SERIAL de PostgreSQL: entero positivo de 32 bits.
const parametros = z.object({
  id: z.coerce.number().int().positive().max(ENTERO_MAXIMO, 'El id no es válido'),
});

// Un valor de consulta ausente o mal escrito toma el valor por defecto.
const consulta = z.object({
  pagina: z.coerce.number().int().min(1).max(100000).catch(1),
  limite: z.coerce.number().int().min(1).max(100).catch(10),
  buscar: z.string().trim().max(60).catch(''),
  categoria: z.coerce.number().int().positive().max(ENTERO_MAXIMO).optional().catch(undefined),
  stockBajo: z
    .unknown()
    .optional()
    .transform((valor) => valor === 'true'),
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
  validarProductoNuevo: validarCon(productoNuevo, 'body'),
  validarProductoEditado: validarCon(productoEditado, 'body'),
  validarId: validarCon(parametros, 'params'),
  validarConsulta: validarCon(consulta, 'query'),
};
