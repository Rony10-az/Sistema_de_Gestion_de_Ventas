// Proveedores contra la base de pruebas. Monta solo su router para no depender
// del orden de registro en routes/index.js.

const express = require('express');
const request = require('supertest');
const pool = require('../../src/config/database');
const router = require('../../src/routes/proveedores.routes');
const errorMiddleware = require('../../src/middlewares/error.middleware');
const { autorizacion } = require('../helpers/token');

const app = express();
app.use(express.json());
app.use('/proveedores', router);
app.use(errorMiddleware);

afterAll(() => pool.end());

describe('proveedores contra la base', () => {
  const marca = Date.now();
  // Empieza con 10 para no chocar con los RUC "20..." que crean otras pruebas.
  const ruc = `10${String(marca).slice(-9)}`;
  const otroRuc = `10${String(marca + 1).slice(-9)}`;
  const datos = { ruc, razon_social: `Importaciones ${marca}`, telefono: '987654321' };
  const auth = autorizacion({ rol: 'almacenero' });
  let id;

  const crear = (cuerpo) => request(app).post('/proveedores').set('Authorization', auth).send(cuerpo);
  const editar = (destino, cuerpo) =>
    request(app).put(`/proveedores/${destino}`).set('Authorization', auth).send(cuerpo);
  const buscar = (texto) =>
    request(app).get('/proveedores').query({ buscar: texto }).set('Authorization', auth);

  test('crea un proveedor y lo encuentra por RUC o razón social', async () => {
    const res = await crear(datos);

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject(datos);
    id = res.body.id;

    for (const texto of [ruc, datos.razon_social.toLowerCase()]) {
      const lista = await buscar(texto);
      expect(lista.body).toMatchObject({ data: [{ id, ruc }], total: 1 });
    }
  });

  test('no repite el RUC', async () => {
    const res = await crear({ ruc, razon_social: 'Otra empresa' });

    expect(res.status).toBe(409);
  });

  test('al editar sin teléfono lo deja en null', async () => {
    const res = await editar(id, { ruc, razon_social: datos.razon_social });

    expect(res.status).toBe(200);
    expect(res.body.telefono).toBeNull();
  });

  test('no deja tomar el RUC de otro proveedor', async () => {
    const otro = await crear({ ruc: otroRuc, razon_social: 'Segundo proveedor' });

    const res = await editar(otro.body.id, { ruc, razon_social: 'Segundo proveedor' });

    expect(res.status).toBe(409);
  });

  test('responde 404 al editar uno que no existe', async () => {
    const res = await editar(2147483647, datos);

    expect(res.status).toBe(404);
  });
});
