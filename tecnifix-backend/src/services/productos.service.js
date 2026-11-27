// Reglas de negocio del catálogo de productos: SKU único, categoría existente
// y permisos sobre los precios según el rol.

const productosRepository = require('../repositories/productos.repository');
const categoriasRepository = require('../repositories/categorias.repository');

// Código de PostgreSQL cuando se viola una restricción UNIQUE.
const VALOR_DUPLICADO = '23505';
const PRECIOS = ['precio_compra', 'precio_venta'];

function errorHttp(status, mensaje, campos) {
  const error = new Error(mensaje);
  error.status = status;
  error.campos = campos;
  return error;
}

const noEncontrado = () => errorHttp(404, 'Producto no encontrado');
const skuRepetido = () => errorHttp(409, 'Ya existe un producto con ese SKU');

// El almacenero gestiona el inventario sin ver los precios.
function segunRol(producto, { rol }) {
  if (rol !== 'almacenero') return producto;
  const copia = { ...producto };
  PRECIOS.forEach((campo) => delete copia[campo]);
  return copia;
}

// El vendedor solo trabaja con productos que se pueden vender.
const soloActivos = ({ rol }) => rol === 'vendedor';

async function exigirCategoria(id) {
  if (!(await categoriasRepository.obtenerPorId(id))) {
    throw errorHttp(400, 'Datos inválidos', { categoria_id: 'La categoría no existe' });
  }
}

async function guardar(operacion) {
  try {
    return await operacion();
  } catch (error) {
    if (error.code === VALOR_DUPLICADO) throw skuRepetido();
    throw error;
  }
}

async function buscarExistente(id) {
  const producto = await productosRepository.obtenerPorId(id);
  if (!producto) throw noEncontrado();
  return producto;
}

async function listar({ pagina, limite, ...filtros }, usuario) {
  const { filas, total } = await productosRepository.listar({
    ...filtros,
    soloActivos: soloActivos(usuario),
    limite,
    desplazamiento: (pagina - 1) * limite,
  });
  return { data: filas.map((fila) => segunRol(fila, usuario)), total, pagina, limite };
}

async function obtenerPorId(id, usuario) {
  const producto = await buscarExistente(id);
  if (!producto.activo && soloActivos(usuario)) throw noEncontrado();
  return segunRol(producto, usuario);
}

async function crear(datos, usuario) {
  await exigirCategoria(datos.categoria_id);
  if (await productosRepository.obtenerPorSku(datos.sku)) throw skuRepetido();
  const creado = await guardar(() => productosRepository.crear(datos));
  return segunRol(creado, usuario);
}

async function actualizar(id, datos, usuario) {
  const actual = await buscarExistente(id);

  const cambiaPrecio = PRECIOS.some(
    (campo) => datos[campo] !== undefined && datos[campo] !== actual[campo]
  );
  if (cambiaPrecio && usuario.rol !== 'admin') {
    throw errorHttp(403, 'Solo el administrador puede cambiar precios');
  }

  await exigirCategoria(datos.categoria_id);
  const otro = await productosRepository.obtenerPorSku(datos.sku);
  if (otro && otro.id !== actual.id) throw skuRepetido();

  const actualizado = await guardar(() => productosRepository.actualizar(id, datos));
  return segunRol(actualizado, usuario);
}

async function desactivar(id) {
  await buscarExistente(id);
  await productosRepository.desactivar(id);
}

module.exports = { listar, obtenerPorId, crear, actualizar, desactivar };
