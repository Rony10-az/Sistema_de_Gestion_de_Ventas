// Reglas de negocio de ventas: validar stock disponible antes de vender,
// calcular el total, descontar stock del producto, asociar al cliente y
// al usuario que la registró. Orquesta productos.repository y
// ventas.repository (puede necesitar leer stock de otro dominio).

const ventasRepository = require('../repositories/ventas.repository');
const productosRepository = require('../repositories/productos.repository');

// El vendedor solo ve sus propias ventas; el admin, todas.
const soloPropias = (usuario) => usuario?.rol === 'vendedor';

async function listar(usuario) {
  return ventasRepository.obtenerTodas(soloPropias(usuario) ? { vendedorId: usuario.id } : {});
}

// Una venta ajena responde igual que una que no existe.
async function obtenerPorId(id, usuario) {
  const venta = await ventasRepository.obtenerPorId(id);
  if (!venta || (soloPropias(usuario) && venta.vendedor_id !== usuario.id)) {
    const error = new Error('Venta no encontrada');
    error.status = 404;
    throw error;
  }
  return venta;
}

async function crear({ clienteId, items }, usuario) {
  // TODO:
  // 1. Por cada item, verificar stock en productosRepository.
  // 2. Calcular el total sumando (precio * cantidad) de cada item.
  // 3. Descontar el stock vendido.
  // 4. Guardar la venta y su detalle en una transacción.
  return ventasRepository.crear({ clienteId, items, vendedorId: usuario.id });
}

module.exports = { listar, obtenerPorId, crear };
