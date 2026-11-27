# TecniFix · Guía para continuar el backend

Cómo poner a funcionar el proyecto y qué pasos seguir. No escribas aquí contraseñas,
tokens ni datos personales: todo el que tenga acceso al repositorio puede leerlo.

## Aviso para quien lleva inventario (27/11/2026)

Detalle completo en [para-j-ortiz/README.md](para-j-ortiz/README.md).

Se modificaron archivos del módulo de inventario. **Antes de seguir, ejecuta**
`git pull origin main`, `npm install` y `npm run db:setup`.

| Archivo | Qué se hizo |
|---|---|
| `src/routes/productos.routes.js`, `categorias.routes.js`, `proveedores.routes.js`, `compras.routes.js`, `inventario.routes.js` | Se quitó la función provisional `soloRoles` y ahora usan `verificarRol` (`src/middlewares/rol.middleware.js`). Los permisos y mensajes son los mismos |
| `docs/API.md` | Sección nueva "Permisos por rol" (clientes y ventas) |
| Esta guía | Notas sobre la migración y los roles |

Además:
- Las tablas del modelo ya están en `src/database/migrations/002_modelo_tecnifix.sql`. Si
  creaste tablas a mano, prueba con una base nueva (cambia `DB_NAME` en tu `.env`).
- Bruno ahora inicia sesión con `admin@tecnifix.pe` (datos de prueba).
- En rutas nuevas, usa `verificarRol('admin', ...)` después de `authMiddleware`.

Se trabaja directamente en `main`: haz `git pull --rebase origin main` antes de empezar
y antes de cada push.

## Inventario: últimos cambios

Cada integrante de backend trabaja con su base en su entorno local, y todos la crean
con las mismas migraciones: `npm run db:setup` aplica `002_modelo_tecnifix.sql`.
Estas son las tablas que usan los módulos de inventario.

| Módulo | Rutas | Estado |
|---|---|---|
| Categorías | `GET` `POST /categorias` · `PUT /categorias/:id` | Listo |
| Proveedores | `GET` `POST /proveedores` · `PUT /proveedores/:id` | Listo |
| Productos | `GET` `POST /productos` · `GET` `PUT` `DELETE /productos/:id` | Actualizado |
| Compras | `GET` `POST /compras` · `GET /compras/:id` | Listo |
| Ajustes y kardex | `POST /inventario/ajustes` · `GET /productos/:id/movimientos` | Listo |
| Descuento y devolución de stock para ventas | Funciones en `inventario.service.js` | Listo |
| Alerta de stock mínimo por correo | `correo.service.js` | Listo (correo opcional) |

**Dependencia nueva: `nodemailer`.** Después del `git pull`, ejecuta `npm install`.

| Tabla | Columnas |
|---|---|
| `categorias` | `id`, `nombre` (único) |
| `proveedores` | `id`, `ruc` (único), `razon_social`, `telefono` |
| `productos` | `id`, `sku` (único), `nombre`, `categoria_id`, `precio_compra`, `precio_venta`, `stock`, `stock_minimo`, `activo` |
| `compras` | `id`, `proveedor_id`, `usuario_id`, `total`, `fecha` |
| `compra_detalle` | `id`, `compra_id`, `producto_id`, `cantidad`, `costo_unitario` |
| `movimientos_inventario` | `id`, `producto_id`, `tipo`, `cantidad`, `stock_resultante`, `referencia`, `motivo`, `usuario_id`, `fecha` |

Qué cambia para el resto:
- En `productos`, `precio` pasa a `precio_venta`; la API ya no usa `descripcion` (la
  columna se conserva). Con solo `001_init.sql`, `/productos` falla: aplica la `002`.
- Productos exige sesión y los listados devuelven `{ data, total, pagina, limite }`.
- `DELETE /productos/:id` desactiva el producto, no lo borra.
- Las pruebas de integración de productos y compras necesitan esas tablas.

### Cómo usa ventas el inventario

No se edita `productos.repository.js`: se llaman estas funciones dentro de la
transacción de la venta, con los productos ordenados por id.

```js
const { enTransaccion } = require('../repositories/inventario.repository');
const productosRepository = require('../repositories/productos.repository');
const inventarioService = require('./inventario.service');

await enTransaccion(async (client) => {
  // Bloquea los productos y devuelve precio_venta, stock y activo.
  const productos = await productosRepository.bloquearPorIds(client, ids);
  // ...insertar la venta y su detalle con el mismo client...
  for (const { producto_id, cantidad } of itemsOrdenados) {
    // Sin stock lanza un error 409 y se deshace toda la transacción.
    await inventarioService.registrarSalida(client, {
      producto_id, cantidad, referencia: `venta:${serieNumero}`, usuario_id,
    });
  }
});
```

Después de que la venta se guarde (fuera de la transacción), se pide la alerta de
stock mínimo, sin `await`:

```js
inventarioService.avisarStockBajo(items); // [{ producto_id, cantidad }]
```

El correo se activa con `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD` y
`CORREO_ADMIN` en tu `.env` (ver `.env.example`). Sin ellos la API funciona igual.

Al anular una venta se usa `registrarDevolucion`, con los mismos datos. En el kardex la
cantidad lleva signo: positiva si el stock sube y negativa si baja.

## 1. Ponerlo a funcionar

Requisitos: Node 22, PostgreSQL 17 (o Docker Desktop) y Git. Desde `tecnifix-backend/`:

```powershell
npm install
npm run env:init      # crea .env; luego escribe tu DB_PASSWORD
npm run db:setup      # crea la base, migra y carga datos de prueba
npm run dev           # http://localhost:4000
```

Cada computadora usa su propia base local. El `.env` no se sube. Si ya tenías tablas
creadas antes, cambia `DB_NAME` en tu `.env` y vuelve a ejecutar `npm run db:setup`.

**Comprobar que funciona:**

| Comando o dirección | Resultado esperado |
|---|---|
| `npm run db:check` | `Conexión correcta` |
| `GET /productos` con sesión (Bruno) | Lista paginada de productos de prueba |
| `npm test` | Pruebas en verde |
| Colección de `../bruno/` | Cada petición con su estado esperado |

Con Docker se levantan base, backend y frontend; ver el README de la carpeta principal
(la base queda en el puerto 5434).

## 2. Cómo está organizado

```
routes → middlewares → controllers → services → repositories → PostgreSQL
```

| Capa | Hace | No hace |
|---|---|---|
| `routes/` | URL, verbo y middlewares | Reglas de negocio |
| `controllers/` | Lee la petición y responde | SQL |
| `services/` | Reglas de negocio | Usar `req` o `res` |
| `repositories/` | SQL parametrizado (`$1`, `$2`) | Validar reglas |
| `validators/` | Esquemas de datos (`zod`) | Consultar la base |

Nombres: `modulo.capa.js` (ej. `ventas.service.js`).

## 3. Cómo agregar una funcionalidad

1. Anotar la ruta en `docs/API.md`: qué recibe, qué responde y qué roles la usan.
2. Actualizar `main`: `git pull --rebase origin main`.
3. Escribir en este orden: `repository` → `service` → `validator` → `controller` → `routes`.
4. Registrar el router nuevo en `src/routes/index.js`.
5. Añadir pruebas en `tests/` y las peticiones en `bruno/`.
6. `npm test`, commit, `git pull --rebase origin main` y push a `main`.

Está terminada cuando valida los datos, comprueba el rol, responde con el formato
acordado, tiene pruebas y está documentada.

Un cambio en la base es una migración nueva (`003_...sql` en adelante); no se edita una ya subida.
Los commits siguen la forma `tipo(backend): resumen`, con viñetas que expliquen los cambios.

## 4. Formato de respuestas

| Caso | Respuesta |
|---|---|
| Listado | `{ "data": [], "total": 0, "pagina": 1, "limite": 10 }` |
| Error | `{ "error": "mensaje" }` |
| Validación | `{ "error": "Datos inválidos", "campos": { "documento": "..." } }` |
| Login | `{ "token": "...", "usuario": { } }` |

Códigos: 200, 201, 400, 401 (sin sesión), 403 (rol sin permiso), 404, 409 (stock
insuficiente o duplicado), 423 (cuenta bloqueada).

Roles: `admin`, `vendedor`, `almacenero`. Rutas sin prefijo `/api/`.

Este es el formato **acordado**. Los módulos de inventario, clientes y ventas ya
comprueban roles; clientes y ventas todavía devuelven listas simples.

## 5. Estado actual

**Listo:** conexión local, scripts de base de datos, Docker, pruebas, colección de Bruno,
login básico, CRUD de clientes y el inventario completo (categorías, proveedores,
productos, compras, ajustes, kardex y alerta de stock; ver `../README.md`).

**Incompleto:** crear una venta guarda total 0, sin detalle ni descuento de stock. La base
tiene las 11 tablas del modelo (`002_modelo_tecnifix.sql`).

Usuarios de prueba (contraseña `tecnifix123`): `admin@tecnifix.pe`,
`vendedor@tecnifix.pe` y `almacen@tecnifix.pe`.

## 6. Pasos a seguir

En este orden, porque cada uno se apoya en el anterior:

| Paso | Qué hacer | Listo cuando |
|---|---|---|
| 1 | Escribir el contrato en `docs/API.md`. Hecho: inventario y permisos. Falta: auth, clientes, ventas y pagos | Backend y frontend lo aprueban |
| 2 | ~~Migración `002` según `docs/modelo-er.png`~~ (hecha) | `npm run db:setup` crea las 11 tablas |
| 3 | ~~Un usuario de prueba por rol y adaptar productos (`precio` → `precio_venta`)~~ (hecho) | Pruebas y Bruno en verde |
| 4 | ~~`verificarRol`~~ (hecho). Falta: usuarios solo para admin y quitar `/auth/register` | Sin permiso responde 403 |
| 5 | Errores 404/409, validación con `zod` y paginación. Hecho en inventario | Todas las rutas usan el formato |
| 6 | ~~Categorías, proveedores y productos completos~~ (hecho) | Se registran desde la API |
| 7 | ~~Compras, ajustes y kardex, en transacción~~ (hecho) | Una compra sube el stock |
| 8 | Clientes con DNI o RUC e historial | Se puede buscar por documento |
| 9 | Ventas: stock, IGV, detalle, pago y kardex en **una sola transacción** | Sin stock responde 409 y no guarda nada |
| 10 | Anulación y reportes | El stock vuelve y los reportes la ignoran |
| 11 | Bloqueo tras 5 intentos y límite de peticiones | Probado en `tests/` |

## 7. Acuerdos y pedidos de frontend

Estado al 27/11/2026 de [`docs/pendientes-backend.md`](../../docs/pendientes-backend.md).

| Tema | Estado |
|---|---|
| 11 tablas, paginación y contrato de inventario | Hecho |
| Motivo del ajuste de stock y referencia del kardex | Hecho: columnas `motivo` y `referencia` |
| Permisos por rol | Hecho |
| Orden de la caja | Acordado: `/pagos/simular` solo aprueba o rechaza y `POST /ventas` guarda venta y pago. Falta programarlo y documentarlo |
| Contrato de auth, clientes, ventas y pagos | Pendiente |
| Login con clave incorrecta → 401 | Pendiente (hoy 400) |
| Rutas de usuarios, dashboard y reportes | Pendiente |
| Errores inesperados → 500 | Pendiente |
| CORS con la URL de Vercel | Pendiente: variable `CORS_ORIGIN` al desplegar |
| Catálogo público para la tienda y columnas nuevas | Por conversar |
| Reservas de la tienda | Por decidir |

## 8. Recomendaciones para un mejor funcionamiento

- Completar pronto un flujo corto de punta a punta: login → producto → venta → stock.
- Ejecutar las pruebas con GitHub Actions en cada push a `main`.
- No subir a `main` con pruebas fallando: ejecutar `npm test` antes de cada push.
- Integrar seguido con frontend, apagando los datos de prueba módulo por módulo.
- Confirmar con el docente el despliegue: la rúbrica pide la nube y hoy la base es local.
- Dejar los extras (como el correo de stock mínimo) para el final, salvo que el curso los exija.

## Referencias

`docs/modelo-er.png`, `docs/frontend-vistas.md` y `docs/plan-tecnico.html` (el plan aún
menciona Supabase y Render). Detalle de pruebas en `../tests/README.md`.
