// Única capa que ejecuta SQL para el kardex (tabla "movimientos_inventario").

// Se llama siempre dentro de la transacción que cambia el stock (client).
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
  await client.query(
    `INSERT INTO movimientos_inventario
       (producto_id, tipo, cantidad, stock_resultante, referencia, motivo, usuario_id)
     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [producto_id, tipo, cantidad, stock_resultante, referencia, motivo, usuario_id]
  );
}

module.exports = { registrarMovimiento };
