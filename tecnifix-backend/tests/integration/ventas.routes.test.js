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

  test('el vendedor solo recibe sus ventas', async () => {
    const { rows } = await pool.query("SELECT id FROM usuarios WHERE email = 'vendedor@tecnifix.pe'");
    const vendedor = autorizacion({ id: rows[0].id, rol: 'vendedor' });
    const otro = autorizacion({ id: 2147483647, rol: 'vendedor' });

    const creada = await request(app)
      .post('/ventas')
      .set('Authorization', vendedor)
      .send({ clienteId: null, items: [] });
    expect(creada.status).toBe(201);

    const propias = await request(app).get('/ventas').set('Authorization', vendedor);
    expect(propias.body.map((v) => v.id)).toContain(creada.body.id);
    expect(propias.body.every((v) => v.vendedor_id === rows[0].id)).toBe(true);

    const ajenas = await request(app).get('/ventas').set('Authorization', otro);
    expect(ajenas.body).toEqual([]);
    const detalle = await request(app).get(`/ventas/${creada.body.id}`).set('Authorization', otro);
    expect(detalle.status).toBe(404);
  });

  test.todo('registrar una venta guarda el detalle, el total y descuenta stock');
});
