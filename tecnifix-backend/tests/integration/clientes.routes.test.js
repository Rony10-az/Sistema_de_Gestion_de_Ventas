const request = require('supertest');
const app = require('../../src/app');
const pool = require('../../src/config/database');
const { autorizacion } = require('../helpers/token');

// Cierra las conexiones para que Jest pueda terminar.
afterAll(() => pool.end());

describe('rutas de clientes', () => {
  test('GET /clientes exige sesión', async () => {
    const res = await request(app).get('/clientes');
    expect(res.status).toBe(401);
  });

  test('crea, consulta, actualiza y elimina', async () => {
    const auth = autorizacion();
    const datos = { nombre: 'Cliente de prueba', email: 'c@example.com', telefono: '900000000', documento: `T${Date.now()}` };

    const creado = await request(app).post('/clientes').set('Authorization', auth).send(datos);
    expect(creado.status).toBe(201);
    const ruta = `/clientes/${creado.body.id}`;

    const leido = await request(app).get(ruta).set('Authorization', auth);
    expect(leido.body.nombre).toBe(datos.nombre);

    const actualizado = await request(app)
      .put(ruta)
      .set('Authorization', auth)
      .send({ ...datos, ...{ telefono: '911111111' } });
    expect(actualizado.body).toMatchObject({ telefono: '911111111' });

    const borrado = await request(app).delete(ruta).set('Authorization', auth);
    expect(borrado.status).toBe(204);
  });

  test.todo('responde 404 si no existe (hoy responde 400)');
  test.todo('comprueba el rol del usuario');
});
