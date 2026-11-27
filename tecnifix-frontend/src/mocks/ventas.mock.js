// Datos de prueba del módulo Ventas (NEXT_PUBLIC_USE_MOCKS=true).
// Son las mismas 12 ventas de ventasClientesMock (clientes.mock.js), con su detalle.
// Mismos nombres de campos que las tablas `ventas` y `detalle_ventas` del backend.
//
// Los montos cuadran: subtotal (operación gravada, sin IGV) + igv (18 %) = total,
// y la suma de los subtotales de los items es igual al subtotal de la venta.
// Los precios de los items son sin IGV (precio de lista con IGV ÷ 1.18).

import { clientesMock } from './clientes.mock';

const VENDEDORES = {
  1: 'Rosa Quispe',
  2: 'Luis Huamán',
};

const nombreCliente = (id) => clientesMock.find((c) => c.id === id)?.nombre ?? '';

const item = (producto_id, nombre, cantidad, precio_unitario) => ({
  producto_id,
  nombre,
  cantidad,
  precio_unitario,
  subtotal: Math.round(cantidad * precio_unitario * 100) / 100,
});

const venta = (id, serie_numero, fecha, cliente_id, vendedor_id, metodo_pago, estado, subtotal, igv, total, items) => ({
  id,
  serie_numero,
  tipo_comprobante: serie_numero.startsWith('F') ? 'factura' : 'boleta',
  cliente_id,
  cliente_nombre: nombreCliente(cliente_id),
  vendedor_id,
  vendedor_nombre: VENDEDORES[vendedor_id],
  subtotal,
  igv,
  total,
  estado,
  metodo_pago,
  fecha,
  items,
});

export const ventasMock = [
  venta(1, 'B001-000003', '2026-10-18T18:45:00Z', 1, 2, 'efectivo', 'anulada', 195.68, 35.22, 230.9, [
    item(101, 'Cargador USB-C 65 W', 1, 76.19),
    item(105, 'Teclado USB', 1, 42.29),
    item(112, 'Audífonos Bluetooth', 1, 77.2),
  ]),
  venta(2, 'F001-000001', '2026-10-28T11:30:00Z', 3, 1, 'tarjeta', 'pagada', 644.07, 115.93, 760.0, [
    item(110, 'SSD 480 GB', 2, 160.93),
    item(109, 'Memoria RAM DDR4 8 GB', 2, 93.22),
    item(113, 'Disco duro externo 1 TB', 1, 135.77),
  ]),
  venta(3, 'F001-000002', '2026-11-02T10:00:00Z', 8, 1, 'tarjeta', 'pagada', 4406.78, 793.22, 5200.0, [
    item(109, 'Memoria RAM DDR4 8 GB', 20, 93.22),
    item(110, 'SSD 480 GB', 10, 160.93),
    item(114, 'Monitor 24" Full HD', 1, 933.08),
  ]),
  venta(4, 'B001-000007', '2026-11-05T10:12:00Z', 1, 2, 'yape', 'pagada', 38.56, 6.94, 45.5, [
    item(106, 'Memoria USB 64 GB', 1, 29.58),
    item(115, 'Limpiador de pantallas', 1, 8.98),
  ]),
  venta(5, 'F001-000003', '2026-11-10T14:05:00Z', 3, 1, 'tarjeta', 'pagada', 2059.75, 370.75, 2430.5, [
    item(105, 'Teclado USB', 10, 42.29),
    item(107, 'Mouse inalámbrico', 10, 38.14),
    item(116, 'Impresora multifuncional', 1, 1255.45),
  ]),
  venta(6, 'B001-000009', '2026-11-12T13:25:00Z', 6, 2, 'yape', 'anulada', 127.12, 22.88, 150.0, [
    item(103, 'Funda para Samsung A54', 2, 33.81),
    item(102, 'Mica templada iPhone 13', 1, 25.34),
    item(117, 'Cable USB-C a Lightning 1 m', 1, 34.16),
  ]),
  venta(7, 'F001-000004', '2026-11-15T16:10:00Z', 5, 1, 'efectivo', 'pagada', 830.51, 149.49, 980.0, [
    item(101, 'Cargador USB-C 65 W', 5, 76.19),
    item(104, 'Cable HDMI 2 m', 5, 21.1),
    item(107, 'Mouse inalámbrico', 5, 38.14),
    item(118, 'Hub USB-C 7 en 1', 1, 153.36),
  ]),
  venta(8, 'B001-000010', '2026-11-18T12:00:00Z', 2, 2, 'tarjeta', 'pagada', 76.19, 13.71, 89.9, [
    item(101, 'Cargador USB-C 65 W', 1, 76.19),
  ]),
  venta(9, 'B001-000012', '2026-11-20T15:30:00Z', 1, 2, 'efectivo', 'pagada', 100.85, 18.15, 119.0, [
    item(103, 'Funda para Samsung A54', 1, 33.81),
    item(102, 'Mica templada iPhone 13', 1, 25.34),
    item(119, 'Soporte de celular para auto', 1, 41.7),
  ]),
  venta(10, 'B001-000013', '2026-11-22T19:15:00Z', 10, 2, 'yape', 'pagada', 32.63, 5.87, 38.5, [
    item(102, 'Mica templada iPhone 13', 1, 25.34),
    item(120, 'Protector de lente de cámara', 1, 7.29),
  ]),
  venta(11, 'F001-000005', '2026-11-24T09:20:00Z', 3, 1, 'tarjeta', 'pagada', 1567.8, 282.2, 1850.0, [
    item(110, 'SSD 480 GB', 4, 160.93),
    item(105, 'Teclado USB', 5, 42.29),
    item(107, 'Mouse inalámbrico', 5, 38.14),
    item(121, 'Impresora térmica de tickets', 1, 521.93),
  ]),
  venta(12, 'B001-000014', '2026-11-25T17:00:00Z', 6, 1, 'efectivo', 'pagada', 54.24, 9.76, 64.0, [
    item(104, 'Cable HDMI 2 m', 1, 21.1),
    item(122, 'Adaptador USB-C a HDMI', 1, 33.14),
  ]),
];
