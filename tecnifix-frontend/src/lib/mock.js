// Ayudas para trabajar con datos de prueba mientras el backend no tenga la ruta.
// Cada integrante guarda sus datos en src/mocks/<modulo>.mock.js y su service
// decide: si USAR_MOCKS está activo usa el mock; si no, llama a la API real.
//
// Los mocks devuelven exactamente la misma forma que el contrato de la API
// (docs/API.md): así, al pasar a la API real, las pantallas no cambian.

import { ApiError } from './fetcher';

export const USAR_MOCKS = process.env.NEXT_PUBLIC_USE_MOCKS === 'true';

// Devuelve una copia de los datos después de una pequeña espera,
// para ver en pantalla los estados de "cargando".
export function simular(datos, ms = 400) {
  return new Promise((resolve) => {
    setTimeout(() => resolve(structuredClone(datos)), ms);
  });
}

// Simula un error de la API (mismo ApiError que lanza el fetcher).
export function simularError(status, mensaje, campos = null, ms = 400) {
  return new Promise((_, reject) => {
    setTimeout(() => reject(new ApiError(status, mensaje, campos)), ms);
  });
}

// Pagina y filtra una lista como lo hará el backend:
// devuelve { data, total, pagina, limite }.
export function paginar(lista, { pagina = 1, limite = 10, buscar = '', camposBusqueda = [] } = {}) {
  const texto = String(buscar).trim().toLowerCase();
  const filtrada = texto
    ? lista.filter((item) => camposBusqueda.some((campo) => String(item[campo] ?? '').toLowerCase().includes(texto)))
    : lista;
  const inicio = (Number(pagina) - 1) * Number(limite);
  return {
    data: filtrada.slice(inicio, inicio + Number(limite)),
    total: filtrada.length,
    pagina: Number(pagina),
    limite: Number(limite),
  };
}
