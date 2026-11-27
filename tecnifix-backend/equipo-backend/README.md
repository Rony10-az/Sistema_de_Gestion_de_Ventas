# TecniFix · Guía para continuar el backend

Cómo poner a funcionar el proyecto y qué pasos seguir. No escribas aquí contraseñas,
tokens ni datos personales: todo el que tenga acceso al repositorio puede leerlo.

## Inventario: últimos cambios

Cada integrante de backend trabaja con su base en su entorno local: no se comparten
migraciones. Para usar los módulos de inventario, tu base necesita estas tablas.

| Módulo | Rutas | Estado |
|---|---|---|
| Categorías | `GET` `POST /categorias` · `PUT /categorias/:id` | Listo |
| Proveedores | `GET` `POST /proveedores` · `PUT /proveedores/:id` | Listo |
| Productos | `GET` `POST /productos` · `GET` `PUT` `DELETE /productos/:id` | Actualizado |
| Compras | `GET` `POST /compras` · `GET /compras/:id` | Listo |
| Ajustes y kardex | `POST /inventario/ajustes` · `GET /productos/:id/movimientos` | Listo |
| Descuento y devolución de stock para ventas | Funciones en `inventario.service.js` | Listo |
| Alerta de stock mínimo por correo | — | Pendiente |

| Tabla | Columnas |
|---|---|
| `categorias` | `id`, `nombre` (único) |
| `proveedores` | `id`, `ruc` (único), `razon_social`, `telefono` |
| `productos` | `id`, `sku` (único), `nombre`, `categoria_id`, `precio_compra`, `precio_venta`, `stock`, `stock_minimo`, `activo` |
| `compras` | `id`, `proveedor_id`, `usuario_id`, `total`, `fecha` |
| `compra_detalle` | `id`, `compra_id`, `producto_id`, `cantidad`, `costo_unitario` |
| `movimientos_inventario` | `id`, `producto_id`, `tipo`, `cantidad`, `stock_resultante`, `referencia`, `motivo`, `usuario_id`, `fecha` |

Qué cambia para el resto:
- En `productos`, `precio` pasa a `precio_venta` y desaparece `descripcion`. Con las
  tablas de `001_init.sql`, `/productos` falla.
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

Cada computadora usa su propia base local. El `.env` no se sube.

**Comprobar que funciona:**

| Comando o dirección | Resultado esperado |
|---|---|
| `npm run db:check` | `Conexión correcta` |
| http://localhost:4000/productos | Lista de productos de prueba |
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
2. Crear una rama desde `main` actualizado: `back/nombre-corto`.
3. Escribir en este orden: `repository` → `service` → `validator` → `controller` → `routes`.
4. Registrar el router nuevo en `src/routes/index.js`.
5. Añadir pruebas en `tests/` y las peticiones en `bruno/`.
6. `npm test`, `git pull --rebase origin main` y Pull Request.

Está terminada cuando valida los datos, comprueba el rol, responde con el formato
acordado, tiene pruebas y está documentada.

Un cambio en la base es una migración nueva (`002_...sql`); no se edita una ya subida.
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

Este es el formato **acordado**; el código actual todavía devuelve listas simples y no
comprueba roles.

## 5. Estado actual

**Listo:** conexión local, scripts de base de datos, Docker, pruebas, colección de Bruno,
login básico y CRUD de productos y clientes.

**Incompleto:** crear una venta guarda total 0, sin detalle ni descuento de stock. La base
tiene 5 de las 11 tablas del modelo.

## 6. Pasos a seguir

En este orden, porque cada uno se apoya en el anterior:

| Paso | Qué hacer | Listo cuando |
|---|---|---|
| 1 | Escribir el contrato en `docs/API.md` | Backend y frontend lo aprueban |
| 2 | Migración `002` según `docs/modelo-er.png`, con restricciones para stock y precios | `npm run db:setup` crea las 11 tablas |
| 3 | Un usuario de prueba por rol y adaptar productos (`precio` → `precio_venta`) | Pruebas y Bruno en verde |
| 4 | `verificarRol`, usuarios solo para admin y quitar `/auth/register` | Sin permiso responde 403 |
| 5 | Errores 404/409, validación con `zod` y paginación | Todas las rutas usan el formato |
| 6 | Categorías, proveedores y productos completos | Se registran desde la API |
| 7 | Compras, ajustes y kardex, en transacción | Una compra sube el stock |
| 8 | Clientes con DNI o RUC e historial | Se puede buscar por documento |
| 9 | Ventas: stock, IGV, detalle, pago y kardex en **una sola transacción** | Sin stock responde 409 y no guarda nada |
| 10 | Anulación y reportes | El stock vuelve y los reportes la ignoran |
| 11 | Bloqueo tras 5 intentos y límite de peticiones | Probado en `tests/` |

## 7. Puntos por confirmar con frontend

Salen de `docs/frontend-vistas.md`. Son **propuestas**, todavía sin acordar.

| Tema | Propuesta |
|---|---|
| Orden de `/pagos/simular` y `/ventas` | `/pagos/simular` solo aprueba o rechaza. `POST /ventas` recibe `metodo_pago` y guarda venta y pago juntos |
| Motivo del ajuste de stock | Columna `motivo` en `movimientos_inventario` (no está en el modelo) |
| Referencia del kardex | Guardar tipo y número del documento |
| Login con clave incorrecta | Responder 401 (hoy 400) |

## 8. Recomendaciones para un mejor funcionamiento

- Completar pronto un flujo corto de punta a punta: login → producto → venta → stock.
- Ejecutar las pruebas con GitHub Actions en cada Pull Request.
- Proteger `main` con Pull Request obligatorio.
- Integrar seguido con frontend, apagando los datos de prueba módulo por módulo.
- Confirmar con el docente el despliegue: la rúbrica pide la nube y hoy la base es local.
- Dejar los extras (como el correo de stock mínimo) para el final, salvo que el curso los exija.

## Referencias

`docs/modelo-er.png`, `docs/frontend-vistas.md` y `docs/plan-tecnico.html` (el plan aún
menciona Supabase y Render). Detalle de pruebas en `../tests/README.md`.
