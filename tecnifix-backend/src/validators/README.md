# validators

Reglas de validación de cada módulo (`modulo.validator.js`) con `zod`. Cada archivo
exporta los middlewares que usan sus rutas; dejan los datos limpios en `res.locals` y
responden 400 con `{ "error": "Datos inválidos", "campos": { } }`.

| Módulo | Estado |
|---|---|
| `categorias`, `proveedores`, `productos`, `compras`, `inventario` | ✅ |
| `auth`, `clientes`, `ventas` | ⬜ |
