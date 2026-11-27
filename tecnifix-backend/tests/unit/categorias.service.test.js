jest.mock('../../src/repositories/categorias.repository');
const repository = require('../../src/repositories/categorias.repository');
const service = require('../../src/services/categorias.service');

const cables = { id: 1, nombre: 'Cables' };

describe('categorias.service', () => {
  beforeEach(() => jest.resetAllMocks());

  test('listar calcula el desplazamiento y arma la respuesta paginada', async () => {
    repository.listar.mockResolvedValue({ filas: [cables], total: 11 });

    await expect(service.listar({ pagina: 2, limite: 10, buscar: '' })).resolves.toEqual({
      data: [cables],
      total: 11,
      pagina: 2,
      limite: 10,
    });
    expect(repository.listar).toHaveBeenCalledWith({ buscar: '', limite: 10, desplazamiento: 10 });
  });

  test('crear guarda una categoría nueva', async () => {
    repository.crear.mockResolvedValue(cables);

    await expect(service.crear({ nombre: 'Cables' })).resolves.toEqual(cables);
  });

  test('crear responde 409 si el nombre ya existe', async () => {
    repository.obtenerPorNombre.mockResolvedValue(cables);

    await expect(service.crear({ nombre: 'cables' })).rejects.toMatchObject({ status: 409 });
    expect(repository.crear).not.toHaveBeenCalled();
  });

  test('crear responde 409 si la base rechaza el duplicado', async () => {
    repository.crear.mockRejectedValue(Object.assign(new Error('duplicado'), { code: '23505' }));

    await expect(service.crear({ nombre: 'Cables' })).rejects.toMatchObject({ status: 409 });
  });

  test('actualizar responde 404 si no existe', async () => {
    await expect(service.actualizar(99, { nombre: 'Micas' })).rejects.toMatchObject({ status: 404 });
    expect(repository.actualizar).not.toHaveBeenCalled();
  });

  test('actualizar responde 409 si otra categoría usa el nombre', async () => {
    repository.obtenerPorId.mockResolvedValue(cables);
    repository.obtenerPorNombre.mockResolvedValue({ id: 2, nombre: 'Micas' });

    await expect(service.actualizar(1, { nombre: 'Micas' })).rejects.toMatchObject({ status: 409 });
    expect(repository.actualizar).not.toHaveBeenCalled();
  });

  test('actualizar permite cambiar solo las mayúsculas del propio nombre', async () => {
    repository.obtenerPorId.mockResolvedValue(cables);
    repository.obtenerPorNombre.mockResolvedValue(cables);
    repository.actualizar.mockResolvedValue({ id: 1, nombre: 'CABLES' });

    await expect(service.actualizar(1, { nombre: 'CABLES' })).resolves.toMatchObject({
      nombre: 'CABLES',
    });
  });
});
