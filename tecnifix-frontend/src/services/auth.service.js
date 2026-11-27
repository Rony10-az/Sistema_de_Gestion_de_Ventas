// Llamadas al dominio /auth del backend. No guarda el token aquí;
// quien llama (AuthContext) decide dónde persistirlo.
// Con NEXT_PUBLIC_USE_MOCKS=true usa los usuarios de prueba de src/mocks/auth.mock.js.

import { apiFetch } from '../lib/fetcher';
import { USAR_MOCKS, simular, simularError } from '../lib/mock';
import { loginDePrueba } from '../mocks/auth.mock';

export function login({ email, password }) {
  if (USAR_MOCKS) {
    const { status, cuerpo } = loginDePrueba(email, password);
    return status === 200 ? simular(cuerpo, 600) : simularError(status, cuerpo.error, null, 600);
  }
  return apiFetch('/auth/login', { method: 'POST', body: { email, password } });
}

export function register({ nombre, email, password }) {
  return apiFetch('/auth/register', { method: 'POST', body: { nombre, email, password } });
}
