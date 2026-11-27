# Pendientes para el backend

**Para:** Rony, Jerónimo y la pareja de ventas en backend · **De:** equipo frontend (Oscar, Gabriel y la pareja de ventas en frontend) · **Actualizado:** 27 de noviembre de 2026

Aquí el frontend anota lo que necesita del backend para conectar sus pantallas. **No se tocó nada del backend**: son pedidos
para conversarlos. Las pantallas ya funcionan con datos de prueba con la forma que se pide abajo: cuando el backend entregue
el dato, la pantalla ya sabe dónde ponerlo.

Cómo se usa este archivo:
- Lo edita el equipo frontend (Oscar lo mantiene). El backend responde en Discord o en su `tecnifix-backend/equipo-backend/README.md`.
- Las notas de trabajo de cada uno van en la carpeta `notas/` de la raíz, que está en el `.gitignore` y no se sube.
- Cada punto dice si **rompe algo** de lo que ya existe. La idea es que todo se agregue sin cambiar lo que ya funciona.

## Resumen

| # | Tema | Estado | ¿Cambia lo existente? |
|---|---|---|---|
| 1 | Login con clave incorrecta → 401 | Pendiente | Solo el código de respuesta |
| 2 | Contrato de auth, clientes, ventas y pagos en `docs/API.md` | Pendiente | No, es documentación |
| 3 | Rutas de usuarios (solo admin) | Pendiente | No, rutas nuevas |
| 4 | Rutas de dashboard y reportes | Pendiente | No, rutas nuevas |
| 5 | Catálogo público para la tienda | **Nuevo**, por conversar | No, rutas y columnas nuevas opcionales |
| 6 | Reservas de la tienda | **Nuevo**, por decidir | No, tabla nueva |
| 7 | Errores inesperados → 500 | Pendiente | Solo el código de respuesta |
| 8 | CORS con la URL de Vercel | Pendiente | Solo una variable de entorno |
| — | 11 tablas, motivo del ajuste, contrato y paginación de inventario | **Hecho** | — |

---

## 1. Login: responder 401 con clave incorrecta · pendiente

> **Respuesta de backend** (guía de backend, sección 7): pasará a 401.

**Qué necesita el frontend:** **401** con `{ "error": "Correo o contraseña incorrectos" }` y **423** cuando la cuenta está
bloqueada por intentos fallidos (las columnas `intentos_fallidos` y `bloqueado_hasta` ya existen desde la migración 002).
El frontend ya acepta 400 y 401, así que no se rompe mientras tanto.

## 2. Contrato del resto de rutas · pendiente

`docs/API.md` ya tiene todo el inventario (muy claro, gracias). Falta lo mismo para:

| Rutas | Lo usa |
|---|---|
| `POST /auth/login`, `POST /auth/register` | Login (Oscar) |
| `GET/POST/PUT/DELETE /clientes` | Clientes (pareja de ventas) |
| `GET /ventas`, `GET /ventas/:id`, `POST /ventas`, anulación | Historial, comprobante y caja (pareja de ventas) |
| `POST /pagos/simular` | Caja (pareja de ventas) |

Para la caja ya se acordó: `/pagos/simular` solo aprueba o rechaza y `POST /ventas` recibe `metodo_pago` y guarda venta y
pago juntos. Falta escribirlo con el cuerpo exacto y la respuesta (la venta completa con `serie_numero`, `subtotal`, `igv`,
`total` y líneas). Métodos válidos: `efectivo`, `tarjeta`, `yape`. Si falta stock: **409** diciendo qué producto.
Anulación: ¿`PATCH /ventas/:id/anular` con `{ motivo }`? (solo admin; devuelve el stock y deja un movimiento en el kardex).

## 3. Usuarios · pendiente

Pantalla `/usuarios` (solo admin, la hace Oscar). Rutas nuevas propuestas:

| Ruta | Hace |
|---|---|
| `GET /usuarios?buscar=&pagina=&limite=` | Lista paginada, sin `password` |
| `POST /usuarios` | Crea con `{ nombre, email, password, rol }`; 409 si el correo se repite |
| `PUT /usuarios/:id` | Edita nombre, rol y `activo`; la contraseña solo si viene |
| `PATCH /usuarios/:id/desbloquear` | Pone `intentos_fallidos = 0` y `bloqueado_hasta = null` |

Regla: un admin no puede desactivarse a sí mismo ni quitarse el rol (403).

## 4. Dashboard y reportes · pendiente

Rutas nuevas propuestas (la pareja de ventas arma las pantallas con mocks de esta forma):

| Ruta | Respuesta |
|---|---|
| `GET /reportes/resumen` | `{ ventas_hoy, total_hoy, ventas_mes, total_mes, productos_stock_bajo, compras_mes }` según el rol |
| `GET /reportes/ventas?desde=&hasta=&agrupar=dia\|mes` | `[{ periodo, cantidad, total }]` |
| `GET /reportes/top-productos?desde=&hasta=&limite=5` | `[{ producto_id, nombre, unidades, total }]` |

El vendedor solo recibe datos de sus ventas; el almacenero, de stock y compras.

## 5. Catálogo público para la tienda · nuevo, por conversar

La aplicación ahora tiene una **tienda pública** (`/`, `/catalogo`, `/catalogo/[slug]`): el cliente ve los productos con el
stock real y reserva. Hoy usa datos de prueba (`tecnifix-frontend/src/mocks/tienda.mock.js`). Para conectarla hace falta
leer productos **sin sesión**, sin exponer nada interno.

**Propuesta, sin tocar las rutas actuales** (que siguen pidiendo sesión):

| Ruta (sin sesión) | Devuelve |
|---|---|
| `GET /tienda/categorias` | `[{ id, nombre }]` |
| `GET /tienda/productos?buscar=&categoria=&pagina=&limite=` | Solo productos con `activo = true`: `id, sku, nombre, descripcion, categoria_id, precio_venta, stock, stock_minimo` |
| `GET /tienda/productos/:id` | Un producto con los mismos campos |

**Nunca** debe devolver `precio_compra` ni datos de usuarios o proveedores.

**Columnas opcionales** para que la tienda se vea completa (migración nueva, por ejemplo `003`, con valores por defecto
para que nada existente falle): `marca VARCHAR(60)`, `imagen_url VARCHAR(300)` y `slug VARCHAR(160) UNIQUE`. Si no se
agregan, la tienda usa el `id` en la URL y una imagen genérica por categoría.

## 6. Reservas de la tienda · nuevo, por decidir

En la tienda, el cliente arma un carrito y pulsa "Reservar pedido" para pagar y recoger en tienda. Hoy solo se simula.

**Opción A (simple):** no guardar nada; el cliente muestra su carrito en tienda y el vendedor lo cobra en la caja.
**Opción B:** tabla `reservas` (`id, nombre, documento, telefono, estado, fecha`) y `reserva_detalle`
(`reserva_id, producto_id, cantidad`), con `POST /tienda/reservas` sin sesión (validando stock y datos) y una lista
para el vendedor. La reserva **no descuenta stock**: se descuenta cuando se cobra como venta.

El frontend se adapta a la opción que elija el equipo de backend.

## 7. Errores inesperados del servidor · pendiente

`docs/API.md` dice que hoy un fallo inesperado responde 400. Debería ser **500** con `{ "error": "Error interno" }`, para
que el frontend distinga "dato mal enviado" de "el servidor falló" y muestre el mensaje correcto.

## 8. CORS para el despliegue · pendiente

El frontend ya está en **https://tecnifix-frontend.vercel.app**. Cuando el backend esté en línea, agregar esa URL a
`CORS_ORIGIN` (además de `http://localhost:3000`) y pasarnos la URL del backend para ponerla en `NEXT_PUBLIC_API_URL`.

---

## Resueltos

| Tema | Cómo quedó |
|---|---|
| 11 tablas del modelo | Migración `002_modelo_tecnifix.sql`. El frontend ya usa `precio_venta`, `sku` y `activo` |
| Motivo del ajuste de stock | Columna `motivo` en `movimientos_inventario` y `POST /inventario/ajustes` (solo admin) |
| Contrato de inventario | `docs/API.md`: categorías, proveedores, productos, kardex, compras y ajustes |
| Listados paginados de inventario | `{ data, total, pagina, limite }` con `buscar`, `pagina` y `limite` |
| Permisos por rol | `verificarRol` en cada ruta; el almacenero recibe productos sin precios |
| Orden de la caja | `/pagos/simular` solo aprueba; `POST /ventas` guarda venta y pago juntos (falta documentarlo, punto 2) |
