jest.mock('../../src/repositories/ventas.repository');
jest.mock('../../src/repositories/productos.repository');
const repository = require('../../src/repositories/ventas.repository');
const service = require('../../src/services/ventas.service');

describe('ventas.service', () => {
  test('obtenerPorId falla si la venta no existe', async () => {
    repository.obtenerPorId.mockResolvedValue(undefined);
    await expect(service.obtenerPorId(999)).rejects.toThrow('Venta no encontrada');
  });

  test('el admin lista todas las ventas y el vendedor solo las suyas', async () => {
    repository.obtenerTodas.mockResolvedValue([]);
    await service.listar({ id: 1, rol: 'admin' });
    await service.listar({ id: 7, rol: 'vendedor' });
    expect(repository.obtenerTodas.mock.calls).toEqual([[{}], [{ vendedorId: 7 }]]);
  });

  test('un vendedor no puede ver la venta de otro', async () => {
    repository.obtenerPorId.mockResolvedValue({ id: 4, vendedor_id: 8 });
    await expect(service.obtenerPorId(4, { id: 7, rol: 'vendedor' })).rejects.toMatchObject({
      status: 404,
    });
    await expect(service.obtenerPorId(4, { id: 8, rol: 'vendedor' })).resolves.toMatchObject({ id: 4 });
    await expect(service.obtenerPorId(4, { id: 1, rol: 'admin' })).resolves.toMatchObject({ id: 4 });
  });

  test('crear registra como vendedor al usuario autenticado', async () => {
    repository.crear.mockResolvedValue({ id: 1 });
    await service.crear({ clienteId: 2, items: [] }, { id: 7 });
    expect(repository.crear).toHaveBeenCalledWith({ clienteId: 2, items: [], vendedorId: 7 });
  });

  test.todo('no registra la venta si no hay stock suficiente');
  test.todo('calcula subtotal, IGV y total con los precios de la base');
  test.todo('descuenta stock dentro de la misma transacción');
});
