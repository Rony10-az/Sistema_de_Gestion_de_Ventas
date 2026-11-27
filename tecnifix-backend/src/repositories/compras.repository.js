// Única capa que ejecuta SQL para las tablas "compras" y "compra_detalle".

const pool = require('../config/database');
const { enTransaccion } = require('./inventario.repository');

const SELECCION = `
  SELECT c.id, c.proveedor_id, p.razon_social AS proveedor_nombre,
         c.usuario_id, u.nombre AS usuario_nombre,
         c.total::float8 AS total, c.fecha
  FROM compras c
  JOIN proveedores p ON p.id = c.proveedor_id
  JOIN usuarios u ON u.id = c.usuario_id`;

async function insertarCompra(client, { proveedor_id, usuario_id, total }) {
  const { rows } = await client.query(
    'INSERT INTO compras (proveedor_id, usuario_id, total) VALUES ($1, $2, $3) RETURNING id',
    [proveedor_id, usuario_id, total]
  );
  return rows[0].id;
}

async function insertarDetalle(client, compraId, { producto_id, cantidad, costo_unitario }) {
  await client.query(
    `INSERT INTO compra_detalle (compra_id, producto_id, cantidad, costo_unitario)
     VALUES ($1, $2, $3, $4)`,
    [compraId, producto_id, cantidad, costo_unitario]
  );
}

// Los caracteres % y _ son comodines en ILIKE: se escapan para buscarlos tal cual.
const patron = (texto) => `%${texto.replace(/[\\%_]/g, '\\$&')}%`;

async function listar({ buscar, limite, desplazamiento }) {
  const filtro = patron(buscar);
  const [filas, conteo] = await Promise.all([
    pool.query(
      `${SELECCION} WHERE p.razon_social ILIKE $1
       ORDER BY c.fecha DESC, c.id DESC LIMIT $2 OFFSET $3`,
      [filtro, limite, desplazamiento]
    ),
    pool.query(
      `SELECT COUNT(*)::int AS total FROM compras c
       JOIN proveedores p ON p.id = c.proveedor_id
       WHERE p.razon_social ILIKE $1`,
      [filtro]
    ),
  ]);
  return { filas: filas.rows, total: conteo.rows[0].total };
}

async function obtenerPorId(id) {
  const { rows } = await pool.query(`${SELECCION} WHERE c.id = $1`, [id]);
  if (!rows[0]) return undefined;

  const detalle = await pool.query(
    `SELECT d.id, d.producto_id, pr.sku, pr.nombre AS producto_nombre, d.cantidad,
            d.costo_unitario::float8 AS costo_unitario,
            (d.cantidad * d.costo_unitario)::float8 AS subtotal
     FROM compra_detalle d
     JOIN productos pr ON pr.id = d.producto_id
     WHERE d.compra_id = $1
     ORDER BY d.id`,
    [id]
  );
  return { ...rows[0], items: detalle.rows };
}

module.exports = { enTransaccion, insertarCompra, insertarDetalle, listar, obtenerPorId };
