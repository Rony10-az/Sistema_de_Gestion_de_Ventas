const authMiddleware = require('../../src/middlewares/auth.middleware');
const errorMiddleware = require('../../src/middlewares/error.middleware');
const { autorizacion } = require('../helpers/token');

function respuesta() {
  const res = {};
  res.status = jest.fn(() => res);
  res.json = jest.fn(() => res);
  return res;
}

describe('auth.middleware', () => {
  test.each([
    ['sin cabecera', undefined],
    ['con un token inválido', 'Bearer abc'],
  ])('responde 401 %s', (_caso, authorization) => {
    const res = respuesta();
    const next = jest.fn();
    authMiddleware({ headers: { authorization } }, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  test('con un token válido deja el usuario en req.usuario', () => {
    const req = { headers: { authorization: autorizacion({ id: 5 }) } };
    const next = jest.fn();
    authMiddleware(req, respuesta(), next);
    expect(req.usuario).toMatchObject({ id: 5 });
    expect(next).toHaveBeenCalled();
  });
});

describe('error.middleware', () => {
  test('usa el status del error y devuelve su mensaje', () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    const res = respuesta();
    errorMiddleware(Object.assign(new Error('No existe'), { status: 404 }), {}, res, jest.fn());
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: 'No existe' });
  });
});
