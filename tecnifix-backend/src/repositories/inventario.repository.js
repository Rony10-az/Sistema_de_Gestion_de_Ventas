// Única capa que ejecuta SQL para el kardex (tabla "movimientos_inventario").

const pool = require('../config/database');

const COLUMNAS = `id, producto_id, tipo, cantidad, stock_resultante,
  referencia, motivo, usuario_id, fecha`;

// Ejecuta la operación en una sola transacción: se guarda todo o nada.
async function enTransaccion(operacion) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const resultado = await operacion(client);
    await client.query('COMMIT');
    return resultado;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

// Se llama siempre dentro de la transacción que cambia el stock (client).
// La cantidad lleva signo: positiva si el stock sube y negativa si baja.
async function registrarMovimiento(client, movimiento) {
  const {
    producto_id,
    tipo,
    cantidad,
    stock_resultante,
    referencia = null,
    motivo = null,
    usuario_id,
  } = movimiento;
  const { rows } = await client.query(
    `INSERT INTO movimientos_inventario
       (producto_id, tipo, cantidad, stock_resultante, referencia, motivo, usuario_id)
     VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING ${COLUMNAS}`,
    [producto_id, tipo, cantidad, stock_resultante, referencia, motivo, usuario_id]
  );
  return rows[0];
}

// Kardex de un producto, del movimiento más reciente al más antiguo.
async function listarPorProducto(productoId, { limite, desplazamiento }) {
  const [filas, conteo] = await Promise.all([
    pool.query(
      `SELECT m.id, m.producto_id, m.tipo, m.cantidad, m.stock_resultante,
              m.referencia, m.motivo, m.usuario_id, u.nombre AS usuario_nombre, m.fecha
       FROM movimientos_inventario m
       JOIN usuarios u ON u.id = m.usuario_id
       WHERE m.producto_id = $1
       ORDER BY m.id DESC LIMIT $2 OFFSET $3`,
      [productoId, limite, desplazamiento]
    ),
    pool.query(
      'SELECT COUNT(*)::int AS total FROM movimientos_inventario WHERE producto_id = $1',
      [productoId]
    ),
  ]);
  return { filas: filas.rows, total: conteo.rows[0].total };
}

module.exports = { enTransaccion, registrarMovimiento, listarPorProducto };
