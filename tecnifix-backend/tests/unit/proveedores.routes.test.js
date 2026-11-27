// Prueba rutas, roles y validación sin base de datos: monta solo el router
// de proveedores y simula el repositorio.

jest.mock('../../src/repositories/proveedores.repository');
const express = require('express');
const request = require('supertest');
const repository = require('../../src/repositories/proveedores.repository');
const router = require('../../src/routes/proveedores.routes');
const errorMiddleware = require('../../src/middlewares/error.middleware');
const { autorizacion } = require('../helpers/token');

const app = express();
app.use(express.json());
app.use('/proveedores', router);
app.use(errorMiddleware);

const datos = { ruc: '20123456789', razon_social: 'Distribuidora de prueba' };

const crear = (cuerpo, rol = 'admin') =>
  request(app).post('/proveedores').set('Authorization', autorizacion({ rol })).send(cuerpo);

describe('rutas de proveedores', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    repository.listar.mockResolvedValue({ filas: [], total: 0 });
    repository.crear.mockImplementation(async (nuevo) => ({ id: 1, ...nuevo }));
  });

  test('sin sesión responde 401', async () => {
    const res = await request(app).get('/proveedores');
    expect(res.status).toBe(401);
  });

  test.each(['admin', 'vendedor', 'almacenero'])('el rol %s puede listar', async (rol) => {
    const res = await request(app)
      .get('/proveedores')
      .set('Authorization', autorizacion({ rol }));
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ data: [], total: 0, pagina: 1, limite: 10 });
  });

  test.each(['admin', 'almacenero'])('el rol %s puede crear', async (rol) => {
    const res = await crear({ ...datos, telefono: '987654321' }, rol);
    expect(res.status).toBe(201);
    expect(res.body).toEqual({ id: 1, ...datos, telefono: '987654321' });
  });

  test('el vendedor no puede crear', async () => {
    const res = await crear(datos, 'vendedor');
    expect(res.status).toBe(403);
    expect(repository.crear).not.toHaveBeenCalled();
  });

  test.each([undefined, null, ''])('el teléfono %j se guarda como null', async (telefono) => {
    const res = await crear({ ...datos, telefono });
    expect(res.status).toBe(201);
    expect(res.body.telefono).toBeNull();
  });

  test.each([
    ['ruc', undefined],
    ['ruc', '2012345678'],
    ['ruc', '30123456789'],
    ['ruc', '2012345678a'],
    ['razon_social', '  '],
    ['razon_social', 'a'.repeat(151)],
    ['telefono', '12345'],
    ['telefono', 987654321],
  ])('%s con valor %j responde 400', async (campo, valor) => {
    const res = await crear({ ...datos, [campo]: valor });
    expect(res.status).toBe(400);
    expect(res.body.campos).toHaveProperty(campo);
    expect(repository.crear).not.toHaveBeenCalled();
  });

  test('editar un proveedor que no existe responde 404', async () => {
    const res = await request(app)
      .put('/proveedores/99')
      .set('Authorization', autorizacion())
      .send(datos);
    expect(res.status).toBe(404);
  });
});
