// Prueba rutas, roles y validación sin base de datos: monta solo el router
// de categorías y simula el repositorio.

jest.mock('../../src/repositories/categorias.repository');
const express = require('express');
const request = require('supertest');
const repository = require('../../src/repositories/categorias.repository');
const router = require('../../src/routes/categorias.routes');
const errorMiddleware = require('../../src/middlewares/error.middleware');
const { autorizacion } = require('../helpers/token');

const app = express();
app.use(express.json());
app.use('/categorias', router);
app.use(errorMiddleware);

const como = (rol) => autorizacion({ rol });

describe('rutas de categorías', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    repository.listar.mockResolvedValue({ filas: [], total: 0 });
    repository.crear.mockImplementation(async ({ nombre }) => ({ id: 1, nombre }));
  });

  test('sin sesión responde 401', async () => {
    const res = await request(app).get('/categorias');
    expect(res.status).toBe(401);
  });

  test.each(['admin', 'vendedor', 'almacenero'])('el rol %s puede listar', async (rol) => {
    const res = await request(app).get('/categorias').set('Authorization', como(rol));
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ data: [], total: 0, pagina: 1, limite: 10 });
  });

  test('una paginación inválida usa los valores por defecto', async () => {
    const res = await request(app)
      .get('/categorias?pagina=-3&limite=5000')
      .set('Authorization', como('admin'));
    expect(res.body).toMatchObject({ pagina: 1, limite: 10 });
  });

  test.each(['admin', 'almacenero'])('el rol %s puede crear', async (rol) => {
    const res = await request(app)
      .post('/categorias')
      .set('Authorization', como(rol))
      .send({ nombre: '  Cargadores  ' });
    expect(res.status).toBe(201);
    expect(res.body).toEqual({ id: 1, nombre: 'Cargadores' });
  });

  test('el vendedor no puede crear ni editar', async () => {
    const creado = await request(app)
      .post('/categorias')
      .set('Authorization', como('vendedor'))
      .send({ nombre: 'Cargadores' });
    const editado = await request(app)
      .put('/categorias/1')
      .set('Authorization', como('vendedor'))
      .send({ nombre: 'Cargadores' });

    expect(creado.status).toBe(403);
    expect(editado.status).toBe(403);
    expect(repository.crear).not.toHaveBeenCalled();
    expect(repository.actualizar).not.toHaveBeenCalled();
  });

  test.each([{}, { nombre: '   ' }, { nombre: 'ab' }, { nombre: 'a'.repeat(61) }, { nombre: 5 }])(
    'datos inválidos %j responden 400 con el campo',
    async (datos) => {
      const res = await request(app)
        .post('/categorias')
        .set('Authorization', como('admin'))
        .send(datos);
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Datos inválidos');
      expect(res.body.campos).toHaveProperty('nombre');
      expect(repository.crear).not.toHaveBeenCalled();
    }
  );

  test('un id que no es número responde 400', async () => {
    const res = await request(app)
      .put('/categorias/abc')
      .set('Authorization', como('admin'))
      .send({ nombre: 'Cargadores' });
    expect(res.status).toBe(400);
    expect(res.body.campos).toHaveProperty('id');
  });

  test('editar una categoría que no existe responde 404', async () => {
    const res = await request(app)
      .put('/categorias/99')
      .set('Authorization', como('admin'))
      .send({ nombre: 'Cargadores' });
    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: 'Categoría no encontrada' });
  });
});
