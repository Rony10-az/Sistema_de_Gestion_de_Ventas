// Reglas de negocio de categorías: el nombre no se repite y solo se edita
// una categoría que existe. Delega el acceso a datos a categorias.repository.js.

const categoriasRepository = require('../repositories/categorias.repository');

// Código de PostgreSQL cuando se viola una restricción UNIQUE.
const VALOR_DUPLICADO = '23505';

function errorHttp(status, mensaje) {
  const error = new Error(mensaje);
  error.status = status;
  return error;
}

const nombreRepetido = () => errorHttp(409, 'Ya existe una categoría con ese nombre');

// La consulta previa no basta si dos personas guardan a la vez: en ese caso
// la restricción UNIQUE de la base rechaza la segunda y se responde lo mismo.
async function guardar(operacion) {
  try {
    return await operacion();
  } catch (error) {
    if (error.code === VALOR_DUPLICADO) throw nombreRepetido();
    throw error;
  }
}

async function listar({ pagina, limite, buscar }) {
  const desplazamiento = (pagina - 1) * limite;
  const { filas, total } = await categoriasRepository.listar({ buscar, limite, desplazamiento });
  return { data: filas, total, pagina, limite };
}

async function crear({ nombre }) {
  if (await categoriasRepository.obtenerPorNombre(nombre)) throw nombreRepetido();
  return guardar(() => categoriasRepository.crear({ nombre }));
}

async function actualizar(id, { nombre }) {
  const actual = await categoriasRepository.obtenerPorId(id);
  if (!actual) throw errorHttp(404, 'Categoría no encontrada');

  const otra = await categoriasRepository.obtenerPorNombre(nombre);
  if (otra && otra.id !== actual.id) throw nombreRepetido();

  return guardar(() => categoriasRepository.actualizar(id, { nombre }));
}

module.exports = { listar, crear, actualizar };
