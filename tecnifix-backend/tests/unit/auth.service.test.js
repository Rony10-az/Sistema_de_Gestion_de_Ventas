jest.mock('../../src/repositories/auth.repository');
const bcrypt = require('bcryptjs');
const repository = require('../../src/repositories/auth.repository');
const service = require('../../src/services/auth.service');
const { verificarToken } = require('../../src/utils/jwt.util');

const CLAVE = 'Clave-de-prueba-1';
const usuarioGuardado = () => ({
  id: 3,
  email: 'ana@example.com',
  rol: 'vendedor',
  password_hash: bcrypt.hashSync(CLAVE, 4),
});

describe('auth.service', () => {
  test('registrar guarda la contraseña cifrada', async () => {
    repository.crearUsuario.mockResolvedValue({ id: 3 });
    await service.registrar({ nombre: 'Ana', email: 'ana@example.com', password: CLAVE });

    const { passwordHash } = repository.crearUsuario.mock.calls[0][0];
    expect(passwordHash).not.toBe(CLAVE);
    expect(bcrypt.compareSync(CLAVE, passwordHash)).toBe(true);
  });

  test('login devuelve un token con el rol y oculta el hash', async () => {
    repository.buscarPorEmail.mockResolvedValue(usuarioGuardado());
    const { token, usuario } = await service.login({ email: 'ana@example.com', password: CLAVE });

    expect(verificarToken(token)).toMatchObject({ id: 3, rol: 'vendedor' });
    expect(usuario.password_hash).toBeUndefined();
  });

  test.each([
    ['el correo no existe', () => undefined, CLAVE],
    ['la contraseña no coincide', usuarioGuardado, 'otra'],
  ])('login falla si %s', async (_caso, usuario, password) => {
    repository.buscarPorEmail.mockResolvedValue(usuario());
    await expect(service.login({ email: 'ana@example.com', password })).rejects.toThrow(
      'Credenciales inválidas'
    );
  });
});
