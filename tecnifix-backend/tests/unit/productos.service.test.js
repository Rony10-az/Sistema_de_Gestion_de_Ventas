jest.mock('../../src/repositories/productos.repository');
const repository = require('../../src/repositories/productos.repository');
const service = require('../../src/services/productos.service');

const producto = { id: 1, nombre: 'De prueba' };

describe('productos.service', () => {
  test('listar devuelve lo que entrega el repositorio', async () => {
    repository.obtenerTodos.mockResolvedValue([producto]);
    await expect(service.listar()).resolves.toEqual([producto]);
  });

  test('crear pasa los datos al repositorio', async () => {
    repository.crear.mockResolvedValue(producto);
    await expect(service.crear({ nombre: 'De prueba' })).resolves.toEqual(producto);
    expect(repository.crear).toHaveBeenCalledWith({ nombre: 'De prueba' });
  });

  test.each(['obtenerPorId', 'actualizar', 'eliminar'])('%s falla si no existe', async (metodo) => {
    repository.obtenerPorId.mockResolvedValue(undefined);
    await expect(service[metodo](999, {})).rejects.toThrow('Producto no encontrado');
    expect(repository.actualizar).not.toHaveBeenCalled();
    expect(repository.eliminar).not.toHaveBeenCalled();
  });
});
