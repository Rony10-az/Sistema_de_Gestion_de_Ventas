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
| Login y usuarios | Registro y login con JWT, permisos con `verificarRol`. Faltan la gestión de usuarios y el bloqueo | Login y menú por rol; usuarios por hacer | Rony · Oscar |
| Categorías y proveedores | **Listo** | Por hacer | Jerónimo · Gabriel |
| Productos | **Listo** | Páginas base | Jerónimo · Gabriel |
| Compras, ajustes y kardex | **Listo** | Por hacer | Jerónimo · Gabriel |
| Alerta de stock mínimo | **Listo** (correo opcional) | Por hacer | Jerónimo · Gabriel |
| Clientes | CRUD básico, con permisos por rol | Listado, formulario y ficha con datos de prueba | Jacqueline y Chinchaiguara |
| Ventas | Registro básico: sin total, detalle ni descuento de stock. Con permisos por rol | Historial y comprobante con datos de prueba | Jacqueline y Chinchaiguara |
| Pagos y reportes | Por hacer | Por hacer | Jacqueline y Chinchaiguara |

### Inventario (backend)

- Categorías y proveedores: alta, edición y búsqueda, sin nombres ni RUC repetidos.
- Productos: alta, edición, desactivación, búsqueda, filtro por categoría y por stock bajo.
- Compras: suben el stock y quedan en el kardex, todo en una transacción.
- Ajustes de stock con motivo (solo admin) y kardex por producto.
- Funciones listas para que ventas descuente y devuelva stock.
- Correo al administrador cuando un producto llega a su stock mínimo.
- Validación en el servidor, permisos por rol, paginación y pruebas.

Detalle en [`tecnifix-backend/README.md`](tecnifix-backend/README.md#módulo-de-inventario) y
contrato de cada ruta en [`docs/API.md`](docs/API.md).

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

Cada integrante usa su **propia base de datos local**. Se crea cargando un solo script,
[`tecnifix_local.sql`](tecnifix-backend/src/database/tecnifix_local.sql): **no se
ejecutan migraciones**.

```bash
# Base de datos (una sola vez, con PostgreSQL instalado; desde la carpeta principal)
createdb -U postgres sistema_ventas
psql -U postgres -d sistema_ventas -f tecnifix-backend/src/database/tecnifix_local.sql

# Backend
cd Sistema_de_Gestion_de_Ventas/tecnifix-backend
npm install
npm run env:init     # luego escribe tu DB_PASSWORD en .env
npm run dev

# Frontend (en otra terminal)
cd Sistema_de_Gestion_de_Ventas/tecnifix-frontend
cp .env.example .env.local   # NEXT_PUBLIC_USE_MOCKS=false para usar tu API local
npm install
npm run dev
```

Con pgAdmin, Docker o una base anterior, ver
[los pasos de la base local](tecnifix-backend/README.md#base-de-datos-local-con-el-script).
El script crea las 11 tablas del modelo y los datos de prueba, con un usuario por rol
(contraseña `tecnifix123`, solo para desarrollo local): `admin@tecnifix.pe`,
`vendedor@tecnifix.pe` y `almacen@tecnifix.pe`.

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

Antes del primer arranque, carga el script en la base de Docker
([pasos](tecnifix-backend/README.md#base-de-datos-local-con-el-script)); así el backend
no cambia nada al iniciar. La base de Docker es distinta a la de tu PostgreSQL instalado
y se conserva en el volumen `datos_db`.

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
