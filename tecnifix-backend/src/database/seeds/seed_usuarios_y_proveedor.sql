-- Un usuario por rol y un proveedor de prueba. No usar en producción.
-- Contraseña de los tres (la misma de los datos de prueba del frontend): tecnifix123

INSERT INTO usuarios (nombre, email, password_hash, rol) VALUES
  ('Rosa Quispe', 'admin@tecnifix.pe', '$2a$10$iSmzao5QNz6is4N3oJZyoOOGBZIIf.pFgZnn/g4ZgBoGQAycH2LWe', 'admin'),
  ('Luis Huamán', 'vendedor@tecnifix.pe', '$2a$10$iSmzao5QNz6is4N3oJZyoOOGBZIIf.pFgZnn/g4ZgBoGQAycH2LWe', 'vendedor'),
  ('Carla Rojas', 'almacen@tecnifix.pe', '$2a$10$iSmzao5QNz6is4N3oJZyoOOGBZIIf.pFgZnn/g4ZgBoGQAycH2LWe', 'almacenero')
ON CONFLICT (email) DO NOTHING;

INSERT INTO categorias (nombre) VALUES ('General') ON CONFLICT DO NOTHING;

INSERT INTO proveedores (ruc, razon_social, telefono)
VALUES ('20123456789', 'Distribuidora de prueba', '900000000')
ON CONFLICT (ruc) DO NOTHING;
