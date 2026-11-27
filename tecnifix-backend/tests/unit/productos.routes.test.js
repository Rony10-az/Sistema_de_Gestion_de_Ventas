// Prueba rutas, roles y validación sin base de datos.

jest.mock('../../src/repositories/productos.repository');
jest.mock('../../src/repositories/categorias.repository');
const request = require('supertest');
const repository = require('../../src/repositories/productos.repository');
const categorias = require('../../src/repositories/categorias.repository');
const app = require('../../src/app');
const { autorizacion } = require('../helpers/token');

const datos = {
  sku: 'cab-01',
  nombre: 'Cable USB-C',
  categoria_id: 1,
  precio_compra: 8.5,
  precio_venta: 15.9,
  stock_minimo: 5,
};

const como = (rol) => autorizacion({ rol });
const crear = (cuerpo, rol = 'admin') =>
  request(app).post('/productos').set('Authorization', como(rol)).send(cuerpo);

describe('rutas de productos', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    categorias.obtenerPorId.mockResolvedValue({ id: 1, nombre: 'Cables' });
    repository.listar.mockResolvedValue({ filas: [], total: 0 });
    repository.crear.mockImplementation(async (nuevo) => ({ id: 1, ...nuevo }));
    repository.obtenerPorId.mockResolvedValue({ id: 1, ...datos, activo: true });
  });

  test.each(['/productos', '/productos/1'])('GET %s sin sesión responde 401', async (ruta) => {
    const res = await request(app).get(ruta);
    expect(res.status).toBe(401);
  });

  test.each(['admin', 'vendedor', 'almacenero'])('el rol %s lista sin filtros', async (rol) => {
    const res = await request(app).get('/productos').set('Authorization', como(rol));

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ data: [], total: 0, pagina: 1, limite: 10 });
  });

  test('pasa los filtros al repositorio', async () => {
    const res = await request(app)
      .get('/productos?buscar=cable&categoria=2&stockBajo=true')
      .set('Authorization', como('admin'));

    expect(res.body).toEqual({ data: [], total: 0, pagina: 1, limite: 10 });
    expect(repository.listar).toHaveBeenCalledWith(
      expect.objectContaining({ buscar: 'cable', categoria: 2, stockBajo: true })
    );
  });

  test('ignora filtros mal escritos', async () => {
    await request(app)
      .get('/productos?categoria=abc&stockBajo=1')
      .set('Authorization', como('admin'));

    const [filtros] = repository.listar.mock.calls[0];
    expect(filtros.categoria).toBeUndefined();
    expect(filtros.stockBajo).toBe(false);
  });

  test('crea con el SKU en mayúsculas y descarta el stock enviado', async () => {
    const res = await crear({ ...datos, stock: 500 });

    expect(res.status).toBe(201);
    expect(res.body.sku).toBe('CAB-01');
    expect(repository.crear.mock.calls[0][0]).not.toHaveProperty('stock');
  });

  test.each([
    ['sku', 'con espacios'],
    ['sku', 'a'.repeat(31)],
    ['nombre', 'ab'],
    ['categoria_id', undefined],
    ['categoria_id', 1.5],
    ['precio_compra', -1],
    ['precio_venta', 0],
    ['precio_venta', 10.999],
    ['precio_venta', '15'],
    ['stock_minimo', -2],
  ])('%s con valor %j responde 400', async (campo, valor) => {
    const res = await crear({ ...datos, [campo]: valor });

    expect(res.status).toBe(400);
    expect(res.body.campos).toHaveProperty(campo);
    expect(repository.crear).not.toHaveBeenCalled();
  });

  test('una categoría inexistente responde 400 con el campo', async () => {
    categorias.obtenerPorId.mockResolvedValue(undefined);
    const res = await crear(datos);

    expect(res.status).toBe(400);
    expect(res.body).toEqual({
      error: 'Datos inválidos',
      campos: { categoria_id: 'La categoría no existe' },
    });
  });

  test.each(['post', 'put', 'delete'])('el vendedor no puede usar %s', async (verbo) => {
    const ruta = verbo === 'post' ? '/productos' : '/productos/1';
    const res = await request(app)
      [verbo](ruta)
      .set('Authorization', como('vendedor'))
      .send(datos);
    expect(res.status).toBe(403);
  });

  test('DELETE desactiva y responde 204', async () => {
    const res = await request(app)
      .delete('/productos/1')
      .set('Authorization', como('almacenero'));

    expect(res.status).toBe(204);
    expect(repository.desactivar).toHaveBeenCalledWith(1);
  });
});
