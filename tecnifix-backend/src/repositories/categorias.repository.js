// Única capa que ejecuta SQL para la tabla "categorias".

const pool = require('../config/database');

// Los caracteres % y _ son comodines en ILIKE: se escapan para buscarlos tal cual.
const patron = (texto) => `%${texto.replace(/[\\%_]/g, '\\$&')}%`;

async function listar({ buscar, limite, desplazamiento }) {
  const filtro = patron(buscar);
  const [filas, conteo] = await Promise.all([
    pool.query(
      `SELECT id, nombre FROM categorias WHERE nombre ILIKE $1
       ORDER BY nombre, id LIMIT $2 OFFSET $3`,
      [filtro, limite, desplazamiento]
    ),
    pool.query('SELECT COUNT(*)::int AS total FROM categorias WHERE nombre ILIKE $1', [filtro]),
  ]);
  return { filas: filas.rows, total: conteo.rows[0].total };
}

async function obtenerPorId(id) {
  const { rows } = await pool.query('SELECT id, nombre FROM categorias WHERE id = $1', [id]);
  return rows[0];
}

// Compara sin distinguir mayúsculas: "Cables" y "cables" son la misma categoría.
async function obtenerPorNombre(nombre) {
  const { rows } = await pool.query(
    'SELECT id, nombre FROM categorias WHERE LOWER(nombre) = LOWER($1)',
    [nombre]
  );
  return rows[0];
}

async function crear({ nombre }) {
  const { rows } = await pool.query(
    'INSERT INTO categorias (nombre) VALUES ($1) RETURNING id, nombre',
    [nombre]
  );
  return rows[0];
}

async function actualizar(id, { nombre }) {
  const { rows } = await pool.query(
    'UPDATE categorias SET nombre = $1 WHERE id = $2 RETURNING id, nombre',
    [nombre, id]
  );
  return rows[0];
}

module.exports = { listar, obtenerPorId, obtenerPorNombre, crear, actualizar };
