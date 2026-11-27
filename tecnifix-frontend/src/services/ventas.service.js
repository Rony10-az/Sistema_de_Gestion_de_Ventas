// Llamadas al dominio /ventas del backend (o a los datos de prueba si USAR_MOCKS).
// Rutas: GET /ventas?desde=&hasta=&estado=&buscar=&pagina=&limite= · GET /ventas/:id · PATCH /ventas/:id/anular

import { apiFetch } from '../lib/fetcher';
import { USAR_MOCKS, simular, simularError, paginar } from '../lib/mock';
import { ventasMock } from '../mocks/ventas.mock';

// vendedor_id solo lo usa el mock para simular "el vendedor ve solo las suyas".
// Con la API real el backend filtra por el usuario del token.
export function listarVentas({ desde = '', hasta = '', estado = '', buscar = '', pagina = 1, limite = 10, vendedor_id = '' } = {}) {
  if (USAR_MOCKS) {
    const lista = ventasMock
      .filter((v) => !desde || v.fecha.slice(0, 10) >= desde)
      .filter((v) => !hasta || v.fecha.slice(0, 10) <= hasta)
      .filter((v) => !estado || v.estado === estado)
      .filter((v) => !vendedor_id || v.vendedor_id === Number(vendedor_id))
      .sort((a, b) => b.fecha.localeCompare(a.fecha));
    return simular(paginar(lista, { buscar, pagina, limite, camposBusqueda: ['serie_numero', 'cliente_nombre'] }));
  }
  const filtros = { desde, hasta, estado, buscar };
  const params = new URLSearchParams({ pagina, limite });
  Object.entries(filtros).forEach(([clave, valor]) => {
    if (valor) params.set(clave, valor);
  });
  return apiFetch(`/ventas?${params}`);
}

export function obtenerVenta(id) {
  if (USAR_MOCKS) {
    const venta = ventasMock.find((v) => v.id === Number(id));
    return venta ? simular(venta) : simularError(404, 'Venta no encontrada');
  }
  return apiFetch(`/ventas/${id}`);
}

export function anularVenta(id) {
  if (USAR_MOCKS) {
    const venta = ventasMock.find((v) => v.id === Number(id));
    if (!venta) return simularError(404, 'Venta no encontrada');
    if (venta.estado === 'anulada') return simularError(400, 'La venta ya está anulada');
    venta.estado = 'anulada';
    return simular(venta);
  }
  return apiFetch(`/ventas/${id}/anular`, { method: 'PATCH' });
}
