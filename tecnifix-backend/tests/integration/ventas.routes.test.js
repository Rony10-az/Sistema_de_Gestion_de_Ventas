const request = require('supertest');
const app = require('../../src/app');
const pool = require('../../src/config/database');
const { autorizacion } = require('../helpers/token');

// Cierra las conexiones para que Jest pueda terminar.
afterAll(() => pool.end());

describe('rutas de ventas', () => {
  test('GET /ventas exige sesión', async () => {
    const res = await request(app).get('/ventas');
    expect(res.status).toBe(401);
  });

  test('GET /ventas con sesión devuelve un arreglo', async () => {
    const res = await request(app).get('/ventas').set('Authorization', autorizacion());
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test.todo('registrar una venta guarda el detalle, el total y descuenta stock');
});
