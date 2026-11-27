jest.mock('../../src/repositories/clientes.repository');
const repository = require('../../src/repositories/clientes.repository');
const service = require('../../src/services/clientes.service');

const cliente = { id: 1, nombre: 'De prueba' };

describe('clientes.service', () => {
  test('listar devuelve lo que entrega el repositorio', async () => {
    repository.obtenerTodos.mockResolvedValue([cliente]);
    await expect(service.listar()).resolves.toEqual([cliente]);
  });

  test('crear pasa los datos al repositorio', async () => {
    repository.crear.mockResolvedValue(cliente);
    await expect(service.crear({ nombre: 'De prueba' })).resolves.toEqual(cliente);
    expect(repository.crear).toHaveBeenCalledWith({ nombre: 'De prueba' });
  });

  test.each(['obtenerPorId', 'actualizar', 'eliminar'])('%s falla si no existe', async (metodo) => {
    repository.obtenerPorId.mockResolvedValue(undefined);
    await expect(service[metodo](999, {})).rejects.toThrow('Cliente no encontrado');
    expect(repository.actualizar).not.toHaveBeenCalled();
    expect(repository.eliminar).not.toHaveBeenCalled();
  });
});
