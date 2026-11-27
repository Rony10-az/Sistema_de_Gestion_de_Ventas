// Datos de prueba del login (solo se usan con NEXT_PUBLIC_USE_MOCKS=true).
// Son usuarios ficticios para probar los tres roles; no existen en la base real.
// Imita las reglas del backend: correo o contraseña incorrectos → 401,
// y 5 intentos fallidos seguidos → 423 (cuenta bloqueada).

export const CLAVE_DE_PRUEBA = 'tecnifix123';

export const usuariosDePrueba = [
  { id: 1, nombre: 'Rosa Quispe', email: 'admin@tecnifix.pe', rol: 'admin' },
  { id: 2, nombre: 'Luis Huamán', email: 'vendedor@tecnifix.pe', rol: 'vendedor' },
  { id: 3, nombre: 'Carla Rojas', email: 'almacen@tecnifix.pe', rol: 'almacenero' },
];

const intentosFallidos = {};

// Devuelve { status, cuerpo } como respondería POST /auth/login.
export function loginDePrueba(email, password) {
  const correo = String(email).trim().toLowerCase();
  if ((intentosFallidos[correo] ?? 0) >= 5) {
    return { status: 423, cuerpo: { error: 'Cuenta bloqueada por 15 minutos tras 5 intentos fallidos' } };
  }
  const usuario = usuariosDePrueba.find((u) => u.email === correo);
  if (!usuario || password !== CLAVE_DE_PRUEBA) {
    intentosFallidos[correo] = (intentosFallidos[correo] ?? 0) + 1;
    return { status: 401, cuerpo: { error: 'Correo o contraseña incorrectos' } };
  }
  intentosFallidos[correo] = 0;
  return { status: 200, cuerpo: { token: `mock.${usuario.rol}.${usuario.id}`, usuario } };
}
