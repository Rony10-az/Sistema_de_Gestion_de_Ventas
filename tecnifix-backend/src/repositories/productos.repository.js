// Única capa que ejecuta SQL para la tabla "productos".

const pool = require('../config/database');

// Los NUMERIC se convierten a float8 para que la API responda números y no texto.
const SELECCION = `
  SELECT p.id, p.sku, p.nombre, p.categoria_id, c.nombre AS categoria_nombre,
         p.precio_compra::float8 AS precio_compra, p.precio_venta::float8 AS precio_venta,
         p.stock, p.stock_minimo, p.activo
  FROM productos p
  JOIN categorias c ON c.id = p.categoria_id`;

// Los caracteres % y _ son comodines en ILIKE: se escapan para buscarlos tal cual.
const patron = (texto) => `%${texto.replace(/[\\%_]/g, '\\$&')}%`;

// Arma el WHERE según los filtros. Los valores siempre viajan como parámetros.
function condiciones({ buscar, categoria, stockBajo, soloActivos }) {
  const valores = [patron(buscar)];
  const partes = ['(p.nombre ILIKE $1 OR p.sku ILIKE $1)'];

  if (categoria) {
    valores.push(categoria);
    partes.push(`p.categoria_id = $${valores.length}`);
  }
  if (stockBajo) partes.push('p.stock <= p.stock_minimo');
  // Un producto desactivado ya no se repone, así que no genera alerta.
  if (soloActivos || stockBajo) partes.push('p.activo');

  return { donde: `WHERE ${partes.join(' AND ')}`, valores };
}

async function listar({ limite, desplazamiento, ...filtros }) {
  const { donde, valores } = condiciones(filtros);
  const n = valores.length;
  const [filas, conteo] = await Promise.all([
    pool.query(
      `${SELECCION} ${donde} ORDER BY p.nombre, p.id LIMIT $${n + 1} OFFSET $${n + 2}`,
      [...valores, limite, desplazamiento]
    ),
    pool.query(`SELECT COUNT(*)::int AS total FROM productos p ${donde}`, valores),
  ]);
  return { filas: filas.rows, total: conteo.rows[0].total };
}

async function obtenerPorId(id) {
  const { rows } = await pool.query(`${SELECCION} WHERE p.id = $1`, [id]);
  return rows[0];
}

async function obtenerPorSku(sku) {
  const { rows } = await pool.query('SELECT id FROM productos WHERE UPPER(sku) = UPPER($1)', [sku]);
  return rows[0];
}

// Todo producto nace con stock 0: solo cambia con compras, ventas y ajustes.
async function crear({ sku, nombre, categoria_id, precio_compra, precio_venta, stock_minimo }) {
  const { rows } = await pool.query(
    `INSERT INTO productos
       (sku, nombre, categoria_id, precio_compra, precio_venta, stock, stock_minimo)
     VALUES ($1, $2, $3, $4, $5, 0, $6) RETURNING id`,
    [sku, nombre, categoria_id, precio_compra, precio_venta, stock_minimo]
  );
  return obtenerPorId(rows[0].id);
}

// Los precios y "activo" que no llegan conservan su valor. El stock no se toca.
async function actualizar(id, datos) {
  const { sku, nombre, categoria_id, precio_compra, precio_venta, stock_minimo, activo } = datos;
  await pool.query(
    `UPDATE productos SET sku = $1, nombre = $2, categoria_id = $3,
       precio_compra = COALESCE($4, precio_compra), precio_venta = COALESCE($5, precio_venta),
       stock_minimo = $6, activo = COALESCE($7, activo)
     WHERE id = $8`,
    [sku, nombre, categoria_id, precio_compra, precio_venta, stock_minimo, activo, id]
  );
  return obtenerPorId(id);
}

// No se borra la fila: las ventas y compras anteriores la siguen usando.
async function desactivar(id) {
  await pool.query('UPDATE productos SET activo = FALSE WHERE id = $1', [id]);
}

// Suma stock dentro de la transacción de quien llama (client). El UPDATE bloquea
// la fila hasta el COMMIT. Devuelve undefined si el producto no existe o está
// desactivado.
async function sumarStock(client, id, cantidad) {
  const { rows } = await client.query(
    'UPDATE productos SET stock = stock + $2 WHERE id = $1 AND activo RETURNING stock',
    [id, cantidad]
  );
  return rows[0]?.stock;
}

module.exports = {
  listar,
  obtenerPorId,
  obtenerPorSku,
  crear,
  actualizar,
  desactivar,
  sumarStock,
};
