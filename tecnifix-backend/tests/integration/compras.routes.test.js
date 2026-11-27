// Requiere la migración con las tablas del modelo. Monta solo el router de
// compras para no depender del orden de registro en routes/index.js.

const express = require('express');
const request = require('supertest');
const pool = require('../../src/config/database');
const categorias = require('../../src/repositories/categorias.repository');
const proveedores = require('../../src/repositories/proveedores.repository');
const productos = require('../../src/repositories/productos.repository');
const router = require('../../src/routes/compras.routes');
const errorMiddleware = require('../../src/middlewares/error.middleware');
const { autorizacion } = require('../helpers/token');

const app = express();
app.use(express.json());
app.use('/compras', router);
app.use(errorMiddleware);

afterAll(() => pool.end());

describe('compras contra la base', () => {
  const marca = Date.now();
  let auth;
  let proveedor;
  let producto;

  beforeAll(async () => {
    const { rows } = await pool.query(
      `INSERT INTO usuarios (nombre, email, password_hash, rol)
       VALUES ('Prueba', $1, 'sin-clave', 'almacenero') RETURNING id`,
      [`compras${marca}@example.com`]
    );
    auth = autorizacion({ id: rows[0].id, rol: 'almacenero' });

    const categoria = await categorias.crear({ nombre: `Compras ${marca}` });
    proveedor = await proveedores.crear({
      ruc: `20${String(marca).slice(-9)}`,
      razon_social: 'Proveedor de prueba',
      telefono: null,
    });
    producto = await productos.crear({
      sku: `COM-${marca}`,
      nombre: 'Producto de compra',
      categoria_id: categoria.id,
      precio_compra: 5,
      precio_venta: 9,
      stock_minimo: 1,
    });
  });

  const comprar = (items) =>
    request(app)
      .post('/compras')
      .set('Authorization', auth)
      .send({ proveedor_id: proveedor.id, items });

  const stockActual = async () => (await productos.obtenerPorId(producto.id)).stock;

  const movimientos = async () => {
    const { rows } = await pool.query(
      'SELECT * FROM movimientos_inventario WHERE producto_id = $1 ORDER BY id',
      [producto.id]
    );
    return rows;
  };

  test('una compra sube el stock y queda en el kardex', async () => {
    const res = await comprar([{ producto_id: producto.id, cantidad: 4, costo_unitario: 5.25 }]);

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ total: 21, items: [{ cantidad: 4, subtotal: 21 }] });
    expect(await stockActual()).toBe(4);
    expect(await movimientos()).toMatchObject([
      { tipo: 'entrada', cantidad: 4, stock_resultante: 4, referencia: `compra:${res.body.id}` },
    ]);
  });

  test('si una línea falla no se guarda nada', async () => {
    const antes = await request(app).get('/compras').set('Authorization', auth);

    const res = await comprar([
      { producto_id: producto.id, cantidad: 3, costo_unitario: 5 },
      { producto_id: 2147483647, cantidad: 1, costo_unitario: 5 },
    ]);

    expect(res.status).toBe(400);
    expect(await stockActual()).toBe(4);
    expect(await movimientos()).toHaveLength(1);
    const despues = await request(app).get('/compras').set('Authorization', auth);
    expect(despues.body.total).toBe(antes.body.total);
  });

  test('dos compras simultáneas suman las dos', async () => {
    const items = [{ producto_id: producto.id, cantidad: 1, costo_unitario: 5 }];
    const respuestas = await Promise.all([comprar(items), comprar(items)]);

    expect(respuestas.map((res) => res.status)).toEqual([201, 201]);
    expect(await stockActual()).toBe(6);
  });
});
