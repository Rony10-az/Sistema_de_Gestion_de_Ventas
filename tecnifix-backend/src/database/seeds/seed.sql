-- Datos de prueba para desarrollo local. No usar en producción.

INSERT INTO categorias (nombre) VALUES ('General') ON CONFLICT DO NOTHING;

INSERT INTO productos (sku, nombre, categoria_id, precio_compra, precio_venta, stock, stock_minimo)
SELECT v.sku, v.nombre, c.id, v.compra, v.venta, v.stock, v.minimo
FROM (VALUES
  ('TEC-001', 'Teclado mecánico', 120.00, 189.90, 25, 5),
  ('MOU-001', 'Mouse inalámbrico', 35.00, 59.90, 50, 10),
  ('MON-001', 'Monitor 24"', 480.00, 649.00, 10, 3)
) AS v(sku, nombre, compra, venta, stock, minimo)
JOIN categorias c ON LOWER(c.nombre) = 'general'
ON CONFLICT DO NOTHING;

INSERT INTO clientes (nombre, email, telefono, documento) VALUES
  ('Juan Pérez', 'juan.perez@example.com', '999111222', '70123456'),
  ('María López', 'maria.lopez@example.com', '999333444', '70234567')
ON CONFLICT DO NOTHING;
