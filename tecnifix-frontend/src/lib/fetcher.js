// Wrapper único de fetch hacia el backend. Todos los archivos de src/services/
// lo usan; ninguna página ni componente llama a fetch directamente.
//
// - Arma la URL con NEXT_PUBLIC_API_URL (las rutas van sin /api/).
// - Manda el token: el que se le pase o, si no, el de la sesión guardada.
// - Si la API responde 401, avisa a AuthContext para cerrar la sesión.
// - Los errores salen como ApiError con status, mensaje y errores por campo.

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export class ApiError extends Error {
  constructor(status, mensaje, campos = null) {
    super(mensaje);
    this.name = 'ApiError';
    this.status = status;
    this.campos = campos; // { documento: 'El DNI debe tener 8 dígitos' }
  }
}

function tokenGuardado() {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage.getItem('token');
  } catch {
    return null;
  }
}

export async function apiFetch(path, { method = 'GET', body, token } = {}) {
  const tokenFinal = token ?? tokenGuardado();

  let res;
  try {
    res = await fetch(`${API_URL}${path}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(tokenFinal ? { Authorization: `Bearer ${tokenFinal}` } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError(0, 'No se pudo conectar con el servidor. Revisa tu conexión o intenta más tarde.');
  }

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    if (res.status === 401 && typeof window !== 'undefined') {
      window.dispatchEvent(new Event('tecnifix:sesion-expirada'));
    }
    throw new ApiError(res.status, data.error || 'Error en la petición', data.campos || null);
  }

  if (res.status === 204) return null;
  return res.json();
}
