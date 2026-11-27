// Permisos por rol. Las peticiones rechazadas no llegan a la base de datos.

const request = require('supertest');
const app = require('../../src/app');
const verificarRol = require('../../src/middlewares/rol.middleware');
const { autorizacion } = require('../helpers/token');

const PROHIBIDO = [
  ['almacenero', 'get', '/clientes'],
  ['almacenero', 'post', '/clientes'],
  ['vendedor', 'delete', '/clientes/1'],
  ['almacenero', 'get', '/ventas'],
  ['almacenero', 'get', '/ventas/1'],
  ['almacenero', 'post', '/ventas'],
  ['vendedor', 'post', '/productos'],
  ['vendedor', 'put', '/productos/1'],
  ['vendedor', 'delete', '/productos/1'],
  ['vendedor', 'get', '/productos/1/movimientos'],
  ['vendedor', 'post', '/categorias'],
  ['vendedor', 'post', '/proveedores'],
  ['vendedor', 'get', '/compras'],
  ['vendedor', 'post', '/compras'],
  ['vendedor', 'post', '/inventario/ajustes'],
  ['almacenero', 'post', '/inventario/ajustes'],
];

describe('permisos por rol', () => {
  test.each(PROHIBIDO)('%s no puede %s %s', async (rol, metodo, ruta) => {
    const res = await request(app)[metodo](ruta).set('Authorization', autorizacion({ rol }));
    expect(res.status).toBe(403);
  });

  test.each([...new Set(PROHIBIDO.map(([, metodo, ruta]) => `${metodo} ${ruta}`))])(
    '%s exige sesión',
    async (peticion) => {
      const [metodo, ruta] = peticion.split(' ');
      const res = await request(app)[metodo](ruta);
      expect(res.status).toBe(401);
    }
  );
});

describe('verificarRol', () => {
  const ejecutar = (usuario) => {
    const res = { status: jest.fn(() => res), json: jest.fn() };
    const next = jest.fn();
    verificarRol('admin', 'vendedor')({ usuario }, res, next);
    return { res, next };
  };

  test.each(['admin', 'vendedor'])('deja pasar a %s', (rol) => {
    expect(ejecutar({ rol }).next).toHaveBeenCalled();
  });

  test('sin usuario responde 401', () => {
    expect(ejecutar(undefined).res.status).toHaveBeenCalledWith(401);
  });

  test('falla al declarar un rol que no existe', () => {
    expect(() => verificarRol('administrador')).toThrow('roles no válidos');
    expect(() => verificarRol()).toThrow('roles no válidos');
  });
});
