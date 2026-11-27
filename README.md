# TecniFix · Sistema de gestión de ventas e inventario

Proyecto del curso **Desarrollo de Aplicaciones Web Avanzado** (5to ciclo, Tecsup, 2026-2).

TecniFix: sistema de ventas e inventario para una tienda de repuestos y accesorios, con backend en **Express** (API REST en capas: rutas → controladores →
servicios → repositorios) y frontend en **Next.js**. Base de datos **PostgreSQL**.
Seguridad con **JWT** (autenticación) y **CORS** (control de origen), pensada para
seguir escalando (rate limiting, roles más finos, etc. se añaden sobre esta misma base).

## Fase actual vs. arquitectura objetivo

El diagrama de arquitectura del curso plantea un sistema final en **microservicios**
(auth-service, catalog-service, sales-service, ai-service, cada uno con su propia base
de datos, detrás de un API Gateway, con CI/CD a Vercel/Render). Esa es la meta de escalado.

**La estructura actual es un monolito modular**: un solo backend Express con capas
`routes/controllers/services/repositories`, organizado **por dominio** (auth,
categorías, proveedores, productos, compras, inventario, clientes, ventas). Se eligió así
porque:

- Es la base que pide la tarea ahora mismo (MVC + repositorios + servicios).
- Al estar separado por dominio desde el inicio, cada carpeta de dominio puede
  "graduarse" más adelante a su propio microservicio sin reescribir la lógica interna:
  solo se mueve la carpeta y se le pone su propio `server.js` y su propia base de datos.
- El frontend ya habla con el backend por HTTP (fetch a rutas simples), así que el día
  que el backend se parta en servicios detrás de un Gateway, el frontend casi no cambia.

## Estado del proyecto

Actualizado al 27 de noviembre de 2026.

| Módulo | Backend | Frontend | Responsables (backend · frontend) |
|---|---|---|---|
| Login y usuarios | Registro y login con JWT, permisos con `verificarRol`. Faltan la gestión de usuarios y el bloqueo | Login con tema oscuro y menú por rol; usuarios por hacer | Rony · Oscar |
| Categorías y proveedores | **Listo** | Por hacer | Jerónimo · Gabriel |
| Productos | **Listo** | Páginas base | Jerónimo · Gabriel |
| Compras, ajustes y kardex | **Listo** | Por hacer | Jerónimo · Gabriel |
| Alerta de stock mínimo | **Listo** (correo opcional) | Por hacer | Jerónimo · Gabriel |
| Clientes | CRUD básico, con permisos por rol | Listado, formulario y ficha con datos de prueba | Jacqueline y Chinchaiguara |
| Ventas | Registro básico: sin total, detalle ni descuento de stock. Con permisos por rol | Historial y comprobante con datos de prueba | Jacqueline y Chinchaiguara |
| Pagos y reportes | Por hacer | Por hacer | Jacqueline y Chinchaiguara |
| Tienda pública | Sin rutas públicas todavía (por conversar) | Portada, catálogo y carrito con datos de prueba | Backend por definir · Oscar |

Avance por equipo: [backend](tecnifix-backend/equipo-backend/README.md) ·
[frontend](tecnifix-frontend/equipo-frontend/README.md) ·
[pedidos de frontend a backend](docs/pendientes-backend.md).

## Lo desarrollado: inventario

Responsable: Jerónimo (27 de noviembre de 2026).

### Módulos del backend

| Módulo | Rutas | Qué hace |
|---|---|---|
| Categorías | `GET` `POST /categorias` · `PUT /categorias/:id` | Búsqueda, alta y edición; el nombre no se repite |
| Proveedores | `GET` `POST /proveedores` · `PUT /proveedores/:id` | Búsqueda por razón social o RUC, alta y edición; el RUC no se repite |
| Productos | `GET` `POST /productos` · `GET` `PUT` `DELETE /productos/:id` | SKU único, filtros por texto, categoría y stock bajo; eliminar solo desactiva |
| Compras | `GET` `POST /compras` · `GET /compras/:id` | El servidor calcula el total, sube el stock y anota el kardex en una transacción |
| Ajustes de stock | `POST /inventario/ajustes` | Solo admin, con motivo; el stock no queda negativo |
| Kardex | `GET /productos/:id/movimientos` | Entradas, salidas y ajustes con usuario, referencia y fecha |
| Alerta de stock mínimo | `correo.service.js` | Correo opcional al administrador cuando un producto llega a su mínimo |
| Apoyo a ventas | `inventario.service.js` | `registrarSalida`, `registrarDevolucion` y `avisarStockBajo`; ventas todavía no las usa |

Todo valida los datos con `zod`, usa SQL parametrizado y responde los listados como
`{ data, total, pagina, limite }`. Los permisos por rol se aplican con `verificarRol`,
el middleware común del backend.

### Base de datos

Los módulos usan las tablas `categorias`, `proveedores`, `productos`, `compras`,
`compra_detalle` y `movimientos_inventario`. Se crean con las migraciones del backend:
`npm run db:setup` (ver [Cómo levantar el proyecto](#cómo-levantar-el-proyecto)).

### Pruebas y documentación

- Pruebas unitarias de los módulos de inventario y del correo, y de integración para
  categorías, proveedores, productos, compras e inventario.
- Peticiones de ejemplo en la colección de Bruno (`tecnifix-backend/bruno/`).
- Contrato de cada ruta en [`docs/API.md`](docs/API.md) y detalle del módulo en
  [`tecnifix-backend/README.md`](tecnifix-backend/README.md#módulo-de-inventario).

### Commits subidos a `main`

19 commits de J Ortiz (`jort-tec-snt`), subidos el 26 y 27 de noviembre de 2026.
[Ver todos en GitHub](https://github.com/Rony10-az/Sistema_de_Gestion_de_Ventas/commits/main?author=jort-tec-snt).

| Fecha | Commit | Cambio |
|---|---|---|
| 26/11 22:23 | [`fcad159`](https://github.com/Rony10-az/Sistema_de_Gestion_de_Ventas/commit/fcad15973d1852f53530123278afd125d7a3f073) | feat(backend): agrego el módulo de categorías |
| 26/11 22:25 | [`af4955e`](https://github.com/Rony10-az/Sistema_de_Gestion_de_Ventas/commit/af4955e8c12e1629daf8823b6158e8bbc2b12b40) | feat(backend): agrego el módulo de proveedores |
| 26/11 22:36 | [`9495375`](https://github.com/Rony10-az/Sistema_de_Gestion_de_Ventas/commit/9495375fb8c55cf18e1624dff10a4b3d61bd3610) | feat(backend): completo el módulo de productos |
| 26/11 22:37 | [`a5aab4b`](https://github.com/Rony10-az/Sistema_de_Gestion_de_Ventas/commit/a5aab4b7529f7386acbae98d5e8e22076e0a11d1) | feat(backend): agrego la suma de stock y el registro en el kardex |
| 26/11 22:37 | [`015cf4a`](https://github.com/Rony10-az/Sistema_de_Gestion_de_Ventas/commit/015cf4a299e1ea70d5222f3e02c61e609d0c4c14) | feat(backend): agrego el módulo de compras |
| 26/11 22:49 | [`10b7523`](https://github.com/Rony10-az/Sistema_de_Gestion_de_Ventas/commit/10b752375bc536af1883819079115e817dcdfc07) | docs(backend): actualizo los últimos cambios de inventario |
| 26/11 22:49 | [`623bc7b`](https://github.com/Rony10-az/Sistema_de_Gestion_de_Ventas/commit/623bc7b40b617e62f4f9afedc3f8cb5145d04ddc) | feat(backend): registro las rutas de inventario |
| 26/11 22:51 | [`d41c293`](https://github.com/Rony10-az/Sistema_de_Gestion_de_Ventas/commit/d41c2931145d77c78f096c93e0147b880699f62f) | refactor(backend): comparto la transacción de inventario con compras |
| 26/11 22:51 | [`3b4611d`](https://github.com/Rony10-az/Sistema_de_Gestion_de_Ventas/commit/3b4611d73f087b43a351a28ac5d73e5b14f3e182) | feat(backend): agrego los ajustes de stock y el kardex |
| 26/11 22:51 | [`7a451a8`](https://github.com/Rony10-az/Sistema_de_Gestion_de_Ventas/commit/7a451a8171627e7ca512c1f88fd3ff5183f2b7e1) | docs(backend): documento inventario y su uso desde ventas |
| 26/11 22:55 | [`c3201a1`](https://github.com/Rony10-az/Sistema_de_Gestion_de_Ventas/commit/c3201a1f6f8efb8eb67a9fdfbc14bb1cb3a75899) | feat(backend): agrego la alerta de stock mínimo por correo |
| 26/11 23:00 | [`2207315`](https://github.com/Rony10-az/Sistema_de_Gestion_de_Ventas/commit/2207315d45b6a95c165dc186a2ae1911fa7d7d57) | build(backend): agrego nodemailer para el correo de stock mínimo |
| 26/11 23:17 | [`6d4380e`](https://github.com/Rony10-az/Sistema_de_Gestion_de_Ventas/commit/6d4380e0883f08a97dc4bccaf1c4fe9fb4bab684) | docs: agrego el contrato de la API de inventario |
| 27/11 09:19 | [`800d921`](https://github.com/Rony10-az/Sistema_de_Gestion_de_Ventas/commit/800d92130cc025b8066aba2ca7315f711afb67c6) | test(backend): agrego las pruebas de integración de categorías y proveedores |
| 27/11 09:19 | [`bdd60f9`](https://github.com/Rony10-az/Sistema_de_Gestion_de_Ventas/commit/bdd60f93df134fcf6859bff7dd090fec44ae4dc9) | docs(backend): detallo el módulo de inventario |
| 27/11 09:19 | [`4708fc9`](https://github.com/Rony10-az/Sistema_de_Gestion_de_Ventas/commit/4708fc9b1eda506d97435cbb65f29a9b4b494629) | docs: actualizo el estado del proyecto en el README principal |
| 27/11 09:22 | [`8c3c606`](https://github.com/Rony10-az/Sistema_de_Gestion_de_Ventas/commit/8c3c606af6e65fef64d8b5e5ce5d316b3125ebb8) | feat(backend): agrego el script de la base de datos local (retirado después) |
| 27/11 09:22 | [`94deb34`](https://github.com/Rony10-az/Sistema_de_Gestion_de_Ventas/commit/94deb347bc8feed6bd640874f42a2adc53e4fb5e) | docs: explico cómo cargar la base local con el script (reemplazado por las migraciones) |
| 27/11 09:40 | [`0033005`](https://github.com/Rony10-az/Sistema_de_Gestion_de_Ventas/commit/0033005acfc52fc10197249dccb49cddfdfd3b97) | docs: actualizo los permisos por rol y la carga de la base local |

### Pendiente

- Probar el envío de correo con un servidor SMTP real (las pruebas lo simulan).
- Pasar las variables `SMTP_*` al backend en `docker-compose.yml`.

## Estructura del repositorio

```
Sistema_de_Gestion_de_Ventas/
├── docs/                 → contrato de la API, modelo E-R, diagramas y notas del equipo
├── tecnifix-backend/     → API REST con Express (ver tecnifix-backend/README.md)
├── tecnifix-frontend/    → Interfaz con Next.js (ver tecnifix-frontend/README.md)
└── docker-compose.yml    → base de datos, backend y frontend
```

Cada carpeta (`tecnifix-backend/`, `tecnifix-frontend/`) es independiente: su propio `package.json`,
su propio `.env`, y se levanta por separado.

## Convención de rutas

Las rutas de la API **no llevan el prefijo `/api/`**. Son rutas simples y directas por
dominio, con parámetros dinámicos donde corresponde:

| Dominio | Rutas |
|---|---|
| Auth | `POST /auth/register` · `POST /auth/login` |
| Categorías | `GET` `POST /categorias` · `PUT /categorias/:id` |
| Proveedores | `GET` `POST /proveedores` · `PUT /proveedores/:id` |
| Productos | `GET` `POST /productos` · `GET` `PUT` `DELETE /productos/:id` |
| Compras | `GET` `POST /compras` · `GET /compras/:id` |
| Inventario | `POST /inventario/ajustes` · `GET /productos/:id/movimientos` |
| Clientes | `GET` `POST /clientes` · `GET` `PUT` `DELETE /clientes/:id` |
| Ventas | `GET` `POST /ventas` · `GET /ventas/:id` |

El frontend consume la API vía `NEXT_PUBLIC_API_URL` (ver `tecnifix-frontend/.env.example`).

## Cómo levantar el proyecto

```bash
# Backend
cd Sistema_de_Gestion_de_Ventas/tecnifix-backend
npm install
npm run env:init     # luego escribe tu DB_PASSWORD en .env
npm run db:setup
npm run dev

# Frontend (en otra terminal)
cd Sistema_de_Gestion_de_Ventas/tecnifix-frontend
cp .env.example .env.local
npm install
npm run dev
```

`db:setup` crea las 11 tablas del modelo y los datos de prueba, con un usuario por rol
(contraseña `tecnifix123`, solo para desarrollo local): `admin@tecnifix.pe`,
`vendedor@tecnifix.pe` y `almacen@tecnifix.pe`.

**Si ya tenías una base con tablas creadas antes**, usa una nueva: cambia `DB_NAME` en
`tecnifix-backend/.env` (por ejemplo `tecnifix_local`) y ejecuta `npm run db:setup`.

**Para frontend:** cada uno usa su base local; basta con `npm run db:setup`, sin crear ni
editar migraciones. Para usar la API real, pon `NEXT_PUBLIC_USE_MOCKS=false` en
`tecnifix-frontend/.env.local`. Las rutas de inventario piden iniciar sesión y sus
listados responden `{ data, total, pagina, limite }` (ver [`docs/API.md`](docs/API.md)).

## Levantar con Docker

Requiere Docker Desktop abierto. Desde la carpeta principal (PowerShell):

```powershell
Copy-Item .env.example .env   # luego cambia los dos valores
docker compose up --build
```

| Parte | Servicio | Dirección |
|---|---|---|
| Frontend (Next.js) | `frontend` | http://localhost:3000 |
| Backend (Express) | `backend` | http://localhost:4000 |
| Base de datos (PostgreSQL 17) | `db` | `localhost:5434` (cambiable con `POSTGRES_PORT`) |

El backend aplica las migraciones y datos de prueba al arrancar. La base de Docker es
distinta a la de tu PostgreSQL instalado y se conserva en el volumen `datos_db`.

- El frontend usa la API real. Para los datos de prueba: `NEXT_PUBLIC_USE_MOCKS=true`
  en `.env` y `docker compose up --build`.
- Detener: `docker compose down`
- Borrar también los datos: `docker compose down -v`
- Solo la base (para correr el código con `npm run dev`): `docker compose up -d db`, y en
  `tecnifix-backend/.env` usa `DB_PORT=5434` y la contraseña de `POSTGRES_PASSWORD`.

## Stack

| Capa | Tecnología |
|---|---|
| Frontend | Next.js (React) |
| Backend | Node.js + Express |
| Base de datos | PostgreSQL |
| Autenticación | JWT (contraseñas con bcrypt) |
| Validación | zod |
| Correo | nodemailer |
| Pruebas | Jest + Supertest, colección de Bruno |
| Seguridad de origen | CORS |
| Configuración | dotenv (`.env`) |
| Recarga en desarrollo | nodemon |
