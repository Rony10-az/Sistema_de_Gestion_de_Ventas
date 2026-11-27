// Reglas de negocio del inventario: ajustes de stock, kardex y las salidas y
// devoluciones que usa el módulo de ventas.

const inventarioRepository = require('../repositories/inventario.repository');
const productosRepository = require('../repositories/productos.repository');

function errorHttp(status, mensaje) {
  const error = new Error(mensaje);
  error.status = status;
  return error;
}

async function exigirProducto(id) {
  const producto = await productosRepository.obtenerPorId(id);
  if (!producto) throw errorHttp(404, 'Producto no encontrado');
  return producto;
}

async function ajustar({ producto_id, cantidad, motivo }, usuario) {
  const producto = await exigirProducto(producto_id);

  return inventarioRepository.enTransaccion(async (client) => {
    const stock = await productosRepository.ajustarStock(client, producto_id, cantidad);
    if (stock === undefined) {
      throw errorHttp(409, `El stock de ${producto.nombre} no puede quedar en negativo`);
    }
    return inventarioRepository.registrarMovimiento(client, {
      producto_id,
      tipo: 'ajuste',
      cantidad,
      stock_resultante: stock,
      motivo,
      usuario_id: usuario.id,
    });
  });
}

async function listarMovimientos(productoId, { pagina, limite }) {
  await exigirProducto(productoId);
  const desplazamiento = (pagina - 1) * limite;
  const { filas, total } = await inventarioRepository.listarPorProducto(productoId, {
    limite,
    desplazamiento,
  });
  return { data: filas, total, pagina, limite };
}

// Para ventas: descuenta el stock y anota la salida. Se llama con el client de la
// transacción de la venta; si lanza el error 409, ventas debe hacer ROLLBACK.
// Los items deben llegar ordenados por producto_id (ver bloquearPorIds).
async function registrarSalida(client, { producto_id, cantidad, referencia, usuario_id }) {
  const stock = await productosRepository.descontarStock(client, producto_id, cantidad);
  if (stock === undefined) {
    const [producto] = await productosRepository.bloquearPorIds(client, [producto_id]);
    const nombre = producto?.nombre ?? `el producto ${producto_id}`;
    throw errorHttp(409, `Stock insuficiente para ${nombre}`);
  }
  await inventarioRepository.registrarMovimiento(client, {
    producto_id,
    tipo: 'salida',
    cantidad: -cantidad,
    stock_resultante: stock,
    referencia,
    usuario_id,
  });
  return stock;
}

// Para la anulación de una venta: devuelve las unidades y anota la entrada,
// aunque el producto se haya desactivado después.
async function registrarDevolucion(client, { producto_id, cantidad, referencia, usuario_id }) {
  const stock = await productosRepository.ajustarStock(client, producto_id, cantidad);
  if (stock === undefined) throw errorHttp(404, 'Producto no encontrado');
  await inventarioRepository.registrarMovimiento(client, {
    producto_id,
    tipo: 'entrada',
    cantidad,
    stock_resultante: stock,
    referencia,
    motivo: 'Anulación de venta',
    usuario_id,
  });
  return stock;
}

module.exports = { ajustar, listarMovimientos, registrarSalida, registrarDevolucion };
