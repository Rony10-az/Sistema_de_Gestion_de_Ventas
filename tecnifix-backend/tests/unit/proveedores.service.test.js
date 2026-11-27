jest.mock('../../src/repositories/proveedores.repository');
const repository = require('../../src/repositories/proveedores.repository');
const service = require('../../src/services/proveedores.service');

const datos = { ruc: '20123456789', razon_social: 'Distribuidora de prueba', telefono: null };
const proveedor = { id: 1, ...datos };

describe('proveedores.service', () => {
  beforeEach(() => jest.resetAllMocks());

  test('listar arma la respuesta paginada', async () => {
    repository.listar.mockResolvedValue({ filas: [proveedor], total: 21 });

    await expect(service.listar({ pagina: 3, limite: 10, buscar: '' })).resolves.toEqual({
      data: [proveedor],
      total: 21,
      pagina: 3,
      limite: 10,
    });
    expect(repository.listar).toHaveBeenCalledWith({ buscar: '', limite: 10, desplazamiento: 20 });
  });

  test('crear guarda un proveedor nuevo', async () => {
    repository.crear.mockResolvedValue(proveedor);

    await expect(service.crear(datos)).resolves.toEqual(proveedor);
  });

  test('crear responde 409 si el RUC ya existe', async () => {
    repository.obtenerPorRuc.mockResolvedValue(proveedor);

    await expect(service.crear(datos)).rejects.toMatchObject({ status: 409 });
    expect(repository.crear).not.toHaveBeenCalled();
  });

  test('crear responde 409 si la base rechaza el duplicado', async () => {
    repository.crear.mockRejectedValue(Object.assign(new Error('duplicado'), { code: '23505' }));

    await expect(service.crear(datos)).rejects.toMatchObject({ status: 409 });
  });

  test('actualizar responde 404 si no existe', async () => {
    await expect(service.actualizar(99, datos)).rejects.toMatchObject({ status: 404 });
    expect(repository.actualizar).not.toHaveBeenCalled();
  });

  test('actualizar responde 409 si otro proveedor usa el RUC', async () => {
    repository.obtenerPorId.mockResolvedValue(proveedor);
    repository.obtenerPorRuc.mockResolvedValue({ ...proveedor, id: 2 });

    await expect(service.actualizar(1, datos)).rejects.toMatchObject({ status: 409 });
    expect(repository.actualizar).not.toHaveBeenCalled();
  });

  test('actualizar permite conservar el propio RUC', async () => {
    repository.obtenerPorId.mockResolvedValue(proveedor);
    repository.obtenerPorRuc.mockResolvedValue(proveedor);
    repository.actualizar.mockResolvedValue(proveedor);

    await expect(service.actualizar(1, datos)).resolves.toEqual(proveedor);
  });
});
