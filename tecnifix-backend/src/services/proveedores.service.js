// Reglas de negocio de proveedores: el RUC no se repite y solo se edita un
// proveedor que existe. Delega el acceso a datos a proveedores.repository.js.

const proveedoresRepository = require('../repositories/proveedores.repository');

// Código de PostgreSQL cuando se viola una restricción UNIQUE.
const VALOR_DUPLICADO = '23505';

function errorHttp(status, mensaje) {
  const error = new Error(mensaje);
  error.status = status;
  return error;
}

const rucRepetido = () => errorHttp(409, 'Ya existe un proveedor con ese RUC');

// La consulta previa no basta si dos personas guardan a la vez: en ese caso
// la restricción UNIQUE de la base rechaza la segunda y se responde lo mismo.
async function guardar(operacion) {
  try {
    return await operacion();
  } catch (error) {
    if (error.code === VALOR_DUPLICADO) throw rucRepetido();
    throw error;
  }
}

async function listar({ pagina, limite, buscar }) {
  const desplazamiento = (pagina - 1) * limite;
  const { filas, total } = await proveedoresRepository.listar({ buscar, limite, desplazamiento });
  return { data: filas, total, pagina, limite };
}

async function crear(datos) {
  if (await proveedoresRepository.obtenerPorRuc(datos.ruc)) throw rucRepetido();
  return guardar(() => proveedoresRepository.crear(datos));
}

async function actualizar(id, datos) {
  const actual = await proveedoresRepository.obtenerPorId(id);
  if (!actual) throw errorHttp(404, 'Proveedor no encontrado');

  const otro = await proveedoresRepository.obtenerPorRuc(datos.ruc);
  if (otro && otro.id !== actual.id) throw rucRepetido();

  return guardar(() => proveedoresRepository.actualizar(id, datos));
}

module.exports = { listar, crear, actualizar };
