// Prueba rutas, roles y validación sin base de datos.

jest.mock('../../src/services/inventario.service');
const request = require('supertest');
const service = require('../../src/services/inventario.service');
const app = require('../../src/app');
const { autorizacion } = require('../helpers/token');

const datos = { producto_id: 1, cantidad: -3, motivo: 'Conteo físico' };
const como = (rol) => autorizacion({ rol });
const ajustar = (cuerpo, rol = 'admin') =>
  request(app).post('/inventario/ajustes').set('Authorization', como(rol)).send(cuerpo);

describe('rutas de inventario', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    service.ajustar.mockResolvedValue({ id: 1 });
    service.listarMovimientos.mockResolvedValue({ data: [], total: 0, pagina: 1, limite: 10 });
  });

  test('sin sesión responde 401', async () => {
    const res = await request(app).post('/inventario/ajustes').send(datos);
    expect(res.status).toBe(401);
  });

  test('el admin ajusta el stock', async () => {
    const res = await ajustar(datos);
    expect(res.status).toBe(201);
    expect(service.ajustar).toHaveBeenCalledWith(datos, expect.objectContaining({ rol: 'admin' }));
  });

  test.each(['vendedor', 'almacenero'])('el rol %s no ajusta stock', async (rol) => {
    const res = await ajustar(datos, rol);
    expect(res.status).toBe(403);
    expect(service.ajustar).not.toHaveBeenCalled();
  });

  test.each([
    ['producto_id', undefined],
    ['cantidad', 0],
    ['cantidad', 1.5],
    ['cantidad', '3'],
    ['motivo', 'abc'],
    ['motivo', 'a'.repeat(201)],
  ])('%s con valor %j responde 400', async (campo, valor) => {
    const res = await ajustar({ ...datos, [campo]: valor });
    expect(res.status).toBe(400);
    expect(res.body.campos).toHaveProperty(campo);
  });

  test.each(['admin', 'almacenero'])('el rol %s consulta el kardex', async (rol) => {
    const res = await request(app)
      .get('/productos/1/movimientos')
      .set('Authorization', como(rol));
    expect(res.status).toBe(200);
    expect(service.listarMovimientos).toHaveBeenCalledWith(1, { pagina: 1, limite: 10 });
  });

  test('el vendedor no consulta el kardex', async () => {
    const res = await request(app)
      .get('/productos/1/movimientos')
      .set('Authorization', como('vendedor'));
    expect(res.status).toBe(403);
  });
});
