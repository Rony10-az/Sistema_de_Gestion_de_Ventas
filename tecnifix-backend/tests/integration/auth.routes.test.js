const request = require('supertest');
const app = require('../../src/app');
const pool = require('../../src/config/database');

const usuario = {
  nombre: 'Prueba',
  email: `prueba.${Date.now()}@example.com`,
  password: 'Clave-de-prueba-1',
};

// Borra el usuario creado y cierra las conexiones para que Jest termine.
afterAll(async () => {
  await pool.query('DELETE FROM usuarios WHERE email = $1', [usuario.email]);
  await pool.end();
});

describe('auth', () => {
  test('registra un usuario y luego inicia sesión', async () => {
    const registro = await request(app).post('/auth/register').send(usuario);
    expect(registro.status).toBe(201);
    expect(registro.body.password_hash).toBeUndefined();

    const login = await request(app).post('/auth/login').send(usuario);
    expect(login.status).toBe(200);
    expect(login.body.token).toEqual(expect.any(String));
  });

  test.todo('el registro público deja de existir; los usuarios los crea el admin');
  test.todo('bloquea la cuenta tras 5 intentos fallidos');
});
