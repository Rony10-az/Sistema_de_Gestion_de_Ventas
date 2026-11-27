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

**Esta primera estructura es un monolito modular**: un solo backend Express con capas
`routes/controllers/services/repositories`, organizado **por dominio** (auth,
productos, clientes, ventas). Se eligió así porque:

- Es la base que pide la tarea ahora mismo (MVC + repositorios + servicios).
- Al estar separado por dominio desde el inicio, cada carpeta de dominio puede
  "graduarse" más adelante a su propio microservicio sin reescribir la lógica interna:
  solo se mueve la carpeta y se le pone su propio `server.js` y su propia base de datos.
- El frontend ya habla con el backend por HTTP (fetch a rutas simples), así que el día
  que el backend se parta en servicios detrás de un Gateway, el frontend casi no cambia.

## Estructura del repositorio

```
Sistema_de_Gestion_de_Ventas/
├── tecnifix-backend/     → API REST con Express (ver tecnifix-backend/README.md)
└── tecnifix-frontend/    → Interfaz con Next.js (ver tecnifix-frontend/README.md)
```

Cada carpeta (`tecnifix-backend/`, `tecnifix-frontend/`) es independiente: su propio `package.json`,
su propio `.env`, y se levanta por separado.

## Convención de rutas

Las rutas de la API **no llevan el prefijo `/api/`**. Son rutas simples y directas por
dominio, con parámetros dinámicos donde corresponde:

```
/auth/login
/auth/register
/productos
/productos/:id
/clientes
/clientes/:id
/ventas
/ventas/:id
```

El frontend consume esas mismas rutas vía `NEXT_PUBLIC_API_URL` (ver `tecnifix-frontend/.env.example`).

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
cp .env.example .env
npm install
npm run dev
```

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
| Base de datos (PostgreSQL 17) | `db` | `localhost:5433` |

El backend aplica las migraciones y datos de prueba al arrancar. La base de Docker es
distinta a la de tu PostgreSQL instalado y se conserva en el volumen `datos_db`.

- Detener: `docker compose down`
- Borrar también los datos: `docker compose down -v`
- Solo la base (para correr el código con `npm run dev`): `docker compose up -d db`, y en
  `tecnifix-backend/.env` usa `DB_PORT=5433` y la contraseña de `POSTGRES_PASSWORD`.

## Stack

| Capa | Tecnología |
|---|---|
| Frontend | Next.js (React) |
| Backend | Node.js + Express |
| Base de datos | PostgreSQL |
| Autenticación | JWT |
| Seguridad de origen | CORS |
| Configuración | dotenv (`.env`) |
| Recarga en desarrollo | nodemon |
