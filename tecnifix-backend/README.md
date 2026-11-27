# Backend — TecniFix (Express + PostgreSQL)

API REST en capas. Cada carpeta de `src/` tiene una responsabilidad única; una petición
fluye siempre en el mismo sentido:

```
request → routes → controller → service → repository → PostgreSQL
                                    ↓
response ← controller ← ← ← ← ← ← ┘
```

## Capas

| Carpeta | Qué hace | Qué NO hace |
|---|---|---|
| `routes/` | Define la URL y el verbo HTTP, conecta con un controlador. No valida reglas de negocio. | No habla con la base de datos, no arma respuestas. |
| `controllers/` | Lee `req` (body, params, query), llama al service correspondiente y arma la respuesta HTTP (status + JSON). | No contiene SQL ni reglas de negocio. |
| `services/` | Reglas de negocio: validaciones, cálculos, orquestar varias repositorios, hashear contraseñas, firmar JWT. | No conoce `req`/`res` de Express, no escribe SQL directo. |
| `repositories/` | Única capa que sabe que la base de datos es PostgreSQL. Arma y ejecuta queries SQL con `pg`. | No valida reglas de negocio. |
| `validators/` | Reglas de validación de los datos de cada módulo (`modulo.validator.js`). | No consulta la base de datos. |
| `middlewares/` | Funciones que se ejecutan antes del controlador: verificar JWT, manejar errores, validar body. | — |
| `utils/` | Helpers reutilizables sin estado (firmar/verificar JWT, formatear respuestas). | — |
| `database/migrations` | Scripts SQL que crean/alteran tablas. | — |
| `database/seeds` | Scripts SQL con datos de prueba. | — |

## Nombres de archivos

Las carpetas de capas van en inglés, los módulos en español y los archivos siguen la
forma `modulo.capa.js` (ej. `productos.service.js`). Módulos previstos: `auth`,
`usuarios`, `productos`, `categorias`, `proveedores`, `compras`, `inventario`,
`clientes`, `ventas`, `pagos` y `reportes`. Faltan `usuarios`, `pagos` y `reportes`.

## Dominios (módulos del negocio)

Cada dominio repite el mismo patrón de archivos: `*.routes.js`, `*.controller.js`,
`*.service.js`, `*.repository.js` y, si valida datos, `*.validator.js`. Esto es
intencional: si un dominio crece mucho, se puede mover tal cual a su propio
microservicio (ver el README raíz del proyecto, sección "Fase actual vs. arquitectura
objetivo").

- **auth** — registro, login, emisión/verificación de JWT, roles de usuario.
- **categorias** y **proveedores** — alta, edición y búsqueda.
- **productos** — catálogo: alta, edición, desactivación, búsqueda y filtros.
- **compras** — entrada de mercadería: sube el stock y anota el kardex.
- **inventario** — ajustes de stock, kardex y alerta de stock mínimo.
- **clientes** — datos de clientes que compran.
- **ventas** — registro de pedidos/ventas, detalle de venta, reportes simples.

## Rutas (sin prefijo `/api/`)

```
POST   /auth/register
POST   /auth/login

GET    /categorias
POST   /categorias
PUT    /categorias/:id

GET    /proveedores
POST   /proveedores
PUT    /proveedores/:id

GET    /productos
GET    /productos/:id
POST   /productos
PUT    /productos/:id
DELETE /productos/:id                 (desactiva, no borra)
GET    /productos/:id/movimientos

GET    /compras
GET    /compras/:id
POST   /compras

POST   /inventario/ajustes

GET    /clientes
GET    /clientes/:id
POST   /clientes
PUT    /clientes/:id
DELETE /clientes/:id

GET    /ventas
GET    /ventas/:id
POST   /ventas
```

Todas piden sesión, menos las de `/auth`. Cuerpos, respuestas, permisos y errores del
inventario: [`../docs/API.md`](../docs/API.md).

## Módulo de inventario

Responsable: Jerónimo. Está programado, validado y probado.

### Qué hace

| Parte | Funcionalidad | Reglas principales |
|---|---|---|
| Categorías | Listar con búsqueda, crear y editar | Nombre de 3 a 60 caracteres, único sin distinguir mayúsculas |
| Proveedores | Listar con búsqueda, crear y editar | RUC de 11 dígitos (empieza con 10 o 20) y único; teléfono opcional |
| Productos | Listar, ver, crear, editar y desactivar; filtros `buscar`, `categoria`, `stockBajo` | SKU único; el stock empieza en 0 y no se edita a mano; solo el admin cambia precios; el almacenero no los ve; el vendedor solo ve activos |
| Compras | Registrar, listar y ver con sus líneas | De 1 a 100 líneas sin repetir producto; el total lo calcula el servidor |
| Ajustes | Sumar o restar stock | Solo admin; motivo obligatorio; el stock no puede quedar negativo |
| Kardex | Historial de movimientos de un producto | Entradas, salidas y ajustes, con usuario, referencia y fecha |
| Alerta de stock | Correo al administrador | Solo cuando el producto pasa a estar en su mínimo; si el correo falla, la operación sigue |

Los listados responden `{ data, total, pagina, limite }`.

### Permisos

| Acción | Admin | Almacenero | Vendedor |
|---|:-:|:-:|:-:|
| Ver categorías, proveedores y productos | ✓ | ✓ (productos sin precios) | ✓ (solo productos activos) |
| Crear y editar categorías, proveedores y productos | ✓ | ✓ (sin cambiar precios) | — |
| Compras y kardex | ✓ | ✓ | — |
| Ajustar stock | ✓ | — | — |

### Cómo se cuida el stock

- Una compra guarda cabecera, detalle, stock y kardex en **una sola transacción**: si
  una línea falla, no se guarda nada.
- El stock se cambia con un `UPDATE` que bloquea la fila hasta el `COMMIT`, y los
  productos se procesan ordenados por id para evitar bloqueos cruzados.
- Una salida o un ajuste que dejaría el stock en negativo responde 409.
- Todo cambio de stock deja una fila en `movimientos_inventario`, con la cantidad con
  signo y el stock resultante.
- El SQL usa parámetros (`$1`, `$2`) y los datos se validan con `zod`.

### Archivos

| Capa (`src/`) | Archivos |
|---|---|
| `routes/`, `controllers/`, `services/`, `repositories/`, `validators/` | `categorias`, `proveedores`, `productos`, `compras`, `inventario` |
| `services/` | `correo.service.js` |

### Tablas

Se crean con `database/migrations/002_modelo_tecnifix.sql` (`npm run db:migrate`).

| Tabla | Columnas |
|---|---|
| `categorias` | `id`, `nombre` |
| `proveedores` | `id`, `ruc`, `razon_social`, `telefono` |
| `productos` | `id`, `sku`, `nombre`, `categoria_id`, `precio_compra`, `precio_venta`, `stock`, `stock_minimo`, `activo` |
| `compras` | `id`, `proveedor_id`, `usuario_id`, `total`, `fecha` |
| `compra_detalle` | `id`, `compra_id`, `producto_id`, `cantidad`, `costo_unitario` |
| `movimientos_inventario` | `id`, `producto_id`, `tipo`, `cantidad`, `stock_resultante`, `referencia`, `motivo`, `usuario_id`, `fecha` |

### Para conectar ventas

| Función | Para qué |
|---|---|
| `productosRepository.bloquearPorIds(client, ids)` | Bloquear los productos y leer precio, stock y estado |
| `inventarioService.registrarSalida(client, datos)` | Descontar stock y anotar la salida; sin stock lanza 409 |
| `inventarioService.registrarDevolucion(client, datos)` | Devolver stock al anular una venta |
| `inventarioService.avisarStockBajo(items)` | Pedir la alerta después del `COMMIT` |

Ejemplo de uso en [`equipo-backend/README.md`](equipo-backend/README.md#cómo-usa-ventas-el-inventario).
El módulo de ventas todavía no las usa.

### Correo (opcional)

Se activa en `.env` con `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD` y
`CORREO_ADMIN` (ver `.env.example`). Sin `SMTP_HOST` o `CORREO_ADMIN` no se envía nada y
la API funciona igual.

### Cómo probarlo

1. `npm run db:setup` y `npm run dev`.
2. En Bruno, abrir `bruno/`, elegir el entorno **local** e iniciar sesión.
3. Ejecutar las carpetas `categorias`, `proveedores`, `productos`, `compras` e `inventario`.

Los cinco módulos tienen pruebas unitarias y de integración en `tests/`; el correo, unitarias.

### Pendiente fuera de este módulo

- Las rutas usan un control de rol propio (`soloRoles`), repetido en cinco archivos; se
  reemplaza por `verificarRol` cuando exista en `middlewares/`.
- Un error inesperado del servidor responde 400 (`error.middleware.js`).
- Faltan las pantallas de categorías, proveedores, compras y kardex en el frontend.
- El envío real de correo no está comprobado con un servidor SMTP: las pruebas lo simulan.
- Con Docker, el backend no recibe las variables `SMTP_*` (faltan en `docker-compose.yml`).

## Cómo correr

```bash
npm install
npm run env:init          # crea .env; luego escribe tu DB_PASSWORD
npm run db:setup          # crea la base, migra y carga datos de prueba
npm run dev               # nodemon, recarga automática
```

## Base de datos

| Script | Qué hace |
|---|---|
| `npm run db:check` | Prueba la conexión. |
| `npm run db:create` | Crea la base local (`DB_NAME`) si no existe. |
| `npm run db:migrate` | Aplica las migraciones pendientes de `src/database/migrations`. |
| `npm run db:seed` | Carga los datos pendientes de `src/database/seeds`. |
| `npm run db:setup` | `create` + `migrate` + `seed`. |

Lo aplicado se anota en la tabla `schema_migrations`, así que se pueden repetir sin
duplicar. Un cambio en la base es un archivo nuevo numerado (`002_...sql`). Si ya
habías cargado `seed.sql` a mano, `db:seed` fallará por registros repetidos.

Se usa PostgreSQL instalado en cada computadora; cada integrante tiene su propia base.

## Pruebas

```bash
npm run test:unit          # no necesita base de datos
npm run test:integration   # prepara y usa la base tecnifix_test
npm test                   # todas
npm run test:coverage      # todas, con cobertura
```

Detalle en `tests/README.md`. Las peticiones HTTP para probar a mano están en
`bruno/` (colección de Bruno).
