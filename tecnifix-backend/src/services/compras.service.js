// Reglas de negocio de compras: el total se calcula en el servidor y cada
// compra sube el stock y deja su fila en el kardex, todo en una transacción.

const comprasRepository = require('../repositories/compras.repository');
const productosRepository = require('../repositories/productos.repository');
const proveedoresRepository = require('../repositories/proveedores.repository');
const inventarioRepository = require('../repositories/inventario.repository');

const TOTAL_MAXIMO = 99999999.99; // NUMERIC(10, 2)

function errorHttp(status, mensaje, campos) {
  const error = new Error(mensaje);
  error.status = status;
  error.campos = campos;
  return error;
}

const datosInvalidos = (campos) => errorHttp(400, 'Datos inválidos', campos);

// Se suma en céntimos para no arrastrar errores de decimales.
function calcularTotal(items) {
  const centimos = items.reduce(
    (suma, { cantidad, costo_unitario }) => suma + cantidad * Math.round(costo_unitario * 100),
    0
  );
  return centimos / 100;
}

async function crear({ proveedor_id, items }, usuario) {
  if (!(await proveedoresRepository.obtenerPorId(proveedor_id))) {
    throw datosInvalidos({ proveedor_id: 'El proveedor no existe' });
  }

  const total = calcularTotal(items);
  if (total > TOTAL_MAXIMO) {
    throw datosInvalidos({ items: 'El total de la compra es demasiado alto' });
  }

  const id = await comprasRepository.enTransaccion(async (client) => {
    const compraId = await comprasRepository.insertarCompra(client, {
      proveedor_id,
      usuario_id: usuario.id,
      total,
    });

    // Los productos se bloquean siempre en el mismo orden para que dos
    // operaciones simultáneas no se queden esperando una a la otra.
    const ordenados = items
      .map((item, posicion) => ({ ...item, posicion }))
      .sort((a, b) => a.producto_id - b.producto_id);

    for (const { posicion, producto_id, cantidad, costo_unitario } of ordenados) {
      const stock = await productosRepository.sumarStock(client, producto_id, cantidad);
      if (stock === undefined) {
        throw datosInvalidos({
          [`items.${posicion}.producto_id`]: 'El producto no existe o está desactivado',
        });
      }
      await comprasRepository.insertarDetalle(client, compraId, {
        producto_id,
        cantidad,
        costo_unitario,
      });
      await inventarioRepository.registrarMovimiento(client, {
        producto_id,
        tipo: 'entrada',
        cantidad,
        stock_resultante: stock,
        referencia: `compra:${compraId}`,
        usuario_id: usuario.id,
      });
    }
    return compraId;
  });

  return comprasRepository.obtenerPorId(id);
}

async function listar({ pagina, limite, buscar }) {
  const desplazamiento = (pagina - 1) * limite;
  const { filas, total } = await comprasRepository.listar({ buscar, limite, desplazamiento });
  return { data: filas, total, pagina, limite };
}

async function obtenerPorId(id) {
  const compra = await comprasRepository.obtenerPorId(id);
  if (!compra) throw errorHttp(404, 'Compra no encontrada');
  return compra;
}

module.exports = { crear, listar, obtenerPorId };
