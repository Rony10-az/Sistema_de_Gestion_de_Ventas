// Única capa que ejecuta SQL para la tabla "proveedores".

const pool = require('../config/database');

const COLUMNAS = 'id, ruc, razon_social, telefono';
const FILTRO = 'WHERE razon_social ILIKE $1 OR ruc ILIKE $1';

// Los caracteres % y _ son comodines en ILIKE: se escapan para buscarlos tal cual.
const patron = (texto) => `%${texto.replace(/[\\%_]/g, '\\$&')}%`;

async function listar({ buscar, limite, desplazamiento }) {
  const filtro = patron(buscar);
  const [filas, conteo] = await Promise.all([
    pool.query(
      `SELECT ${COLUMNAS} FROM proveedores ${FILTRO}
       ORDER BY razon_social, id LIMIT $2 OFFSET $3`,
      [filtro, limite, desplazamiento]
    ),
    pool.query(`SELECT COUNT(*)::int AS total FROM proveedores ${FILTRO}`, [filtro]),
  ]);
  return { filas: filas.rows, total: conteo.rows[0].total };
}

async function obtenerPorId(id) {
  const { rows } = await pool.query(`SELECT ${COLUMNAS} FROM proveedores WHERE id = $1`, [id]);
  return rows[0];
}

async function obtenerPorRuc(ruc) {
  const { rows } = await pool.query(`SELECT ${COLUMNAS} FROM proveedores WHERE ruc = $1`, [ruc]);
  return rows[0];
}

async function crear({ ruc, razon_social, telefono }) {
  const { rows } = await pool.query(
    `INSERT INTO proveedores (ruc, razon_social, telefono)
     VALUES ($1, $2, $3) RETURNING ${COLUMNAS}`,
    [ruc, razon_social, telefono]
  );
  return rows[0];
}

async function actualizar(id, { ruc, razon_social, telefono }) {
  const { rows } = await pool.query(
    `UPDATE proveedores SET ruc = $1, razon_social = $2, telefono = $3
     WHERE id = $4 RETURNING ${COLUMNAS}`,
    [ruc, razon_social, telefono, id]
  );
  return rows[0];
}

module.exports = { listar, obtenerPorId, obtenerPorRuc, crear, actualizar };
