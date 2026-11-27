jest.mock('../../src/repositories/inventario.repository');
jest.mock('../../src/repositories/productos.repository');
jest.mock('../../src/services/correo.service');
const correo = require('../../src/services/correo.service');
const inventario = require('../../src/repositories/inventario.repository');
const productos = require('../../src/repositories/productos.repository');
const service = require('../../src/services/inventario.service');

const client = {};
const admin = { id: 1, rol: 'admin' };
const ajuste = { producto_id: 3, cantidad: -2, motivo: 'Conteo físico' };
const venta = { producto_id: 3, cantidad: 2, referencia: 'venta:B001-000142', usuario_id: 4 };

describe('inventario.service', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    inventario.enTransaccion.mockImplementation((operacion) => operacion(client));
    inventario.listarPorProducto.mockResolvedValue({ filas: [], total: 0 });
    productos.obtenerPorId.mockResolvedValue({ id: 3, nombre: 'Mica' });
  });

  test('un ajuste cambia el stock y queda en el kardex con su motivo', async () => {
    productos.ajustarStock.mockResolvedValue(8);

    await service.ajustar(ajuste, admin);

    expect(productos.ajustarStock).toHaveBeenCalledWith(client, 3, -2);
    expect(inventario.registrarMovimiento).toHaveBeenCalledWith(client, {
      producto_id: 3,
      tipo: 'ajuste',
      cantidad: -2,
      stock_resultante: 8,
      motivo: 'Conteo físico',
      usuario_id: 1,
    });
  });

  test('un ajuste que deja stock negativo responde 409', async () => {
    await expect(service.ajustar(ajuste, admin)).rejects.toMatchObject({ status: 409 });
    expect(inventario.registrarMovimiento).not.toHaveBeenCalled();
  });

  test('ajustar un producto inexistente responde 404', async () => {
    productos.obtenerPorId.mockResolvedValue(undefined);

    await expect(service.ajustar(ajuste, admin)).rejects.toMatchObject({ status: 404 });
    expect(inventario.enTransaccion).not.toHaveBeenCalled();
  });

  test('el kardex se pagina', async () => {
    await expect(service.listarMovimientos(3, { pagina: 2, limite: 10 })).resolves.toEqual({
      data: [],
      total: 0,
      pagina: 2,
      limite: 10,
    });
    expect(inventario.listarPorProducto).toHaveBeenCalledWith(3, {
      limite: 10,
      desplazamiento: 10,
    });
  });

  test('una salida descuenta y se anota en negativo', async () => {
    productos.descontarStock.mockResolvedValue(5);

    await expect(service.registrarSalida(client, venta)).resolves.toBe(5);
    expect(inventario.registrarMovimiento).toHaveBeenCalledWith(
      client,
      expect.objectContaining({ tipo: 'salida', cantidad: -2, stock_resultante: 5 })
    );
  });

  test('sin stock suficiente responde 409 nombrando el producto', async () => {
    productos.bloquearPorIds.mockResolvedValue([{ id: 3, nombre: 'Mica' }]);

    await expect(service.registrarSalida(client, venta)).rejects.toMatchObject({
      status: 409,
      message: 'Stock insuficiente para Mica',
    });
    expect(inventario.registrarMovimiento).not.toHaveBeenCalled();
  });

  test('una devolución repone el stock y se anota como entrada', async () => {
    productos.ajustarStock.mockResolvedValue(9);

    await service.registrarDevolucion(client, venta);

    expect(productos.ajustarStock).toHaveBeenCalledWith(client, 3, 2);
    expect(inventario.registrarMovimiento).toHaveBeenCalledWith(
      client,
      expect.objectContaining({ tipo: 'entrada', cantidad: 2, stock_resultante: 9 })
    );
  });

  const bajo = { id: 3, nombre: 'Mica', activo: true, stock: 2, stock_minimo: 3 };

  test('avisa cuando la salida hace llegar al stock mínimo', async () => {
    productos.obtenerPorId.mockResolvedValue(bajo);

    await service.avisarStockBajo([{ producto_id: 3, cantidad: 2 }]);

    expect(correo.enviarAlertaStock).toHaveBeenCalledWith(bajo);
  });

  test.each([
    ['ya estaba bajo', bajo, 1],
    ['sigue sobre el mínimo', { ...bajo, stock: 9 }, 5],
    ['está desactivado', { ...bajo, activo: false }, 2],
  ])('no avisa si %s', async (_, producto, cantidad) => {
    productos.obtenerPorId.mockResolvedValue(producto);

    await service.avisarStockBajo([{ producto_id: 3, cantidad }]);

    expect(correo.enviarAlertaStock).not.toHaveBeenCalled();
  });

  test('un fallo al revisar no se propaga', async () => {
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    productos.obtenerPorId.mockRejectedValue(new Error('sin base'));

    await expect(
      service.avisarStockBajo([{ producto_id: 3, cantidad: 2 }])
    ).resolves.toBeUndefined();
  });
});
