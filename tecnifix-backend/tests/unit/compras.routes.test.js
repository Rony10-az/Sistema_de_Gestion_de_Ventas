// Prueba rutas, roles y validación sin base de datos.

jest.mock('../../src/services/compras.service');
const express = require('express');
const request = require('supertest');
const service = require('../../src/services/compras.service');
const router = require('../../src/routes/compras.routes');
const errorMiddleware = require('../../src/middlewares/error.middleware');
const { autorizacion } = require('../helpers/token');

const app = express();
app.use(express.json());
app.use('/compras', router);
app.use(errorMiddleware);

const linea = { producto_id: 1, cantidad: 2, costo_unitario: 8.5 };
const datos = { proveedor_id: 1, items: [linea] };
const como = (rol) => autorizacion({ rol });
const crear = (cuerpo, rol = 'admin') =>
  request(app).post('/compras').set('Authorization', como(rol)).send(cuerpo);

describe('rutas de compras', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    service.crear.mockResolvedValue({ id: 1 });
    service.listar.mockResolvedValue({ data: [], total: 0, pagina: 1, limite: 5 });
  });

  test('sin sesión responde 401', async () => {
    const res = await request(app).get('/compras');
    expect(res.status).toBe(401);
  });

  test.each(['/compras', '/compras/1'])('el vendedor no accede a %s', async (ruta) => {
    const res = await request(app).get(ruta).set('Authorization', como('vendedor'));
    expect(res.status).toBe(403);
  });

  test('el vendedor no registra compras', async () => {
    const res = await crear(datos, 'vendedor');
    expect(res.status).toBe(403);
    expect(service.crear).not.toHaveBeenCalled();
  });

  test('acepta ?limite= para el dashboard', async () => {
    await request(app).get('/compras?limite=5').set('Authorization', como('almacenero'));
    expect(service.listar).toHaveBeenCalledWith({ pagina: 1, limite: 5, buscar: '' });
  });

  test.each(['admin', 'almacenero'])('el rol %s registra y se ignora el total', async (rol) => {
    const res = await crear({ ...datos, total: 1 }, rol);

    expect(res.status).toBe(201);
    expect(service.crear).toHaveBeenCalledWith(datos, expect.objectContaining({ rol }));
  });

  test.each([
    ['proveedor_id', { items: [linea] }],
    ['items', { proveedor_id: 1 }],
    ['items', { proveedor_id: 1, items: [] }],
    ['items', { proveedor_id: 1, items: [linea, linea] }],
    ['items.0', { proveedor_id: 1, items: [null] }],
    ['items.0.cantidad', { proveedor_id: 1, items: [{ ...linea, cantidad: 0 }] }],
    ['items.0.cantidad', { proveedor_id: 1, items: [{ ...linea, cantidad: 1.5 }] }],
    ['items.0.costo_unitario', { proveedor_id: 1, items: [{ ...linea, costo_unitario: 0 }] }],
  ])('datos inválidos señalan %s', async (campo, cuerpo) => {
    const res = await crear(cuerpo);

    expect(res.status).toBe(400);
    expect(Object.keys(res.body.campos)).toContain(campo);
    expect(service.crear).not.toHaveBeenCalled();
  });
});
