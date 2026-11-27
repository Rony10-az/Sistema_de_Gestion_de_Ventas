// Requiere la migración con las tablas "categorias" y "productos" del modelo.

const request = require('supertest');
const app = require('../../src/app');
const pool = require('../../src/config/database');
const categorias = require('../../src/repositories/categorias.repository');
const { autorizacion } = require('../helpers/token');

// Cierra las conexiones para que Jest pueda terminar.
afterAll(() => pool.end());

describe('rutas de productos', () => {
  test('GET /productos devuelve un listado paginado', async () => {
    const res = await request(app).get('/productos').set('Authorization', autorizacion());
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ pagina: 1, limite: 10 });
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  test('POST /productos exige sesión', async () => {
    const res = await request(app).post('/productos').send({});
    expect(res.status).toBe(401);
  });

  test('crea, consulta, actualiza y desactiva', async () => {
    const auth = autorizacion();
    const marca = Date.now();
    const categoria = await categorias.crear({ nombre: `Prueba ${marca}` });
    const datos = {
      sku: `PRU-${marca}`,
      nombre: 'Cable de prueba',
      categoria_id: categoria.id,
      precio_compra: 8,
      precio_venta: 15.5,
      stock_minimo: 2,
    };

    const creado = await request(app).post('/productos').set('Authorization', auth).send(datos);
    expect(creado.status).toBe(201);
    expect(creado.body).toMatchObject({ stock: 0, activo: true, precio_venta: 15.5 });
    const ruta = `/productos/${creado.body.id}`;

    const actualizado = await request(app)
      .put(ruta)
      .set('Authorization', auth)
      .send({ ...datos, nombre: 'Cable editado' });
    expect(actualizado.body.nombre).toBe('Cable editado');

    const borrado = await request(app).delete(ruta).set('Authorization', auth);
    expect(borrado.status).toBe(204);

    const leido = await request(app).get(ruta).set('Authorization', auth);
    expect(leido.body.activo).toBe(false);
  });
});
