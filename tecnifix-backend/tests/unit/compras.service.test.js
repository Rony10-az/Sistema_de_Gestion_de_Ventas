jest.mock('../../src/repositories/compras.repository');
jest.mock('../../src/repositories/productos.repository');
jest.mock('../../src/repositories/proveedores.repository');
jest.mock('../../src/repositories/inventario.repository');
const compras = require('../../src/repositories/compras.repository');
const productos = require('../../src/repositories/productos.repository');
const proveedores = require('../../src/repositories/proveedores.repository');
const inventario = require('../../src/repositories/inventario.repository');
const service = require('../../src/services/compras.service');

const client = {};
const usuario = { id: 4, rol: 'almacenero' };
const datos = {
  proveedor_id: 1,
  items: [
    { producto_id: 9, cantidad: 3, costo_unitario: 0.1 },
    { producto_id: 2, cantidad: 1, costo_unitario: 0.2 },
  ],
};

describe('compras.service', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    proveedores.obtenerPorId.mockResolvedValue({ id: 1 });
    compras.enTransaccion.mockImplementation((operacion) => operacion(client));
    compras.insertarCompra.mockResolvedValue(12);
    compras.obtenerPorId.mockResolvedValue({ id: 12 });
    productos.sumarStock.mockImplementation(async (_, id, cantidad) => 10 + cantidad);
  });

  test('calcula el total en el servidor sin errores de decimales', async () => {
    await service.crear(datos, usuario);

    expect(compras.insertarCompra).toHaveBeenCalledWith(client, {
      proveedor_id: 1,
      usuario_id: 4,
      total: 0.5,
    });
  });

  test('sube el stock y anota el kardex de cada producto, en orden', async () => {
    await expect(service.crear(datos, usuario)).resolves.toEqual({ id: 12 });

    expect(productos.sumarStock.mock.calls.map((llamada) => llamada[1])).toEqual([2, 9]);
    expect(compras.insertarDetalle).toHaveBeenCalledTimes(2);
    expect(inventario.registrarMovimiento).toHaveBeenLastCalledWith(client, {
      producto_id: 9,
      tipo: 'entrada',
      cantidad: 3,
      stock_resultante: 13,
      referencia: 'compra:12',
      usuario_id: 4,
    });
  });

  test('un proveedor inexistente responde 400 sin abrir la transacción', async () => {
    proveedores.obtenerPorId.mockResolvedValue(undefined);

    await expect(service.crear(datos, usuario)).rejects.toMatchObject({ status: 400 });
    expect(compras.enTransaccion).not.toHaveBeenCalled();
  });

  test('un total que no cabe en la base responde 400', async () => {
    const items = [{ producto_id: 1, cantidad: 1000000, costo_unitario: 1000 }];

    await expect(service.crear({ ...datos, items }, usuario)).rejects.toMatchObject({
      status: 400,
    });
    expect(compras.enTransaccion).not.toHaveBeenCalled();
  });

  test('un producto inexistente señala su línea original', async () => {
    productos.sumarStock.mockResolvedValue(undefined);

    await expect(service.crear(datos, usuario)).rejects.toMatchObject({
      status: 400,
      campos: { 'items.1.producto_id': expect.any(String) },
    });
    expect(inventario.registrarMovimiento).not.toHaveBeenCalled();
  });

  test('listar arma la respuesta paginada', async () => {
    compras.listar.mockResolvedValue({ filas: [], total: 0 });

    await expect(service.listar({ pagina: 1, limite: 5, buscar: '' })).resolves.toEqual({
      data: [],
      total: 0,
      pagina: 1,
      limite: 5,
    });
  });

  test('obtenerPorId responde 404 si no existe', async () => {
    compras.obtenerPorId.mockResolvedValue(undefined);

    await expect(service.obtenerPorId(99)).rejects.toMatchObject({ status: 404 });
  });
});
