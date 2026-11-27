const request = require('supertest');
const app = require('../../src/app');
const pool = require('../../src/config/database');
const { autorizacion } = require('../helpers/token');

// Cierra las conexiones para que Jest pueda terminar.
afterAll(() => pool.end());

describe('rutas de productos', () => {
  test('GET /productos es público y devuelve un arreglo', async () => {
    const res = await request(app).get('/productos');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('POST /productos exige sesión', async () => {
    const res = await request(app).post('/productos').send({});
    expect(res.status).toBe(401);
  });

  test('crea, consulta, actualiza y elimina', async () => {
    const auth = autorizacion();
    const datos = { nombre: 'Cable de prueba', descripcion: 'USB-C', precio: 15, stock: 3 };

    const creado = await request(app).post('/productos').set('Authorization', auth).send(datos);
    expect(creado.status).toBe(201);
    const ruta = `/productos/${creado.body.id}`;

    const leido = await request(app).get(ruta).set('Authorization', auth);
    expect(leido.body.nombre).toBe(datos.nombre);

    const actualizado = await request(app)
      .put(ruta)
      .set('Authorization', auth)
      .send({ ...datos, ...{ stock: 9 } });
    expect(actualizado.body).toMatchObject({ stock: 9 });

    const borrado = await request(app).delete(ruta).set('Authorization', auth);
    expect(borrado.status).toBe(204);
  });

  test.todo('responde 404 si no existe (hoy responde 400)');
  test.todo('comprueba el rol del usuario');
});
