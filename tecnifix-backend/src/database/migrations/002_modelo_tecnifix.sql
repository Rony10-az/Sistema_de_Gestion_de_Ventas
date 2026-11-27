-- Modelo completo de TecniFix (11 tablas, ver docs/modelo-er.png).
-- Amplía las 5 tablas de 001_init.sql sin perder sus datos y crea las 6 que faltan.
-- Usa IF NOT EXISTS para convivir con tablas creadas a mano en una base local.

-- ---------------------------------------------------------------- usuarios
ALTER TABLE usuarios
    ADD COLUMN IF NOT EXISTS intentos_fallidos INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS bloqueado_hasta TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS activo BOOLEAN NOT NULL DEFAULT TRUE;

ALTER TABLE usuarios DROP CONSTRAINT IF EXISTS usuarios_rol_valido;
ALTER TABLE usuarios ADD CONSTRAINT usuarios_rol_valido
    CHECK (rol IN ('admin', 'vendedor', 'almacenero'));

-- ---------------------------------------------------- categorias, proveedores
CREATE TABLE IF NOT EXISTS categorias (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(60) NOT NULL
);
-- "Cables" y "cables" son la misma categoría.
CREATE UNIQUE INDEX IF NOT EXISTS categorias_nombre_unico ON categorias (LOWER(nombre));

CREATE TABLE IF NOT EXISTS proveedores (
    id SERIAL PRIMARY KEY,
    ruc VARCHAR(11) NOT NULL UNIQUE,
    razon_social VARCHAR(150) NOT NULL,
    telefono VARCHAR(9)
);

-- ---------------------------------------------------------------- productos
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns
               WHERE table_schema = current_schema()
                 AND table_name = 'productos' AND column_name = 'precio') THEN
        ALTER TABLE productos RENAME COLUMN precio TO precio_venta;
    END IF;
END $$;

-- "descripcion" (de 001) no está en el modelo; se deja para no borrar datos.
ALTER TABLE productos
    ADD COLUMN IF NOT EXISTS sku VARCHAR(30),
    ADD COLUMN IF NOT EXISTS categoria_id INTEGER REFERENCES categorias(id),
    ADD COLUMN IF NOT EXISTS precio_compra NUMERIC(10, 2) NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS stock_minimo INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS activo BOOLEAN NOT NULL DEFAULT TRUE;

-- Productos que ya existían: reciben un SKU y la categoría "General".
INSERT INTO categorias (nombre)
SELECT 'General' WHERE EXISTS (SELECT 1 FROM productos WHERE categoria_id IS NULL)
ON CONFLICT DO NOTHING;

UPDATE productos SET categoria_id = (SELECT id FROM categorias WHERE LOWER(nombre) = 'general')
WHERE categoria_id IS NULL;

UPDATE productos SET sku = 'PRD-' || id WHERE sku IS NULL;

ALTER TABLE productos
    ALTER COLUMN sku SET NOT NULL,
    ALTER COLUMN categoria_id SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS productos_sku_unico ON productos (UPPER(sku));

ALTER TABLE productos DROP CONSTRAINT IF EXISTS productos_valores_validos;
ALTER TABLE productos ADD CONSTRAINT productos_valores_validos
    CHECK (precio_venta > 0 AND precio_compra >= 0 AND stock >= 0 AND stock_minimo >= 0);

-- ---------------------------------------------------------------- clientes
ALTER TABLE clientes
    ADD COLUMN IF NOT EXISTS tipo_documento VARCHAR(3) NOT NULL DEFAULT 'DNI',
    ADD COLUMN IF NOT EXISTS direccion VARCHAR(200);

ALTER TABLE clientes DROP CONSTRAINT IF EXISTS clientes_tipo_documento_valido;
ALTER TABLE clientes ADD CONSTRAINT clientes_tipo_documento_valido
    CHECK (tipo_documento IN ('DNI', 'RUC'));

-- ------------------------------------------------------------------ ventas
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns
               WHERE table_schema = current_schema()
                 AND table_name = 'ventas' AND column_name = 'creado_en') THEN
        ALTER TABLE ventas RENAME COLUMN creado_en TO fecha;
    END IF;
END $$;

-- serie_numero admite NULL hasta que el módulo de ventas genere la numeración.
ALTER TABLE ventas
    ADD COLUMN IF NOT EXISTS serie_numero VARCHAR(20) UNIQUE,
    ADD COLUMN IF NOT EXISTS tipo_comprobante VARCHAR(10) NOT NULL DEFAULT 'boleta',
    ADD COLUMN IF NOT EXISTS subtotal NUMERIC(10, 2) NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS igv NUMERIC(10, 2) NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS estado VARCHAR(10) NOT NULL DEFAULT 'pagada';

ALTER TABLE ventas DROP CONSTRAINT IF EXISTS ventas_valores_validos;
ALTER TABLE ventas ADD CONSTRAINT ventas_valores_validos
    CHECK (tipo_comprobante IN ('boleta', 'factura') AND estado IN ('pagada', 'anulada')
           AND subtotal >= 0 AND igv >= 0 AND total >= 0);

ALTER TABLE venta_detalle
    ADD COLUMN IF NOT EXISTS subtotal NUMERIC(10, 2) NOT NULL DEFAULT 0;

ALTER TABLE venta_detalle DROP CONSTRAINT IF EXISTS venta_detalle_valores_validos;
ALTER TABLE venta_detalle ADD CONSTRAINT venta_detalle_valores_validos
    CHECK (cantidad > 0 AND precio_unitario >= 0 AND subtotal >= 0);

-- ----------------------------------------------------------------- compras
CREATE TABLE IF NOT EXISTS compras (
    id SERIAL PRIMARY KEY,
    proveedor_id INTEGER NOT NULL REFERENCES proveedores(id),
    usuario_id INTEGER NOT NULL REFERENCES usuarios(id),
    total NUMERIC(10, 2) NOT NULL CHECK (total >= 0),
    fecha TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS compra_detalle (
    id SERIAL PRIMARY KEY,
    compra_id INTEGER NOT NULL REFERENCES compras(id) ON DELETE CASCADE,
    producto_id INTEGER NOT NULL REFERENCES productos(id),
    cantidad INTEGER NOT NULL CHECK (cantidad > 0),
    costo_unitario NUMERIC(10, 2) NOT NULL CHECK (costo_unitario > 0)
);

-- ------------------------------------------------------------------ kardex
CREATE TABLE IF NOT EXISTS movimientos_inventario (
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
CREATE INDEX IF NOT EXISTS movimientos_por_producto ON movimientos_inventario (producto_id, id);

-- ------------------------------------------------------------------- pagos
CREATE TABLE IF NOT EXISTS pagos (
    id SERIAL PRIMARY KEY,
    venta_id INTEGER NOT NULL REFERENCES ventas(id) ON DELETE CASCADE,
    monto NUMERIC(10, 2) NOT NULL CHECK (monto > 0),
    metodo VARCHAR(10) NOT NULL CHECK (metodo IN ('efectivo', 'tarjeta', 'yape')),
    estado VARCHAR(20) NOT NULL DEFAULT 'aprobado',
    referencia VARCHAR(60)
);
