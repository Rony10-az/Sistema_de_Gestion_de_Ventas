// Requiere las tablas del modelo en la base de pruebas.

const request = require('supertest');
const app = require('../../src/app');
const pool = require('../../src/config/database');
const categorias = require('../../src/repositories/categorias.repository');
const productos = require('../../src/repositories/productos.repository');
const { enTransaccion } = require('../../src/repositories/inventario.repository');
const service = require('../../src/services/inventario.service');
const { autorizacion } = require('../helpers/token');

afterAll(() => pool.end());

describe('inventario contra la base', () => {
  const marca = Date.now();
  let usuarioId;
  let auth;
  let producto;

  beforeAll(async () => {
    const { rows } = await pool.query(
      `INSERT INTO usuarios (nombre, email, password_hash, rol)
       VALUES ('Prueba', $1, 'sin-clave', 'admin') RETURNING id`,
      [`inventario${marca}@example.com`]
    );
    usuarioId = rows[0].id;
    auth = autorizacion({ id: usuarioId, rol: 'admin' });

    const categoria = await categorias.crear({ nombre: `Inventario ${marca}` });
    producto = await productos.crear({
      sku: `INV-${marca}`,
      nombre: 'Producto de inventario',
      categoria_id: categoria.id,
      precio_compra: 5,
      precio_venta: 9,
      stock_minimo: 1,
    });
  });

  const stockActual = async () => (await productos.obtenerPorId(producto.id)).stock;
  const ajustar = (cantidad) =>
    request(app)
      .post('/inventario/ajustes')
      .set('Authorization', auth)
      .send({ producto_id: producto.id, cantidad, motivo: 'Conteo físico' });
  const salida = (cantidad) =>
    enTransaccion((client) =>
      service.registrarSalida(client, {
        producto_id: producto.id,
        cantidad,
        referencia: 'venta:prueba',
        usuario_id: usuarioId,
      })
    );

  test('ajusta el stock y nunca lo deja negativo', async () => {
    expect((await ajustar(5)).status).toBe(201);
    expect((await ajustar(-6)).status).toBe(409);
    expect(await stockActual()).toBe(5);
  });

  test('dos ventas simultáneas no venden las mismas unidades', async () => {
    const resultados = await Promise.allSettled([salida(4), salida(4)]);

    expect(resultados.map((r) => r.status).sort()).toEqual(['fulfilled', 'rejected']);
    expect(resultados.find((r) => r.status === 'rejected').reason.status).toBe(409);
    expect(await stockActual()).toBe(1);
  });

  test('la devolución repone y el kardex muestra todo', async () => {
    await enTransaccion((client) =>
      service.registrarDevolucion(client, {
        producto_id: producto.id,
        cantidad: 4,
        referencia: 'venta:prueba',
        usuario_id: usuarioId,
      })
    );

    const res = await request(app)
      .get(`/productos/${producto.id}/movimientos`)
      .set('Authorization', auth);

    expect(await stockActual()).toBe(5);
    expect(res.body.total).toBe(3);
    expect(res.body.data.map((m) => [m.tipo, m.cantidad, m.stock_resultante])).toEqual([
      ['entrada', 4, 5],
      ['salida', -4, 1],
      ['ajuste', 5, 5],
    ]);
  });
});
