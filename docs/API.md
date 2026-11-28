# TecniFix · Contrato de la API

Qué recibe y qué responde cada ruta del backend. Cada integrante de backend documenta
las suyas.

## Reglas comunes

- Dirección local: `http://localhost:4000`. Las rutas no llevan `/api/`.
- Sesión: cabecera `Authorization: Bearer <token>` (el token lo da `POST /auth/login`).
- Roles: `admin`, `vendedor`, `almacenero`.
- Los números van como número JSON, no como texto (`15.9`, no `"15.90"`).
- Las fechas llegan en formato ISO 8601.

**Listados:** responden `{ "data": [], "total": 0, "pagina": 1, "limite": 10 }` y aceptan
`?pagina=` y `?limite=` (máximo 100). Un valor mal escrito toma el valor por defecto.
`buscar` admite hasta 60 caracteres; si es más largo, se ignora.

**Errores:**

```json
{ "error": "Ya existe un producto con ese SKU" }
```

```json
{ "error": "Datos inválidos", "campos": { "nombre": "El nombre debe tener al menos 3 caracteres" } }
```

| Código | Significado |
|---|---|
| 400 | Datos inválidos |
| 401 | Sin sesión o token vencido |
| 403 | El rol no tiene permiso |
| 404 | No existe |
| 409 | Valor repetido o stock insuficiente |

Hoy un fallo inesperado del servidor también responde 400.

## Permisos por rol

Todas las rutas, salvo `/auth/login` y `/auth/register`, exigen sesión. Sin sesión
responden 401 y con un rol no permitido, 403.

| Rutas | Admin | Vendedor | Almacenero |
|---|:-:|:-:|:-:|
| Clientes: `GET`, `POST`, `PUT` | ✓ | ✓ | — |
| Clientes: `DELETE` | ✓ | — | — |
| Ventas: `GET`, `POST` | ✓ todas | ✓ solo las suyas | — |

El vendedor recibe 404 al pedir una venta de otro usuario. Los permisos de inventario
están en la sección siguiente.

En el backend se aplica con `verificarRol`, después de `authMiddleware`.

---

# Inventario

| Método | Ruta | Admin | Vendedor | Almacenero |
|---|---|:-:|:-:|:-:|
| GET | `/categorias` | ✓ | ✓ | ✓ |
| POST, PUT | `/categorias`, `/categorias/:id` | ✓ | — | ✓ |
| GET | `/proveedores` | ✓ | ✓ | ✓ |
| POST, PUT | `/proveedores`, `/proveedores/:id` | ✓ | — | ✓ |
| GET | `/productos`, `/productos/:id` | ✓ | solo activos | ✓ sin precios |
| POST, PUT, DELETE | `/productos`, `/productos/:id` | ✓ | — | ✓ |
| GET | `/productos/:id/movimientos` | ✓ | — | ✓ |
| GET, POST | `/compras`, `/compras/:id` | ✓ | — | ✓ |
| POST | `/inventario/ajustes` | ✓ | — | — |

## Categorías

`GET /categorias?buscar=&pagina=&limite=` busca por nombre. Cada elemento:

```json
{ "id": 1, "nombre": "Cables" }
```

`POST /categorias` (201) y `PUT /categorias/:id` (200) reciben y devuelven la categoría.

| Campo | Regla |
|---|---|
| `nombre` | Obligatorio, de 3 a 60 caracteres, único sin distinguir mayúsculas |

Errores: 400, 401, 403, 404 (al editar), 409 (nombre repetido). No hay `DELETE`.

## Proveedores

`GET /proveedores?buscar=&pagina=&limite=` busca por razón social o RUC. Cada elemento:

```json
{ "id": 1, "ruc": "20123456789", "razon_social": "Distribuidora de prueba", "telefono": "900000000" }
```

`POST /proveedores` (201) y `PUT /proveedores/:id` (200). `PUT` reemplaza los tres campos.

| Campo | Regla |
|---|---|
| `ruc` | Obligatorio, 11 dígitos, empieza con 10 o 20, único |
| `razon_social` | Obligatoria, de 3 a 150 caracteres |
| `telefono` | Opcional, 9 dígitos. Si no se envía queda en `null` |

Errores: 400, 401, 403, 404 (al editar), 409 (RUC repetido). No hay `DELETE`.

## Productos

`GET /productos?buscar=&categoria=&stockBajo=true&pagina=&limite=`

- `buscar`: nombre o SKU.
- `categoria`: id de la categoría.
- `stockBajo=true`: solo productos activos con `stock <= stock_minimo`.

`GET /productos/:id` devuelve un producto:

```json
{
  "id": 1,
  "sku": "TEC-001",
  "nombre": "Teclado mecánico",
  "categoria_id": 1,
  "categoria_nombre": "General",
  "precio_compra": 120,
  "precio_venta": 189.9,
  "stock": 25,
  "stock_minimo": 5,
  "activo": true
}
```

El almacenero **no recibe** `precio_compra` ni `precio_venta`. El vendedor solo ve
productos activos (un producto desactivado le responde 404).

`POST /productos` (201) y `PUT /productos/:id` (200):

| Campo | Regla | Al crear | Al editar |
|---|---|---|---|
| `sku` | Letras, números y guiones, máximo 30, único. Se guarda en mayúsculas | Obligatorio | Obligatorio |
| `nombre` | De 3 a 150 caracteres | Obligatorio | Obligatorio |
| `categoria_id` | Categoría existente | Obligatorio | Obligatorio |
| `stock_minimo` | Entero, 0 o más | Obligatorio | Obligatorio |
| `precio_compra` | 0 o más, hasta dos decimales | Obligatorio | Opcional |
| `precio_venta` | Mayor que 0, hasta dos decimales | Obligatorio | Opcional |
| `activo` | `true` o `false` | — | Opcional |

- El stock empieza en 0 y no se edita aquí: cambia con compras, ventas y ajustes.
- Al editar, lo opcional que no se envía conserva su valor.
- Solo el admin cambia precios: si el almacenero envía un precio distinto, recibe 403.

`DELETE /productos/:id` (204, sin cuerpo) desactiva el producto; no lo borra. Para
reactivarlo se usa `PUT` con `"activo": true`.

Errores: 400, 401, 403, 404, 409 (SKU repetido).

## Kardex

`GET /productos/:id/movimientos?pagina=&limite=`, del movimiento más reciente al más
antiguo:

```json
{
  "id": 3,
  "producto_id": 1,
  "tipo": "salida",
  "cantidad": -2,
  "stock_resultante": 23,
  "referencia": "venta:B001-000142",
  "motivo": null,
  "usuario_id": 3,
  "usuario_nombre": "Caja 1",
  "fecha": "2026-11-26T22:40:00.000Z"
}
```

- `tipo`: `entrada`, `salida` o `ajuste`.
- `cantidad`: positiva si el stock sube, negativa si baja.
- `referencia`: `compra:<id>` o `venta:<serie y número>`; `null` en los ajustes.
- `motivo`: texto en ajustes y anulaciones; `null` en el resto.

Errores: 400, 401, 403, 404.

## Compras

`GET /compras?buscar=&pagina=&limite=`, de la más reciente a la más antigua; `buscar`
usa la razón social del proveedor. Cada elemento:

```json
{
  "id": 1,
  "proveedor_id": 1,
  "proveedor_nombre": "Distribuidora de prueba",
  "usuario_id": 1,
  "usuario_nombre": "Administrador",
  "total": 70,
  "fecha": "2026-11-26T22:40:00.000Z"
}
```

`GET /compras/:id` agrega las líneas:

```json
"items": [
  {
    "id": 1,
    "producto_id": 2,
    "sku": "MOU-001",
    "producto_nombre": "Mouse inalámbrico",
    "cantidad": 2,
    "costo_unitario": 35,
    "subtotal": 70
  }
]
```

`POST /compras` (201, devuelve la compra con sus líneas):

```json
{
  "proveedor_id": 1,
  "items": [{ "producto_id": 2, "cantidad": 2, "costo_unitario": 35 }]
}
```

| Campo | Regla |
|---|---|
| `proveedor_id` | Proveedor existente |
| `items` | De 1 a 100 líneas, sin repetir producto |
| `items[].producto_id` | Producto existente y activo |
| `items[].cantidad` | Entero de 1 a 1 000 000 |
| `items[].costo_unitario` | Mayor que 0, hasta dos decimales |

El servidor calcula el total, sube el stock y anota el kardex en una sola transacción.
No cambia el `precio_compra` del producto. Los errores de una línea llegan como
`"campos": { "items.0.cantidad": "..." }`.

Errores: 400, 401, 403, 404 (al consultar).

## Ajustes de stock

`POST /inventario/ajustes` (solo admin):

```json
{ "producto_id": 1, "cantidad": -2, "motivo": "Conteo físico" }
```

| Campo | Regla |
|---|---|
| `producto_id` | Producto existente |
| `cantidad` | Entero distinto de 0, entre -1 000 000 y 1 000 000 |
| `motivo` | De 5 a 200 caracteres |

Responde 201 con el movimiento creado (los campos del kardex, sin `usuario_nombre`).
Errores: 400, 401, 403, 404, 409 (el stock quedaría en negativo).

Si una salida o un ajuste deja un producto en su stock mínimo, se avisa por correo al
administrador.

---

# Clientes

| Método | Ruta | Admin | Vendedor | Almacenero |
|---|---|:-:|:-:|:-:|
| GET | `/clientes`, `/clientes/:id` | ✓ | ✓ | — |
| GET | `/clientes/:id/ventas` | ✓ todas | ✓ solo las suyas | — |
| POST, PUT | `/clientes`, `/clientes/:id` | ✓ | ✓ | — |
| DELETE | `/clientes/:id` | ✓ | — | — |

`GET /clientes?buscar=&pagina=&limite=` busca por documento o nombre, sin distinguir
mayúsculas. Cada elemento:

```json
{
  "id": 1,
  "tipo_documento": "DNI",
  "documento": "12345678",
  "nombre": "Ana Pérez",
  "telefono": "987654321",
  "email": "ana@example.com",
  "direccion": "Av. Lima 123"
}
```

`telefono`, `email` y `direccion` valen `null` si no se enviaron.

`POST /clientes` (201) y `PUT /clientes/:id` (200) reciben y devuelven el cliente. `PUT`
reemplaza todos los campos. `GET /clientes/:id` responde 200 con el cliente.
`DELETE /clientes/:id` responde 204 sin cuerpo.

| Campo | Regla |
|---|---|
| `tipo_documento` | Obligatorio: `DNI` o `RUC` |
| `documento` | Obligatorio y único. DNI: 8 dígitos; RUC: 11 dígitos |
| `nombre` | Obligatorio, de 3 a 150 caracteres |
| `telefono` | Opcional, 9 dígitos y empieza con 9 |
| `email` | Opcional, con formato de correo (hasta 150 caracteres) |
| `direccion` | Opcional (hasta 200 caracteres), pero obligatoria si el tipo es `RUC` |

Un campo opcional enviado vacío (`""`) se guarda como `null`.

```json
{ "error": "Datos inválidos", "campos": { "documento": "El DNI debe tener 8 dígitos" } }
```

## Ventas de un cliente

`GET /clientes/:id/ventas?pagina=&limite=` lista las ventas del cliente, de la más
reciente a la más antigua. El administrador ve todas; el vendedor, solo las que él
registró. Cada elemento:

```json
{
  "id": 12,
  "serie_numero": "B001-00000012",
  "tipo_comprobante": "boleta",
  "total": 118,
  "estado": "pagada",
  "fecha": "2026-11-28T15:30:00.000Z"
}
```

`serie_numero` es `null` mientras la venta no tenga numeración.

Errores: 400 (datos o `id` inválidos), 401, 403 (el almacenero, o un vendedor al borrar),
404 (cliente inexistente), 409 (documento repetido; al borrar, el cliente tiene ventas).
