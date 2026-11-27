// Llamadas al dominio /clientes del backend (o a los datos de prueba si USAR_MOCKS).
// Rutas: GET/POST /clientes?buscar= · GET/PUT /clientes/:id · GET /clientes/:id/ventas

import { apiFetch } from '../lib/fetcher';
import { USAR_MOCKS, simular, simularError, paginar } from '../lib/mock';
import { clientesMock, ventasClientesMock } from '../mocks/clientes.mock';

const CAMPOS_BUSQUEDA = ['documento', 'nombre'];

// Limpia los datos del formulario: texto sin espacios sobrantes y opcionales vacíos como cadena.
function normalizar(datos) {
  return {
    tipo_documento: datos.tipo_documento,
    documento: String(datos.documento ?? '').trim(),
    nombre: String(datos.nombre ?? '').trim(),
    telefono: String(datos.telefono ?? '').trim(),
    email: String(datos.email ?? '').trim(),
    direccion: String(datos.direccion ?? '').trim(),
  };
}

export function listarClientes({ buscar = '', pagina = 1, limite = 10 } = {}) {
  if (USAR_MOCKS) {
    return simular(paginar(clientesMock, { buscar, pagina, limite, camposBusqueda: CAMPOS_BUSQUEDA }));
  }
  const params = new URLSearchParams({ buscar, pagina, limite });
  return apiFetch(`/clientes?${params}`);
}

export function obtenerCliente(id) {
  if (USAR_MOCKS) {
    const cliente = clientesMock.find((c) => c.id === Number(id));
    return cliente ? simular(cliente) : simularError(404, 'Cliente no encontrado');
  }
  return apiFetch(`/clientes/${id}`);
}

// ¿Ya hay otro cliente con este documento? (excluirId: el que se está editando)
export async function existeDocumento(documento, excluirId = null) {
  const { data } = await listarClientes({ buscar: documento, limite: 50 });
  return data.some((c) => c.documento === documento && c.id !== excluirId);
}

export function crearCliente(datos) {
  const cliente = normalizar(datos);
  if (USAR_MOCKS) {
    if (clientesMock.some((c) => c.documento === cliente.documento)) {
      return simularError(400, 'Datos inválidos', { documento: 'Ya existe un cliente con ese documento' });
    }
    const nuevo = { id: Math.max(0, ...clientesMock.map((c) => c.id)) + 1, ...cliente };
    clientesMock.unshift(nuevo);
    return simular(nuevo);
  }
  return apiFetch('/clientes', { method: 'POST', body: cliente });
}

export function actualizarCliente(id, datos) {
  const cliente = normalizar(datos);
  if (USAR_MOCKS) {
    const actual = clientesMock.find((c) => c.id === Number(id));
    if (!actual) return simularError(404, 'Cliente no encontrado');
    if (clientesMock.some((c) => c.documento === cliente.documento && c.id !== actual.id)) {
      return simularError(400, 'Datos inválidos', { documento: 'Ya existe un cliente con ese documento' });
    }
    Object.assign(actual, cliente);
    return simular(actual);
  }
  return apiFetch(`/clientes/${id}`, { method: 'PUT', body: cliente });
}

export function listarVentasDeCliente(id, { pagina = 1, limite = 10 } = {}) {
  if (USAR_MOCKS) {
    return simular(paginar(ventasClientesMock[Number(id)] ?? [], { pagina, limite }));
  }
  const params = new URLSearchParams({ pagina, limite });
  return apiFetch(`/clientes/${id}/ventas?${params}`);
}
