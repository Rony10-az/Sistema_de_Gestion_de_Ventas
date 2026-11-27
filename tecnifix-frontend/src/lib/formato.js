// Formatos que se repiten en toda la app. Úsenlos en lugar de armar el texto a mano,
// así todos los montos y fechas se ven igual.

const soles = new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN', minimumFractionDigits: 2 });
const numero = new Intl.NumberFormat('es-PE');
const fecha = new Intl.DateTimeFormat('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' });
const fechaHora = new Intl.DateTimeFormat('es-PE', {
  day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
});

// 119 → "S/ 119.00"
export function formatearSoles(monto) {
  return soles.format(Number(monto) || 0);
}

// 1250 → "1,250"
export function formatearNumero(valor) {
  return numero.format(Number(valor) || 0);
}

// "2026-11-26T21:12:00Z" → "26/11/2026"
export function formatearFecha(valor) {
  return valor ? fecha.format(new Date(valor)) : '';
}

// "2026-11-26T21:12:00Z" → "26/11/2026, 16:12"
export function formatearFechaHora(valor) {
  return valor ? fechaHora.format(new Date(valor)) : '';
}
