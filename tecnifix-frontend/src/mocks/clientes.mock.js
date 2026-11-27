// Datos de prueba del módulo Clientes (NEXT_PUBLIC_USE_MOCKS=true).
// Mismos nombres de campos que la tabla `clientes` y `ventas` del backend.

export const clientesMock = [
  { id: 1, tipo_documento: 'DNI', documento: '45123678', nombre: 'Carlos Ramírez Soto', telefono: '987654321', email: 'carlos.ramirez@correo.pe', direccion: 'Av. Los Olivos 123, Lima' },
  { id: 2, tipo_documento: 'DNI', documento: '70234561', nombre: 'María Fernández Quispe', telefono: '912345678', email: 'maria.fernandez@correo.pe', direccion: 'Jr. Cusco 456, Breña' },
  { id: 3, tipo_documento: 'RUC', documento: '20512345678', nombre: 'Ferretería El Constructor S.A.C.', telefono: '945123789', email: 'compras@elconstructor.pe', direccion: 'Av. Argentina 2345, Callao' },
  { id: 4, tipo_documento: 'DNI', documento: '41876253', nombre: 'José Huamán Torres', telefono: '', email: '', direccion: '' },
  { id: 5, tipo_documento: 'RUC', documento: '20601234567', nombre: 'Servicios Eléctricos Andes E.I.R.L.', telefono: '956789012', email: 'ventas@electricosandes.pe', direccion: 'Calle Los Pinos 78, San Miguel' },
  { id: 6, tipo_documento: 'DNI', documento: '72345690', nombre: 'Lucía Paredes Vargas', telefono: '934567891', email: 'lucia.paredes@correo.pe', direccion: 'Av. Brasil 890, Jesús María' },
  { id: 7, tipo_documento: 'DNI', documento: '46789012', nombre: 'Pedro Castillo Mendoza', telefono: '', email: 'pedro.castillo@correo.pe', direccion: '' },
  { id: 8, tipo_documento: 'RUC', documento: '20456789012', nombre: 'Constructora Pacífico S.A.', telefono: '923456780', email: 'logistica@cpacifico.pe', direccion: 'Av. Javier Prado Este 4500, Surco' },
  { id: 9, tipo_documento: 'DNI', documento: '43210987', nombre: 'Rosa Gutiérrez Luna', telefono: '998877665', email: '', direccion: 'Jr. Huancavelica 12, Cercado de Lima' },
  { id: 10, tipo_documento: 'DNI', documento: '75432109', nombre: 'Andrés Salazar Rivas', telefono: '901234567', email: 'andres.salazar@correo.pe', direccion: 'Calle Las Flores 321, Comas' },
];

// Historial de ventas por id de cliente: { serie_numero, fecha, total, estado }.
export const ventasClientesMock = {
  1: [
    { serie_numero: 'B001-000012', fecha: '2026-11-20T15:30:00Z', total: 119.0, estado: 'pagada' },
    { serie_numero: 'B001-000007', fecha: '2026-11-05T10:12:00Z', total: 45.5, estado: 'pagada' },
    { serie_numero: 'B001-000003', fecha: '2026-10-18T18:45:00Z', total: 230.9, estado: 'anulada' },
  ],
  2: [{ serie_numero: 'B001-000010', fecha: '2026-11-18T12:00:00Z', total: 89.9, estado: 'pagada' }],
  3: [
    { serie_numero: 'F001-000005', fecha: '2026-11-24T09:20:00Z', total: 1850.0, estado: 'pagada' },
    { serie_numero: 'F001-000003', fecha: '2026-11-10T14:05:00Z', total: 2430.5, estado: 'pagada' },
    { serie_numero: 'F001-000001', fecha: '2026-10-28T11:30:00Z', total: 760.0, estado: 'pagada' },
  ],
  5: [{ serie_numero: 'F001-000004', fecha: '2026-11-15T16:10:00Z', total: 980.0, estado: 'pagada' }],
  6: [
    { serie_numero: 'B001-000014', fecha: '2026-11-25T17:00:00Z', total: 64.0, estado: 'pagada' },
    { serie_numero: 'B001-000009', fecha: '2026-11-12T13:25:00Z', total: 150.0, estado: 'anulada' },
  ],
  8: [{ serie_numero: 'F001-000002', fecha: '2026-11-02T10:00:00Z', total: 5200.0, estado: 'pagada' }],
  10: [{ serie_numero: 'B001-000013', fecha: '2026-11-22T19:15:00Z', total: 38.5, estado: 'pagada' }],
};
