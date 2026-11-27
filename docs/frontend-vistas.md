# TecniFix · Vistas del frontend

Qué pantallas tiene el frontend, qué ve cada rol, qué campos lleva cada formulario, qué ruta de la API usa
y quién la hace. Por ahora importa que **las vistas funcionen**; el diseño fino viene después.

- Plan técnico completo: `docs/plan-tecnico.html` · Modelo de datos: `docs/modelo-er.png`
- Base ya lista (la hizo Oscar): login, menú por rol, protección de páginas, componentes comunes y datos de prueba.
  Cómo usarla: `tecnifix-frontend/README.md`.

## 1. Reglas para todas las vistas

1. **Cada pantalla con datos muestra tres estados**: cargando (`TablaCargando`), vacío (`EstadoVacio`) y error (`EstadoError`).
2. **Formularios**: validan en el navegador antes de enviar y muestran debajo de cada campo los errores que devuelve la API en `campos`.
3. **Avisos**: `toast.success` al guardar y `toast.error` cuando la API falla.
4. **Listados**: paginados de 10 en 10 (`Paginacion`) y con `Buscador` cuando tiene sentido.
5. **Montos y fechas**: siempre con `formatearSoles` y `formatearFecha` de `src/lib/formato.js`.
6. **Acciones que no se deshacen** (desactivar, anular): siempre con `ConfirmarDialogo`.
7. **Datos de prueba**: cada uno arma su `src/mocks/<modulo>.mock.js` con los **mismos nombres de campos de la base de datos**.
   Así, cuando el backend de Rony tenga la ruta, solo se cambia `NEXT_PUBLIC_USE_MOCKS=false` y la pantalla sigue funcionando.
8. **Botones por rol**: si el rol no puede hacer algo, el botón no se muestra (el backend igual lo rechaza con 403).

## 2. Qué ve cada rol

| Vista | Ruta | Admin | Vendedor | Almacenero | Responsable |
|---|---|:-:|:-:|:-:|---|
| Iniciar sesión | `/login` | ✓ | ✓ | ✓ | Oscar · **lista** |
| Dashboard | `/dashboard` | completo | sus ventas | stock y compras | Pareja de ventas |
| Productos | `/productos` | ✓ | solo ver | ✓ | Gabriel |
| Nuevo producto | `/productos/nuevo` | ✓ | — | ✓ | Gabriel |
| Detalle, edición y kardex | `/productos/[id]` | ✓ | solo ver | ✓ sin precios | Gabriel |
| Categorías | `/categorias` | ✓ | — | ✓ | Gabriel |
| Proveedores | `/proveedores` | ✓ | — | ✓ | Gabriel |
| Compras (lista, nueva, detalle) | `/compras`, `/compras/nueva`, `/compras/[id]` | ✓ | — | ✓ | Gabriel |
| Clientes (lista y ficha) | `/clientes`, `/clientes/[id]` | ✓ | ✓ | — | Pareja de ventas |
| Historial de ventas | `/ventas` | todas | las suyas | — | Pareja de ventas |
| Caja: nueva venta | `/ventas/nueva` | ✓ | ✓ | — | Pareja de ventas |
| Comprobante y anulación | `/ventas/[id]` | ✓ anula | ✓ solo ver | — | Pareja de ventas |
| Reportes | `/reportes` | ✓ | — | — | Pareja de ventas |
| Usuarios | `/usuarios` | ✓ | — | — | Oscar |

"Pareja de ventas" = Jacqueline y Chinchaiguara, por turnos (la que esté en frontend ese día).
El menú y el bloqueo por rol ya están en `src/lib/roles.js`: si una ruta nueva necesita otro permiso, se le pide a Oscar.

## 3. Detalle de cada vista

### Oscar · base, usuarios

**Login** `/login` · `POST /auth/login` — **lista**.
Correo y contraseña obligatorios, formato de correo, ver/ocultar contraseña, mensaje si la clave es incorrecta (400 o 401)
o si la cuenta está bloqueada (423). Vuelve a la página que se quería abrir.

**Usuarios** `/usuarios` (solo admin) · `GET/POST /usuarios`, `PUT /usuarios/:id`
- Tabla: nombre, correo, rol, estado (activo / inactivo / bloqueado hasta…), acciones.
- Crear (en un diálogo): nombre (obligatorio, 3–120), correo (obligatorio, formato, único → error 409 de la API),
  rol (admin, vendedor, almacenero), contraseña temporal (mínimo 8).
- Editar: nombre, rol, activo. El administrador no puede desactivarse a sí mismo.
- Mock: `src/mocks/usuarios.mock.js` · Service: `src/services/usuarios.service.js`.

### Gabriel · inventario

**Productos** `/productos` · `GET /productos?buscar=&categoria=&stockBajo=&pagina=`
- Tabla: SKU, nombre, categoría, precio de venta, stock (marcado en rojo si `stock <= stock_minimo`), estado, acciones.
- Filtros: buscador (nombre o SKU), categoría, casilla "Solo stock bajo".
- Botón "Nuevo producto" solo para admin y almacenero.

**Nuevo producto** `/productos/nuevo` · `POST /productos`
| Campo | Regla |
|---|---|
| `sku` | obligatorio, único, letras, números y guiones, máx. 30 |
| `nombre` | obligatorio, 3–150 |
| `categoria_id` | obligatorio (lista de categorías) |
| `precio_compra` | obligatorio, ≥ 0, dos decimales |
| `precio_venta` | obligatorio, > 0; avisar si es menor que el precio de compra |
| `stock_minimo` | obligatorio, entero ≥ 0 |

El stock empieza en 0: solo sube con compras y cambia con ventas o ajustes. Nunca se edita a mano en este formulario.

**Detalle del producto** `/productos/[id]` · `GET/PUT /productos/:id`, `GET /productos/:id/movimientos`
- Datos editables (los mismos campos; el almacenero no ve ni cambia precios), botón "Desactivar" (`DELETE`, con confirmación).
- **Kardex**: fecha, tipo (entrada, salida, ajuste), cantidad (+/−), stock resultante, referencia (boleta o compra), usuario.
- **Ajustar stock** (solo admin, en un diálogo) · `POST /inventario/ajustes`: cantidad (entero distinto de 0, puede ser negativa)
  y motivo (obligatorio, 5–200, por ejemplo "conteo físico"). *Pendiente con backend: dónde se guarda el motivo.*

**Categorías** `/categorias` · `GET/POST/PUT /categorias`
- Tabla y diálogo con un solo campo: `nombre` (obligatorio, único, 3–60). Si tiene productos, la API no deja borrarla (409).

**Proveedores** `/proveedores` · `GET/POST/PUT /proveedores`
- Tabla: RUC, razón social, teléfono. Campos: `ruc` (11 dígitos, empieza con 10 o 20), `razon_social` (obligatorio), `telefono` (opcional, 9 dígitos).

**Compras** `/compras`, `/compras/nueva`, `/compras/[id]` · `GET/POST /compras`, `GET /compras/:id`
- Lista: fecha, proveedor, registrado por, total, ver.
- Nueva compra: proveedor (obligatorio) y una o más líneas con producto, cantidad (entero > 0) y costo unitario (> 0).
  El total se calcula en pantalla y el servidor lo vuelve a calcular. Al guardar, el stock de cada producto sube.
- Detalle: cabecera y líneas.

Mocks: `productos.mock.js` (productos y movimientos), `categorias.mock.js`, `proveedores.mock.js`, `compras.mock.js`.
Services: `productos`, `categorias`, `proveedores`, `compras`, `inventario` (ajustes).

### Pareja de ventas (Jacqueline y Chinchaiguara) · clientes, ventas y reportes

**Clientes** `/clientes`, `/clientes/[id]` · `GET/POST /clientes?buscar=`, `GET/PUT /clientes/:id`, `GET /clientes/:id/ventas`
| Campo | Regla |
|---|---|
| `tipo_documento` | DNI o RUC |
| `documento` | DNI: 8 dígitos · RUC: 11 dígitos · único |
| `nombre` | obligatorio (razón social si es RUC) |
| `telefono` | opcional, 9 dígitos, empieza con 9 |
| `email` | opcional, formato de correo |
| `direccion` | opcional; obligatoria si se le va a emitir factura |

- Lista con buscador (documento o nombre). Ficha con sus datos e **historial de compras** (fecha, comprobante, total, estado).
- El mismo formulario se reutiliza dentro de la caja para registrar un cliente nuevo.

**Caja · nueva venta** `/ventas/nueva` (la pantalla más importante de la demo)
1. Buscar producto (`GET /productos?buscar=`, de Gabriel: se **importa** su service, no se modifica). Solo activos y con stock.
2. Carrito: producto, precio unitario (el del producto, no editable), cantidad (1 hasta el stock), subtotal, quitar.
3. Cliente: buscar por documento; si no existe, "Registrar cliente" en un diálogo.
4. Comprobante: boleta o factura (factura solo si el cliente tiene RUC).
5. Totales en pantalla: operación gravada = total ÷ 1.18, IGV 18 % y total. El servidor los recalcula.
6. Pago: efectivo (con monto recibido y vuelto), tarjeta o Yape.
7. "Cobrar" → `POST /pagos/simular` y, si se aprueba, `POST /ventas` con `cliente_id`, `tipo_comprobante`, `metodo_pago` e
   `items: [{ producto_id, cantidad }]`. Si la API responde 409 (sin stock), se avisa qué producto falta.
   *Pendiente con backend: confirmar este orden de llamadas.*
8. Al terminar, ir a `/ventas/[id]` con el comprobante.

**Comprobante** `/ventas/[id]` · `GET /ventas/:id`, `PATCH /ventas/:id/anular`
- Serie y número (B001-000142), fecha, cliente, vendedor, líneas, operación gravada, IGV, total, método de pago, estado.
- Solo admin: "Anular venta" con confirmación; el stock vuelve a subir y el estado pasa a anulada.

**Historial** `/ventas` · `GET /ventas?desde=&hasta=&estado=&buscar=&pagina=`
- Tabla: comprobante, fecha, cliente, vendedor, total, estado. Filtros por fechas, estado y búsqueda.
- Botón "Nueva venta". El vendedor solo ve sus ventas (lo filtra el backend).

**Dashboard** `/dashboard` · `/reportes/resumen`, `/reportes/productos-mas-vendidos`, `/productos?stockBajo=true`, `/ventas?limite=5`, `/compras?limite=5`
- Admin: vendido hoy, vendido en el mes, número de ventas de hoy, productos con stock bajo, gráfico de ventas de los últimos 30 días,
  5 productos más vendidos y últimas ventas.
- Vendedor: sus ventas de hoy (total y número), sus últimas ventas y botón "Nueva venta".
- Almacenero: productos con stock bajo, últimas compras y botón "Registrar compra" (usa los services de Gabriel sin modificarlos).

**Reportes** `/reportes` (solo admin) · `GET /reportes/resumen?desde=&hasta=`, `GET /reportes/productos-mas-vendidos`
- Rango de fechas, total vendido, número de ventas, ticket promedio, gráfico de ventas por día, ventas por vendedor y productos más vendidos.
- Para los gráficos se usa una librería (por ejemplo Recharts): **la instala Oscar**, no cada uno.

Mocks: `clientes.mock.js`, `ventas.mock.js`, `reportes.mock.js`. Services: `clientes`, `ventas`, `pagos`, `reportes`.

## 4. Archivos de cada uno (para no pisarse en `main`)

| Persona | Crea o modifica solo esto en `tecnifix-frontend/src/` |
|---|---|
| Oscar | `app/layout.js`, `app/page.js`, `app/robots.js`, `app/not-found.js`, `app/(publico)/`, `app/(panel)/layout.js`, `app/(panel)/usuarios/`, `components/ui/`, `components/layout/`, `context/`, `hooks/`, `lib/`, `mocks/auth.mock.js`, `mocks/usuarios.mock.js`, services `auth` y `usuarios`, `package.json` |
| Gabriel | `app/(panel)/productos/`, `categorias/`, `proveedores/`, `compras/`, `components/inventario/`, mocks y services de `productos`, `categorias`, `proveedores`, `compras`, `inventario` |
| Pareja de ventas | `app/(panel)/clientes/`, `ventas/`, `dashboard/`, `reportes/`, `components/clientes/`, `ventas/`, `dashboard/`, mocks y services de `clientes`, `ventas`, `pagos`, `reportes` |

- **Importar sí, modificar no**: si necesitas una función de otro (por ejemplo la caja usa `listarProductos`), la importas; si le falta algo, se lo pides a su dueño.
- **Nadie toca `tecnifix-backend/`** desde el equipo de frontend.
- Antes de cada commit: `git pull --rebase origin main`, `npm run lint` y `npm run build`. Commits pequeños y aviso en `#tecnifix-avisos`.

## 5. Pendientes para coordinar con el backend de Rony

El seguimiento detallado de estos pedidos está en `docs/pendientes-backend.md`.

| Tema | Qué espera el frontend |
|---|---|
| Login con clave incorrecta | Responder **401** (hoy responde 400; el frontend acepta los dos) |
| Listados | Responder `{ data, total, pagina, limite }` (hoy `GET /productos` devuelve una lista simple) |
| Tablas nuevas | Categorías, proveedores, compras, movimientos y pagos (hoy la base tiene 5 de las 11 tablas) |
| Ajustes de stock | Dónde se guarda el motivo del ajuste |
| Caja | Orden de las llamadas: `/pagos/simular` y luego `/ventas` |
| Contrato | Publicar `docs/API.md` con el cuerpo y la respuesta de cada ruta |
