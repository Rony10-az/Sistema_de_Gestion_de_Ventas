// Validación de los datos de clientes. Responde 400 con el formato acordado:
// { error: 'Datos inválidos', campos: { campo: 'mensaje' } }.

const { z } = require('zod');

const LARGO_DOCUMENTO = { DNI: 8, RUC: 11 };

// Un campo opcional vacío ('' o null) se guarda como NULL.
const opcional = (esquema) =>
  z.preprocess((valor) => (valor === '' || valor === null ? undefined : valor), esquema.optional());

const cliente = z
  .object({
    tipo_documento: z.enum(['DNI', 'RUC'], { error: 'El tipo de documento debe ser DNI o RUC' }),
    documento: z
      .string({ error: 'El documento es obligatorio' })
      .trim()
      .min(1, 'El documento es obligatorio'),
    nombre: z
      .string({ error: 'El nombre es obligatorio' })
      .trim()
      .min(3, 'El nombre debe tener al menos 3 caracteres')
      .max(150, 'El nombre no puede pasar de 150 caracteres'),
    telefono: opcional(
      z
        .string()
        .trim()
        .regex(/^9\d{8}$/, 'El teléfono debe tener 9 dígitos y empezar con 9')
    ),
    email: opcional(
      z
        .string()
        .trim()
        .max(150, 'El email no puede pasar de 150 caracteres')
        .pipe(z.email('El email no tiene un formato válido'))
    ),
    direccion: opcional(
      z.string().trim().max(200, 'La dirección no puede pasar de 200 caracteres')
    ),
  })
  .superRefine((datos, ctx) => {
    const largo = LARGO_DOCUMENTO[datos.tipo_documento];
    if (largo && typeof datos.documento === 'string' && datos.documento.length > 0) {
      if (!new RegExp(`^\\d{${largo}}$`).test(datos.documento)) {
        ctx.addIssue({
          code: 'custom',
          path: ['documento'],
          message: `El ${datos.tipo_documento} debe tener ${largo} dígitos`,
        });
      }
    }
    if (datos.tipo_documento === 'RUC' && !datos.direccion) {
      ctx.addIssue({
        code: 'custom',
        path: ['direccion'],
        message: 'La dirección es obligatoria para clientes con RUC',
      });
    }
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
  validarCliente: validarCon(cliente, 'body'),
  validarId: validarCon(parametros, 'params'),
  validarConsulta: validarCon(consulta, 'query'),
};
