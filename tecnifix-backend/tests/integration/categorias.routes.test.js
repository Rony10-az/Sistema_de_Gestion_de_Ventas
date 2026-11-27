// Categorías contra la base de pruebas. Monta solo su router para no depender
// del orden de registro en routes/index.js.

const express = require('express');
const request = require('supertest');
const pool = require('../../src/config/database');
const router = require('../../src/routes/categorias.routes');
const errorMiddleware = require('../../src/middlewares/error.middleware');
const { autorizacion } = require('../helpers/token');

const app = express();
app.use(express.json());
app.use('/categorias', router);
app.use(errorMiddleware);

afterAll(() => pool.end());

describe('categorías contra la base', () => {
  const marca = Date.now();
  const nombre = `Cables ${marca}`;
  const auth = autorizacion({ rol: 'almacenero' });
  let id;

  const crear = (datos) => request(app).post('/categorias').set('Authorization', auth).send(datos);
  const editar = (destino, datos) =>
    request(app).put(`/categorias/${destino}`).set('Authorization', auth).send(datos);
  const buscar = (texto) =>
    request(app).get('/categorias').query({ buscar: texto }).set('Authorization', auth);

  test('crea una categoría y la encuentra al buscar', async () => {
    const res = await crear({ nombre });

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ nombre });
    id = res.body.id;

    const lista = await buscar(nombre);
    expect(lista.body).toEqual({ data: [{ id, nombre }], total: 1, pagina: 1, limite: 10 });
  });

  test('no repite el nombre aunque cambien las mayúsculas', async () => {
    const res = await crear({ nombre: nombre.toUpperCase() });

    expect(res.status).toBe(409);
  });

  test('edita el nombre y rechaza el de otra categoría', async () => {
    const otra = await crear({ nombre: `Cargadores ${marca}` });

    const editada = await editar(id, { nombre: `Adaptadores ${marca}` });
    expect(editada.status).toBe(200);
    expect(editada.body).toEqual({ id, nombre: `Adaptadores ${marca}` });

    const repetida = await editar(otra.body.id, { nombre: `adaptadores ${marca}` });
    expect(repetida.status).toBe(409);
  });

  test('responde 404 al editar una que no existe', async () => {
    const res = await editar(2147483647, { nombre: 'No existe' });

    expect(res.status).toBe(404);
  });

  test('busca los comodines como texto normal', async () => {
    const res = await buscar(`%${marca}`);

    expect(res.body.total).toBe(0);
  });
});
