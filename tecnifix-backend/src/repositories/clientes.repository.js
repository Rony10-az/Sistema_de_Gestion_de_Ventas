// Única capa que ejecuta SQL para la tabla "clientes" y el historial de ventas de un cliente.

const pool = require('../config/database');

const COLUMNAS = 'id, tipo_documento, documento, nombre, telefono, email, direccion';

// Los caracteres % y _ son comodines en ILIKE: se escapan para buscarlos tal cual.
const patron = (texto) => `%${texto.replace(/[\\%_]/g, '\\$&')}%`;

async function listar({ buscar, limite, desplazamiento }) {
  const filtro = patron(buscar);
  const donde = 'WHERE documento ILIKE $1 OR nombre ILIKE $1';
  const [filas, conteo] = await Promise.all([
    pool.query(
      `SELECT ${COLUMNAS} FROM clientes ${donde} ORDER BY nombre, id LIMIT $2 OFFSET $3`,
      [filtro, limite, desplazamiento]
    ),
    pool.query(`SELECT COUNT(*)::int AS total FROM clientes ${donde}`, [filtro]),
  ]);
  return { filas: filas.rows, total: conteo.rows[0].total };
}

async function obtenerPorId(id) {
  const { rows } = await pool.query(`SELECT ${COLUMNAS} FROM clientes WHERE id = $1`, [id]);
  return rows[0];
}

async function obtenerPorDocumento(documento) {
  const { rows } = await pool.query(`SELECT ${COLUMNAS} FROM clientes WHERE documento = $1`, [
    documento,
  ]);
  return rows[0];
}

async function crear({ tipo_documento, documento, nombre, telefono, email, direccion }) {
  const { rows } = await pool.query(
    `INSERT INTO clientes (tipo_documento, documento, nombre, telefono, email, direccion)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING ${COLUMNAS}`,
    [tipo_documento, documento, nombre, telefono ?? null, email ?? null, direccion ?? null]
  );
  return rows[0];
}

async function actualizar(
  id,
  { tipo_documento, documento, nombre, telefono, email, direccion }
) {
  const { rows } = await pool.query(
    `UPDATE clientes
     SET tipo_documento = $1, documento = $2, nombre = $3, telefono = $4, email = $5, direccion = $6
     WHERE id = $7 RETURNING ${COLUMNAS}`,
    [tipo_documento, documento, nombre, telefono ?? null, email ?? null, direccion ?? null, id]
  );
  return rows[0];
}

async function eliminar(id) {
  await pool.query('DELETE FROM clientes WHERE id = $1', [id]);
}

// vendedorId = null trae las ventas de todos los vendedores.
async function listarVentas({ clienteId, vendedorId, limite, desplazamiento }) {
  const donde = 'WHERE cliente_id = $1 AND ($2::int IS NULL OR vendedor_id = $2::int)';
  const [filas, conteo] = await Promise.all([
    pool.query(
      `SELECT id, serie_numero, tipo_comprobante, total::float8 AS total, estado, fecha
       FROM ventas ${donde} ORDER BY fecha DESC, id DESC LIMIT $3 OFFSET $4`,
      [clienteId, vendedorId, limite, desplazamiento]
    ),
    pool.query(`SELECT COUNT(*)::int AS total FROM ventas ${donde}`, [clienteId, vendedorId]),
  ]);
  return { filas: filas.rows, total: conteo.rows[0].total };
}

module.exports = {
  listar,
  obtenerPorId,
  obtenerPorDocumento,
  crear,
  actualizar,
  eliminar,
  listarVentas,
};
