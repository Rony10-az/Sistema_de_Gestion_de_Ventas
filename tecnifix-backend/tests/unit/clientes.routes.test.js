// Prueba rutas, roles y validación sin base de datos: monta solo el router
// de clientes y simula el repositorio.

jest.mock('../../src/repositories/clientes.repository');
const express = require('express');
const request = require('supertest');
const repository = require('../../src/repositories/clientes.repository');
const router = require('../../src/routes/clientes.routes');
const errorMiddleware = require('../../src/middlewares/error.middleware');
const { autorizacion } = require('../helpers/token');

const app = express();
app.use(express.json());
app.use('/clientes', router);
app.use(errorMiddleware);

const como = (rol, id = 1) => autorizacion({ rol, id });

const dni = { tipo_documento: 'DNI', documento: '12345678', nombre: 'Ana Pérez' };
const ruc = {
  tipo_documento: 'RUC',
  documento: '20123456789',
  nombre: 'Tecnifix SAC',
  direccion: 'Av. Lima 123',
};

describe('rutas de clientes', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    repository.listar.mockResolvedValue({ filas: [], total: 0 });
    repository.crear.mockImplementation(async (datos) => ({ id: 1, ...datos }));
    repository.obtenerPorId.mockResolvedValue({ id: 1, ...dni });
    repository.listarVentas.mockResolvedValue({ filas: [], total: 0 });
  });

  test('sin sesión responde 401', async () => {
    const res = await request(app).get('/clientes');
    expect(res.status).toBe(401);
  });

  test('el almacenero no accede a ninguna ruta', async () => {
    const auth = como('almacenero');
    const respuestas = await Promise.all([
      request(app).get('/clientes').set('Authorization', auth),
      request(app).get('/clientes/1').set('Authorization', auth),
      request(app).get('/clientes/1/ventas').set('Authorization', auth),
      request(app).post('/clientes').set('Authorization', auth).send(dni),
      request(app).put('/clientes/1').set('Authorization', auth).send(dni),
      request(app).delete('/clientes/1').set('Authorization', auth),
    ]);
    respuestas.forEach((res) => expect(res.status).toBe(403));
  });

  test.each(['admin', 'vendedor'])('el rol %s puede listar con el formato del contrato', async (rol) => {
    const res = await request(app).get('/clientes').set('Authorization', como(rol));
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ data: [], total: 0, pagina: 1, limite: 10 });
  });

  test('una paginación inválida usa los valores por defecto y buscar largo se ignora', async () => {
    const res = await request(app)
      .get(`/clientes?pagina=-3&limite=5000&buscar=${'a'.repeat(61)}`)
      .set('Authorization', como('admin'));
    expect(res.body).toMatchObject({ pagina: 1, limite: 10 });
    expect(repository.listar).toHaveBeenCalledWith(expect.objectContaining({ buscar: '' }));
  });

  test('el límite máximo es 100', async () => {
    const res = await request(app).get('/clientes?limite=100').set('Authorization', como('admin'));
    expect(res.body.limite).toBe(100);
  });

  test.each(['admin', 'vendedor'])('el rol %s puede crear', async (rol) => {
    const res = await request(app).post('/clientes').set('Authorization', como(rol)).send(dni);
    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ id: 1, documento: '12345678' });
  });

  test('crear guarda los campos opcionales vacíos como NULL', async () => {
    await request(app)
      .post('/clientes')
      .set('Authorization', como('admin'))
      .send({ ...dni, telefono: '', email: '', direccion: '' });
    const { telefono, email, direccion } = repository.crear.mock.calls[0][0];
    expect([telefono, email, direccion]).toEqual([undefined, undefined, undefined]);
  });

  test('crea un cliente RUC con dirección', async () => {
    const res = await request(app).post('/clientes').set('Authorization', como('admin')).send(ruc);
    expect(res.status).toBe(201);
  });

  test.each([
    ['sin tipo de documento', { documento: '12345678', nombre: 'Ana Pérez' }, 'tipo_documento'],
    ['tipo desconocido', { ...dni, tipo_documento: 'CE' }, 'tipo_documento'],
    ['sin documento', { ...dni, documento: undefined }, 'documento'],
    ['DNI con 7 dígitos', { ...dni, documento: '1234567' }, 'documento'],
    ['DNI con letras', { ...dni, documento: '1234567a' }, 'documento'],
    ['RUC con 8 dígitos', { ...ruc, documento: '12345678' }, 'documento'],
    ['sin nombre', { ...dni, nombre: undefined }, 'nombre'],
    ['nombre corto', { ...dni, nombre: 'ab' }, 'nombre'],
    ['nombre largo', { ...dni, nombre: 'a'.repeat(151) }, 'nombre'],
    ['teléfono que no empieza con 9', { ...dni, telefono: '812345678' }, 'telefono'],
    ['teléfono de 8 dígitos', { ...dni, telefono: '91234567' }, 'telefono'],
    ['email mal escrito', { ...dni, email: 'no-es-email' }, 'email'],
    ['RUC sin dirección', { ...ruc, direccion: undefined }, 'direccion'],
    ['RUC con dirección vacía', { ...ruc, direccion: '  ' }, 'direccion'],
  ])('datos inválidos (%s) responden 400 con el campo', async (_caso, datos, campo) => {
    const res = await request(app).post('/clientes').set('Authorization', como('admin')).send(datos);
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Datos inválidos');
    expect(res.body.campos).toHaveProperty(campo);
    expect(repository.crear).not.toHaveBeenCalled();
  });

  test('un documento repetido responde 409', async () => {
    repository.obtenerPorDocumento.mockResolvedValue({ id: 5, ...dni });
    const res = await request(app).post('/clientes').set('Authorization', como('vendedor')).send(dni);
    expect(res.status).toBe(409);
    expect(res.body).toEqual({ error: 'Ya existe un cliente con ese documento' });
  });

  test('un id que no es número responde 400', async () => {
    const res = await request(app).get('/clientes/abc').set('Authorization', como('admin'));
    expect(res.status).toBe(400);
    expect(res.body.campos).toHaveProperty('id');
  });

  test('un cliente que no existe responde 404 al consultar, editar y borrar', async () => {
    repository.obtenerPorId.mockResolvedValue(undefined);
    const auth = como('admin');
    const respuestas = await Promise.all([
      request(app).get('/clientes/99').set('Authorization', auth),
      request(app).put('/clientes/99').set('Authorization', auth).send(dni),
      request(app).delete('/clientes/99').set('Authorization', auth),
      request(app).get('/clientes/99/ventas').set('Authorization', auth),
    ]);
    respuestas.forEach((res) => {
      expect(res.status).toBe(404);
      expect(res.body).toEqual({ error: 'Cliente no encontrado' });
    });
  });

  test('el vendedor no puede borrar', async () => {
    const res = await request(app).delete('/clientes/1').set('Authorization', como('vendedor'));
    expect(res.status).toBe(403);
    expect(repository.eliminar).not.toHaveBeenCalled();
  });

  test('el admin borra y recibe 204', async () => {
    const res = await request(app).delete('/clientes/1').set('Authorization', como('admin'));
    expect(res.status).toBe(204);
  });

  test('las ventas del vendedor se filtran por su id y las del admin no', async () => {
    await request(app).get('/clientes/1/ventas').set('Authorization', como('vendedor', 7));
    await request(app).get('/clientes/1/ventas').set('Authorization', como('admin', 1));

    expect(repository.listarVentas.mock.calls[0][0]).toMatchObject({ clienteId: 1, vendedorId: 7 });
    expect(repository.listarVentas.mock.calls[1][0]).toMatchObject({ clienteId: 1, vendedorId: null });
  });
});
