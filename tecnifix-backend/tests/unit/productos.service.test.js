jest.mock('../../src/repositories/productos.repository');
jest.mock('../../src/repositories/categorias.repository');
const repository = require('../../src/repositories/productos.repository');
const categorias = require('../../src/repositories/categorias.repository');
const service = require('../../src/services/productos.service');

const admin = { id: 1, rol: 'admin' };
const almacenero = { id: 2, rol: 'almacenero' };
const vendedor = { id: 3, rol: 'vendedor' };

const datos = { sku: 'CAB-01', nombre: 'Cable USB-C', categoria_id: 1, stock_minimo: 5 };
const producto = { id: 1, ...datos, precio_compra: 8, precio_venta: 15, stock: 3, activo: true };
const filtros = { pagina: 1, limite: 10, buscar: '', stockBajo: false };

describe('productos.service', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    categorias.obtenerPorId.mockResolvedValue({ id: 1, nombre: 'Cables' });
    repository.obtenerPorId.mockResolvedValue(producto);
    repository.crear.mockResolvedValue(producto);
    repository.actualizar.mockResolvedValue(producto);
    repository.listar.mockResolvedValue({ filas: [producto], total: 1 });
  });

  test('listar arma la respuesta paginada', async () => {
    await expect(service.listar({ ...filtros, pagina: 2 }, admin)).resolves.toEqual({
      data: [producto],
      total: 1,
      pagina: 2,
      limite: 10,
    });
    expect(repository.listar).toHaveBeenCalledWith(
      expect.objectContaining({ desplazamiento: 10, soloActivos: false })
    );
  });

  test('el vendedor solo lista productos activos', async () => {
    await service.listar(filtros, vendedor);
    expect(repository.listar).toHaveBeenCalledWith(expect.objectContaining({ soloActivos: true }));
  });

  test('el almacenero no recibe precios', async () => {
    const { data } = await service.listar(filtros, almacenero);
    const uno = await service.obtenerPorId(1, almacenero);

    [data[0], uno].forEach((fila) => {
      expect(fila).not.toHaveProperty('precio_compra');
      expect(fila).not.toHaveProperty('precio_venta');
    });
  });

  test('el vendedor no ve un producto desactivado', async () => {
    repository.obtenerPorId.mockResolvedValue({ ...producto, activo: false });
    await expect(service.obtenerPorId(1, vendedor)).rejects.toMatchObject({ status: 404 });
  });

  test.each([
    ['obtenerPorId', [99, admin]],
    ['actualizar', [99, datos, admin]],
    ['desactivar', [99]],
  ])('%s responde 404 si no existe', async (metodo, argumentos) => {
    repository.obtenerPorId.mockResolvedValue(undefined);
    await expect(service[metodo](...argumentos)).rejects.toMatchObject({ status: 404 });
  });

  test('crear responde 400 si la categoría no existe', async () => {
    categorias.obtenerPorId.mockResolvedValue(undefined);
    await expect(service.crear(datos, admin)).rejects.toMatchObject({
      status: 400,
      campos: { categoria_id: 'La categoría no existe' },
    });
    expect(repository.crear).not.toHaveBeenCalled();
  });

  test('crear responde 409 si el SKU ya existe', async () => {
    repository.obtenerPorSku.mockResolvedValue({ id: 7 });
    await expect(service.crear(datos, admin)).rejects.toMatchObject({ status: 409 });
    expect(repository.crear).not.toHaveBeenCalled();
  });

  test('crear responde 409 si la base rechaza el duplicado', async () => {
    repository.crear.mockRejectedValue(Object.assign(new Error('duplicado'), { code: '23505' }));
    await expect(service.crear(datos, admin)).rejects.toMatchObject({ status: 409 });
  });

  test.each(['precio_compra', 'precio_venta'])('el almacenero no cambia %s', async (campo) => {
    await expect(
      service.actualizar(1, { ...datos, [campo]: 99 }, almacenero)
    ).rejects.toMatchObject({ status: 403 });
    expect(repository.actualizar).not.toHaveBeenCalled();
  });

  test('el almacenero edita sin enviar precios', async () => {
    await service.actualizar(1, datos, almacenero);
    expect(repository.actualizar).toHaveBeenCalledWith(1, datos);
  });

  test('el admin cambia precios', async () => {
    await service.actualizar(1, { ...datos, precio_venta: 20 }, admin);
    expect(repository.actualizar).toHaveBeenCalled();
  });
});
