# Backend — TecniFix (Express + PostgreSQL)

API REST en capas. Cada carpeta de `src/` tiene una responsabilidad única; una petición
fluye siempre en el mismo sentido:

```
request → routes → controller → service → repository → PostgreSQL
                                    ↓
response ← controller ← ← ← ← ← ← ┘
```

## Cómo correr

```bash
npm install
npm run env:init          # crea .env; luego escribe tu DB_PASSWORD
npm run db:setup          # crea la base, migra y carga datos de prueba
npm run dev               # nodemon, recarga automática en http://localhost:4000
```

## Base de datos

| Script | Qué hace |
|---|---|
| `npm run db:check` | Prueba la conexión. |
| `npm run db:create` | Crea la base local (`DB_NAME`) si no existe. |
| `npm run db:migrate` | Aplica las migraciones pendientes de `src/database/migrations`. |
| `npm run db:seed` | Carga los datos pendientes de `src/database/seeds`. |
| `npm run db:setup` | `create` + `migrate` + `seed`. |

Cada integrante tiene su propia base local (PostgreSQL instalado o el de Docker, puerto
5434). Lo aplicado se anota en la tabla `schema_migrations`, así que los comandos se
pueden repetir sin duplicar. Un cambio en la base es un archivo nuevo numerado
(`003_...sql` en adelante). Si ya tenías tablas creadas antes, usa otro `DB_NAME`.

Usuarios de prueba (contraseña `tecnifix123`, solo local): `admin@tecnifix.pe`,
`vendedor@tecnifix.pe` y `almacen@tecnifix.pe`.

## Capas

| Carpeta | Qué hace | Qué NO hace |
|---|---|---|
| `routes/` | Define la URL y el verbo HTTP, conecta con un controlador. No valida reglas de negocio. | No habla con la base de datos, no arma respuestas. |
| `controllers/` | Lee `req` (body, params, query), llama al service correspondiente y arma la respuesta HTTP (status + JSON). | No contiene SQL ni reglas de negocio. |
| `services/` | Reglas de negocio: validaciones, cálculos, orquestar varias repositorios, hashear contraseñas, firmar JWT. | No conoce `req`/`res` de Express, no escribe SQL directo. |
| `repositories/` | Única capa que sabe que la base de datos es PostgreSQL. Arma y ejecuta queries SQL con `pg`. | No valida reglas de negocio. |
| `validators/` | Reglas de validación de los datos de cada módulo (`modulo.validator.js`). | No consulta la base de datos. |
| `middlewares/` | Funciones que se ejecutan antes del controlador: verificar JWT y rol, manejar errores. | — |
| `utils/` | Helpers reutilizables sin estado (firmar/verificar JWT, formatear respuestas). | — |
| `database/migrations` | Scripts SQL que crean/alteran tablas. | — |
| `database/seeds` | Scripts SQL con datos de prueba. | — |

## Nombres de archivos

Las carpetas de capas van en inglés, los módulos en español y los archivos siguen la
forma `modulo.capa.js` (ej. `productos.service.js`). Módulos previstos: `auth`,
`usuarios`, `productos`, `categorias`, `proveedores`, `compras`, `inventario`,
`clientes`, `ventas`, `pagos` y `reportes`. Todavía no existen `usuarios`, `pagos` ni
`reportes`.

## Dominios (módulos del negocio)

Cada dominio repite el mismo patrón de archivos: `*.routes.js`, `*.controller.js`,
`*.service.js`, `*.repository.js` y, si valida datos, `*.validator.js`. Esto es
intencional: si un dominio crece mucho, se puede mover tal cual a su propio
microservicio (ver el README raíz del proyecto, sección "Fase actual vs. arquitectura
objetivo").

- **auth** — registro, login y emisión/verificación de JWT.
- **categorias** y **proveedores** — alta, edición y búsqueda.
- **productos** — catálogo: alta, edición, desactivación, búsqueda y filtros.
- **compras** — entrada de mercadería: sube el stock y anota el kardex.
- **inventario** — ajustes de stock, kardex y alerta de stock mínimo.
- **clientes** — datos de clientes que compran.
- **ventas** — registro y consulta de ventas (cálculo y detalle pendientes).

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

Responsable: Jerónimo. ✅ Programado, validado y probado.

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

Ejemplo de uso en [`equipo-backend/README.md`](equipo-backend/README.md#7-cómo-usa-ventas-el-inventario).
El módulo de ventas todavía no las usa.

### Correo de stock mínimo (opcional)

Cuando un producto llega a su stock mínimo, el backend envía un correo al administrador.
Usa **nodemailer**, que se conecta a un servidor de correo (SMTP) con los datos de tu
`.env`. Sin `SMTP_HOST` o `CORREO_ADMIN` no se envía nada y la API funciona igual.

**1. Prepara la cuenta que envía.** Con Gmail, activa la verificación en dos pasos y
crea una [contraseña de aplicación](https://myaccount.google.com/apppasswords). No uses
la contraseña de tu cuenta.

**2. Completa las variables** en tu `.env` local:

| Variable | Qué poner (ejemplo con Gmail) |
|---|---|
| `SMTP_HOST` | `smtp.gmail.com` |
| `SMTP_PORT` | `587` (o `465`) |
| `SMTP_USER` | El correo que envía |
| `SMTP_PASSWORD` | La contraseña de aplicación, sin espacios |
| `CORREO_ADMIN` | El correo que recibe la alerta |

| Cómo ejecutas el backend | Archivo | Después de editarlo |
|---|---|---|
| `npm run dev` | `tecnifix-backend/.env` | Detén y vuelve a ejecutar `npm run dev` |
| Docker | `.env` de la carpeta principal | `docker compose up -d --build backend` |

Los `.env` no se suben a Git: cada integrante pone sus propios datos.

**3. Provoca una alerta.** Inicia sesión como admin y ajusta el stock de un producto
para que baje hasta su mínimo. Por ejemplo, si tiene stock 10 y mínimo 3
(`GET /productos` muestra ambos y el `id`):

```
POST /inventario/ajustes
{ "producto_id": 3, "cantidad": -7, "motivo": "Prueba de alerta" }
```

En Bruno es la petición `inventario / Ajustar stock`, cambiando esos valores.

**Qué esperar:**

- El correo llega con el asunto `Stock mínimo: <producto>`.
- Se envía **una vez**, al pasar de estar sobre el mínimo a estar en él o debajo. Para
  repetir la prueba, primero sube el stock con un ajuste positivo.
- Si el envío falla, el ajuste se guarda igual y la consola muestra
  `No se pudo enviar el correo`.
- Hoy se activa con ajustes de stock; con las ventas se activará cuando usen
  `registrarSalida` y `avisarStockBajo`.

### Cómo probarlo

1. `npm run db:setup` y `npm run dev`.
2. En Bruno, abrir `bruno/`, elegir el entorno **local** e iniciar sesión.
3. Ejecutar las carpetas `categorias`, `proveedores`, `productos`, `compras` e `inventario`.

Los cinco módulos tienen pruebas unitarias y de integración en `tests/`; el correo, unitarias.

### Estado

- [x] Categorías, proveedores y productos
- [x] Compras, ajustes de stock y kardex
- [x] Permisos por rol con `verificarRol`
- [x] Funciones de stock para ventas
- [x] Alerta de stock mínimo por correo (probada con envío simulado)
- [x] Pruebas, colección de Bruno y contrato en `docs/API.md`
- [ ] Probar el correo con un servidor SMTP real
- [x] Variables `SMTP_*` disponibles en Docker (`docker-compose.yml`)

Dependen de otras partes: que ventas use las funciones de stock y las pantallas de
inventario en el frontend.



## Pruebas

```bash
npm run test:unit          # no necesita base de datos
npm run test:integration   # prepara y usa la base tecnifix_test
npm test                   # todas
npm run test:coverage      # todas, con cobertura
```

Detalle en `tests/README.md`. Las peticiones HTTP para probar a mano están en
`bruno/` (colección de Bruno).
