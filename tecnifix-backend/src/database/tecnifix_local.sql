-- TecniFix: base de datos LOCAL completa (11 tablas y datos de prueba).
--
-- Se carga una sola vez sobre una base VACÍA; no hace falta ejecutar migraciones.
-- Si las tablas ya existen, el script se detiene sin cambiar nada.
-- Pasos en tecnifix-backend/README.md, sección "Base de datos local con el script".
--
-- Usuarios de prueba (contraseña: tecnifix123), solo para desarrollo local:
--   admin@tecnifix.pe · vendedor@tecnifix.pe · almacen@tecnifix.pe

SET client_encoding = 'UTF8';

BEGIN;

CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(120) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    rol VARCHAR(20) NOT NULL DEFAULT 'vendedor',
    intentos_fallidos INTEGER NOT NULL DEFAULT 0,
    bloqueado_hasta TIMESTAMPTZ,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    creado_en TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT usuarios_rol_valido CHECK (rol IN ('admin', 'vendedor', 'almacenero'))
);

CREATE TABLE categorias (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(60) NOT NULL
);
-- "Cables" y "cables" son la misma categoría.
CREATE UNIQUE INDEX categorias_nombre_unico ON categorias (LOWER(nombre));

CREATE TABLE proveedores (
    id SERIAL PRIMARY KEY,
    ruc VARCHAR(11) NOT NULL UNIQUE,
    razon_social VARCHAR(150) NOT NULL,
    telefono VARCHAR(9)
);

CREATE TABLE productos (
    id SERIAL PRIMARY KEY,
    sku VARCHAR(30) NOT NULL,
    nombre VARCHAR(150) NOT NULL,
    descripcion TEXT, -- sin uso en la API
    categoria_id INTEGER NOT NULL REFERENCES categorias(id),
    precio_compra NUMERIC(10, 2) NOT NULL DEFAULT 0,
    precio_venta NUMERIC(10, 2) NOT NULL,
    stock INTEGER NOT NULL DEFAULT 0,
    stock_minimo INTEGER NOT NULL DEFAULT 0,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    creado_en TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT productos_valores_validos
        CHECK (precio_venta > 0 AND precio_compra >= 0 AND stock >= 0 AND stock_minimo >= 0)
);
CREATE UNIQUE INDEX productos_sku_unico ON productos (UPPER(sku));

CREATE TABLE clientes (
    id SERIAL PRIMARY KEY,
    tipo_documento VARCHAR(3) NOT NULL DEFAULT 'DNI',
    documento VARCHAR(30) UNIQUE,
    nombre VARCHAR(150) NOT NULL,
    telefono VARCHAR(30),
    email VARCHAR(150),
    direccion VARCHAR(200),
    creado_en TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT clientes_tipo_documento_valido CHECK (tipo_documento IN ('DNI', 'RUC'))
);

CREATE TABLE ventas (
    id SERIAL PRIMARY KEY,
    serie_numero VARCHAR(20) UNIQUE,
    cliente_id INTEGER REFERENCES clientes(id),
    vendedor_id INTEGER REFERENCES usuarios(id),
    tipo_comprobante VARCHAR(10) NOT NULL DEFAULT 'boleta',
    subtotal NUMERIC(10, 2) NOT NULL DEFAULT 0,
    igv NUMERIC(10, 2) NOT NULL DEFAULT 0,
    total NUMERIC(10, 2) NOT NULL DEFAULT 0,
    estado VARCHAR(10) NOT NULL DEFAULT 'pagada',
    fecha TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT ventas_valores_validos
        CHECK (tipo_comprobante IN ('boleta', 'factura') AND estado IN ('pagada', 'anulada')
               AND subtotal >= 0 AND igv >= 0 AND total >= 0)
);

CREATE TABLE venta_detalle (
    id SERIAL PRIMARY KEY,
    venta_id INTEGER REFERENCES ventas(id) ON DELETE CASCADE,
    producto_id INTEGER REFERENCES productos(id),
    cantidad INTEGER NOT NULL,
    precio_unitario NUMERIC(10, 2) NOT NULL,
    subtotal NUMERIC(10, 2) NOT NULL DEFAULT 0,
    CONSTRAINT venta_detalle_valores_validos
        CHECK (cantidad > 0 AND precio_unitario >= 0 AND subtotal >= 0)
);

CREATE TABLE compras (
    id SERIAL PRIMARY KEY,
    proveedor_id INTEGER NOT NULL REFERENCES proveedores(id),
    usuario_id INTEGER NOT NULL REFERENCES usuarios(id),
    total NUMERIC(10, 2) NOT NULL CHECK (total >= 0),
    fecha TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE compra_detalle (
    id SERIAL PRIMARY KEY,
    compra_id INTEGER NOT NULL REFERENCES compras(id) ON DELETE CASCADE,
    producto_id INTEGER NOT NULL REFERENCES productos(id),
    cantidad INTEGER NOT NULL CHECK (cantidad > 0),
    costo_unitario NUMERIC(10, 2) NOT NULL CHECK (costo_unitario > 0)
);

CREATE TABLE movimientos_inventario (
    id SERIAL PRIMARY KEY,
    producto_id INTEGER NOT NULL REFERENCES productos(id),
    tipo VARCHAR(10) NOT NULL CHECK (tipo IN ('entrada', 'salida', 'ajuste')),
    cantidad INTEGER NOT NULL CHECK (cantidad <> 0), -- con signo
    stock_resultante INTEGER NOT NULL CHECK (stock_resultante >= 0),
    referencia VARCHAR(60),                          -- compra:<id> o venta:<serie>
    motivo VARCHAR(200),                             -- ajustes y anulaciones
    usuario_id INTEGER NOT NULL REFERENCES usuarios(id),
    fecha TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX movimientos_por_producto ON movimientos_inventario (producto_id, id);

CREATE TABLE pagos (
    id SERIAL PRIMARY KEY,
    venta_id INTEGER NOT NULL REFERENCES ventas(id) ON DELETE CASCADE,
    monto NUMERIC(10, 2) NOT NULL CHECK (monto > 0),
    metodo VARCHAR(10) NOT NULL CHECK (metodo IN ('efectivo', 'tarjeta', 'yape')),
    estado VARCHAR(20) NOT NULL DEFAULT 'aprobado',
    referencia VARCHAR(60)
);

-- ------------------------------------------------------------ datos de prueba

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

INSERT INTO usuarios (nombre, email, password_hash, rol) VALUES
  ('Rosa Quispe', 'admin@tecnifix.pe', '$2a$10$iSmzao5QNz6is4N3oJZyoOOGBZIIf.pFgZnn/g4ZgBoGQAycH2LWe', 'admin'),
  ('Luis Huamán', 'vendedor@tecnifix.pe', '$2a$10$iSmzao5QNz6is4N3oJZyoOOGBZIIf.pFgZnn/g4ZgBoGQAycH2LWe', 'vendedor'),
  ('Carla Rojas', 'almacen@tecnifix.pe', '$2a$10$iSmzao5QNz6is4N3oJZyoOOGBZIIf.pFgZnn/g4ZgBoGQAycH2LWe', 'almacenero')
ON CONFLICT (email) DO NOTHING;

INSERT INTO categorias (nombre) VALUES ('General') ON CONFLICT DO NOTHING;

INSERT INTO proveedores (ruc, razon_social, telefono)
VALUES ('20123456789', 'Distribuidora de prueba', '900000000')
ON CONFLICT (ruc) DO NOTHING;

-- Marca la base como al día: así "db:migrate" y Docker no intentan cambiarla.
CREATE TABLE schema_migrations (
    nombre TEXT PRIMARY KEY,
    aplicado_en TIMESTAMP NOT NULL DEFAULT NOW()
);
INSERT INTO schema_migrations (nombre) VALUES
  ('migrations/001_init.sql'),
  ('migrations/002_modelo_tecnifix.sql'),
  ('seeds/seed.sql'),
  ('seeds/seed_usuarios_y_proveedor.sql');

COMMIT;
