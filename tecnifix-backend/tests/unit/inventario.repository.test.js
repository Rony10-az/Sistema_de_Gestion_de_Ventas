// La transacción se prueba simulando la conexión.

jest.mock('../../src/config/database', () => ({ connect: jest.fn() }));
const pool = require('../../src/config/database');
const { enTransaccion } = require('../../src/repositories/inventario.repository');

describe('inventario.repository · enTransaccion', () => {
  let client;

  beforeEach(() => {
    client = { query: jest.fn(), release: jest.fn() };
    pool.connect.mockResolvedValue(client);
  });

  const consultas = () => client.query.mock.calls.map(([sql]) => sql);

  test('confirma cuando todo sale bien', async () => {
    await expect(enTransaccion(async () => 'listo')).resolves.toBe('listo');

    expect(consultas()).toEqual(['BEGIN', 'COMMIT']);
    expect(client.release).toHaveBeenCalled();
  });

  test('deshace todo si algo falla', async () => {
    const falla = async () => {
      throw new Error('falló');
    };

    await expect(enTransaccion(falla)).rejects.toThrow('falló');
    expect(consultas()).toEqual(['BEGIN', 'ROLLBACK']);
    expect(client.release).toHaveBeenCalled();
  });
});
