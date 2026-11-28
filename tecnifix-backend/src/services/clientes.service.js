// Reglas de negocio de clientes: documento único, cliente existente y alcance del
// historial de ventas según el rol. Delega el acceso a datos a clientes.repository.js.

const clientesRepository = require('../repositories/clientes.repository');

// Códigos de PostgreSQL: UNIQUE violada y clave foránea que impide borrar.
const VALOR_DUPLICADO = '23505';
const TIENE_REFERENCIAS = '23503';

function errorHttp(status, mensaje) {
  const error = new Error(mensaje);
  error.status = status;
  return error;
}

const documentoRepetido = () => errorHttp(409, 'Ya existe un cliente con ese documento');
const noEncontrado = () => errorHttp(404, 'Cliente no encontrado');

// La consulta previa no basta si dos personas guardan a la vez: en ese caso
// la restricción UNIQUE de la base rechaza la segunda y se responde lo mismo.
async function guardar(operacion) {
  try {
    return await operacion();
  } catch (error) {
    if (error.code === VALOR_DUPLICADO) throw documentoRepetido();
    throw error;
  }
}

async function listar({ pagina, limite, buscar }) {
  const desplazamiento = (pagina - 1) * limite;
  const { filas, total } = await clientesRepository.listar({ buscar, limite, desplazamiento });
  return { data: filas, total, pagina, limite };
}

async function obtenerPorId(id) {
  const cliente = await clientesRepository.obtenerPorId(id);
  if (!cliente) throw noEncontrado();
  return cliente;
}

async function crear(datos) {
  if (await clientesRepository.obtenerPorDocumento(datos.documento)) throw documentoRepetido();
  return guardar(() => clientesRepository.crear(datos));
}

async function actualizar(id, datos) {
  const actual = await obtenerPorId(id);

  const otro = await clientesRepository.obtenerPorDocumento(datos.documento);
  if (otro && otro.id !== actual.id) throw documentoRepetido();

  return guardar(() => clientesRepository.actualizar(id, datos));
}

async function eliminar(id) {
  await obtenerPorId(id);
  try {
    await clientesRepository.eliminar(id);
  } catch (error) {
    if (error.code === TIENE_REFERENCIAS) {
      throw errorHttp(409, 'No se puede eliminar un cliente que tiene ventas');
    }
    throw error;
  }
}

// El administrador ve todas las ventas del cliente; el vendedor, solo las suyas.
async function listarVentas(id, usuario, { pagina, limite }) {
  await obtenerPorId(id);
  const desplazamiento = (pagina - 1) * limite;
  const vendedorId = usuario.rol === 'admin' ? null : usuario.id;
  const { filas, total } = await clientesRepository.listarVentas({
    clienteId: id,
    vendedorId,
    limite,
    desplazamiento,
  });
  return { data: filas, total, pagina, limite };
}

module.exports = { listar, obtenerPorId, crear, actualizar, eliminar, listarVentas };
