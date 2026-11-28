jest.mock('../../src/repositories/clientes.repository');
const repository = require('../../src/repositories/clientes.repository');
const service = require('../../src/services/clientes.service');

const cliente = {
  id: 1,
  tipo_documento: 'DNI',
  documento: '12345678',
  nombre: 'Ana Pérez',
  telefono: null,
  email: null,
  direccion: null,
};

describe('clientes.service', () => {
  beforeEach(() => jest.resetAllMocks());

  test('listar calcula el desplazamiento y arma la respuesta paginada', async () => {
    repository.listar.mockResolvedValue({ filas: [cliente], total: 11 });

    await expect(service.listar({ pagina: 2, limite: 10, buscar: 'ana' })).resolves.toEqual({
      data: [cliente],
      total: 11,
      pagina: 2,
      limite: 10,
    });
    expect(repository.listar).toHaveBeenCalledWith({ buscar: 'ana', limite: 10, desplazamiento: 10 });
  });

  test('obtenerPorId responde 404 si no existe', async () => {
    await expect(service.obtenerPorId(99)).rejects.toMatchObject({ status: 404 });
  });

  test('crear guarda un cliente nuevo', async () => {
    repository.crear.mockResolvedValue(cliente);

    await expect(service.crear(cliente)).resolves.toEqual(cliente);
    expect(repository.crear).toHaveBeenCalledWith(cliente);
  });

  test('crear responde 409 si el documento ya existe', async () => {
    repository.obtenerPorDocumento.mockResolvedValue(cliente);

    await expect(service.crear(cliente)).rejects.toMatchObject({ status: 409 });
    expect(repository.crear).not.toHaveBeenCalled();
  });

  test('crear responde 409 si la base rechaza el duplicado', async () => {
    repository.crear.mockRejectedValue(Object.assign(new Error('duplicado'), { code: '23505' }));

    await expect(service.crear(cliente)).rejects.toMatchObject({ status: 409 });
  });

  test('actualizar responde 404 si no existe', async () => {
    await expect(service.actualizar(99, cliente)).rejects.toMatchObject({ status: 404 });
    expect(repository.actualizar).not.toHaveBeenCalled();
  });

  test('actualizar responde 409 si otro cliente usa el documento', async () => {
    repository.obtenerPorId.mockResolvedValue(cliente);
    repository.obtenerPorDocumento.mockResolvedValue({ ...cliente, id: 2 });

    await expect(service.actualizar(1, cliente)).rejects.toMatchObject({ status: 409 });
    expect(repository.actualizar).not.toHaveBeenCalled();
  });

  test('actualizar permite conservar el propio documento', async () => {
    repository.obtenerPorId.mockResolvedValue(cliente);
    repository.obtenerPorDocumento.mockResolvedValue(cliente);
    repository.actualizar.mockResolvedValue(cliente);

    await expect(service.actualizar(1, cliente)).resolves.toEqual(cliente);
  });

  test('eliminar responde 404 si no existe', async () => {
    await expect(service.eliminar(99)).rejects.toMatchObject({ status: 404 });
    expect(repository.eliminar).not.toHaveBeenCalled();
  });

  test('eliminar responde 409 si el cliente tiene ventas', async () => {
    repository.obtenerPorId.mockResolvedValue(cliente);
    repository.eliminar.mockRejectedValue(Object.assign(new Error('fk'), { code: '23503' }));

    await expect(service.eliminar(1)).rejects.toMatchObject({ status: 409 });
  });

  describe('listarVentas', () => {
    beforeEach(() => {
      repository.obtenerPorId.mockResolvedValue(cliente);
      repository.listarVentas.mockResolvedValue({ filas: [], total: 0 });
    });

    test('el admin ve las ventas de todos los vendedores', async () => {
      await service.listarVentas(1, { id: 7, rol: 'admin' }, { pagina: 3, limite: 5 });

      expect(repository.listarVentas).toHaveBeenCalledWith({
        clienteId: 1,
        vendedorId: null,
        limite: 5,
        desplazamiento: 10,
      });
    });

    test('el vendedor solo ve las suyas', async () => {
      const res = await service.listarVentas(1, { id: 7, rol: 'vendedor' }, { pagina: 1, limite: 10 });

      expect(res).toEqual({ data: [], total: 0, pagina: 1, limite: 10 });
      expect(repository.listarVentas).toHaveBeenCalledWith(
        expect.objectContaining({ vendedorId: 7 })
      );
    });

    test('responde 404 si el cliente no existe', async () => {
      repository.obtenerPorId.mockResolvedValue(undefined);

      await expect(
        service.listarVentas(99, { id: 1, rol: 'admin' }, { pagina: 1, limite: 10 })
      ).rejects.toMatchObject({ status: 404 });
    });
  });
});
