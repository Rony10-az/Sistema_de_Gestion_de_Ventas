# TecniFix · Sistema de gestión de ventas e inventario

Proyecto del curso **Desarrollo de Aplicaciones Web Avanzado** (5to ciclo, Tecsup, 2026-2).

TecniFix: sistema de ventas e inventario para una tienda de repuestos y accesorios, con backend en **Express** (API REST en capas: rutas → controladores →
servicios → repositorios) y frontend en **Next.js**. Base de datos **PostgreSQL**.
Seguridad con **JWT** (autenticación) y **CORS** (control de origen), pensada para
seguir escalando (rate limiting, roles más finos, etc. se añaden sobre esta misma base).

## Estado del proyecto

Actualizado al 27 de noviembre de 2026. ✅ Listo · 🟡 En avance · ⬜ Pendiente

| Módulo | Backend | Frontend | Responsables (backend · frontend) |
|---|---|---|---|
| Base de datos (11 tablas y datos de prueba) | ✅ | — | Rony |
| Login y permisos por rol | 🟡 Login y `verificarRol` listos; faltan 401 y bloqueo | ✅ Login y menú por rol | Rony · Oscar |
| Usuarios | ⬜ | ⬜ | Rony · Oscar |
| Categorías y proveedores | ✅ | ⬜ | Jerónimo · Gabriel |
| Productos | ✅ | 🟡 Páginas base | Jerónimo · Gabriel |
| Compras, ajustes y kardex | ✅ | ⬜ | Jerónimo · Gabriel |
| Alerta de stock mínimo | ✅ Correo opcional | ⬜ | Jerónimo · Gabriel |
| Clientes | 🟡 CRUD básico con permisos | 🟡 Con datos de prueba | Jacqueline y Chinchaiguara |
| Ventas | 🟡 Falta total, detalle y stock | 🟡 Historial y comprobante con datos de prueba | Jacqueline y Chinchaiguara |
| Pagos y reportes | ⬜ | ⬜ | Jacqueline y Chinchaiguara |
| Tienda pública | ⬜ Por conversar | 🟡 Con datos de prueba | Por definir · Oscar |
| Pruebas automáticas en cada push (GitHub Actions) | ✅ | ✅ Lint y build | Rony |

Detalle y pendientes: [backend](tecnifix-backend/equipo-backend/README.md) ·
[frontend](tecnifix-frontend/equipo-frontend/README.md) ·
[pedidos de frontend a backend](docs/pendientes-backend.md) ·
[contrato de la API](docs/API.md).

El inventario (categorías, proveedores, productos, compras, ajustes, kardex y alerta de
stock) está explicado en
[el README del backend](tecnifix-backend/README.md#módulo-de-inventario). Responsable:
Jerónimo ([sus commits](https://github.com/Rony10-az/Sistema_de_Gestion_de_Ventas/commits/main?author=jort-tec-snt)).

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
