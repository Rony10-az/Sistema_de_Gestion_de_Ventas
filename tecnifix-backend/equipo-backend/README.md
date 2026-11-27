# TecniFix · Guía para continuar el backend

Qué está listo, qué falta y cómo trabajar. No escribas aquí contraseñas, tokens ni datos
personales: todo el que tenga acceso al repositorio puede leerlo.

Actualizado al 27 de noviembre de 2026.

## 1. Listo

- [x] Base local: `npm run db:setup` crea las 11 tablas y los datos de prueba
- [x] Un usuario de prueba por rol
- [x] Login con JWT y permisos por rol (`verificarRol`)
- [x] Categorías, proveedores y productos (`precio_compra`, `precio_venta`, stock mínimo)
- [x] Compras, ajustes de stock y kardex, en transacción
- [x] Alerta de stock mínimo por correo (opcional)
- [x] Contrato de inventario y permisos en `docs/API.md`
- [x] Pruebas, colección de Bruno, Docker y GitHub Actions

Detalle del inventario en [`../README.md`](../README.md#módulo-de-inventario).
Cambios de roles sobre inventario:
[nota para J Ortiz](para-j-ortiz/README.md) (atendida).

## 2. Pendiente

### Base, usuarios y seguridad (Rony)

- [ ] Login: 401 con clave incorrecta (hoy 400)
- [ ] Bloqueo tras 5 intentos fallidos (423) y límite de peticiones
- [ ] Rutas de usuarios (solo admin) y quitar `/auth/register`
- [ ] Errores inesperados con 500 (hoy 400)
- [ ] Contrato de auth en `docs/API.md`
- [ ] Despliegue y `CORS_ORIGIN` con la URL del frontend en Vercel

### Clientes, ventas, pagos y reportes (Jacqueline y Chinchaiguara)

- [ ] Clientes: validación, DNI o RUC, búsqueda, paginación, 404 e historial
- [ ] Ventas: IGV, detalle, pago y descuento de stock en **una sola transacción**
- [ ] Anulación de ventas (devuelve el stock)
- [ ] `/pagos/simular`: solo aprueba o rechaza; `POST /ventas` guarda venta y pago
- [ ] Dashboard y reportes
- [ ] Contrato de clientes, ventas y pagos en `docs/API.md`

### Por conversar con frontend

- [ ] Catálogo público para la tienda y columnas nuevas
- [ ] Reservas de la tienda

Los pedidos completos están en
[`docs/pendientes-backend.md`](../../docs/pendientes-backend.md).

## 3. Cómo está organizado

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

## 4. Cómo agregar una funcionalidad

1. Anotar la ruta en `docs/API.md`: qué recibe, qué responde y qué roles la usan.
2. Actualizar `main`: `git pull --rebase origin main`.
3. Escribir en este orden: `repository` → `service` → `validator` → `controller` → `routes`.
   En las rutas, usar `verificarRol(...)` después de `authMiddleware`.
4. Registrar el router nuevo en `src/routes/index.js`.
5. Añadir pruebas en `tests/` y las peticiones en `bruno/`.
6. `npm test`, commit, `git pull --rebase origin main` y push a `main`.

Está terminada cuando valida los datos, comprueba el rol, responde con el formato
acordado, tiene pruebas y está documentada.

Un cambio en la base es una migración nueva (`003_...sql` en adelante); no se edita una ya subida.
Los commits siguen la forma `tipo(backend): resumen`, con viñetas que expliquen los cambios.

## 5. Formato de respuestas

| Caso | Respuesta |
|---|---|
| Listado | `{ "data": [], "total": 0, "pagina": 1, "limite": 10 }` |
| Error | `{ "error": "mensaje" }` |
| Validación | `{ "error": "Datos inválidos", "campos": { "documento": "..." } }` |
| Login | `{ "token": "...", "usuario": { } }` |

Códigos: 200, 201, 400, 401 (sin sesión), 403 (rol sin permiso), 404, 409 (stock
insuficiente o duplicado), 423 (cuenta bloqueada).

Roles: `admin`, `vendedor`, `almacenero`. Rutas sin prefijo `/api/`.

Inventario ya cumple el formato. Clientes y ventas todavía devuelven listas simples.

## 6. Ponerlo a funcionar

Antes de trabajar y antes de cada push: `git pull --rebase origin main`. Después del
`git pull`, ejecuta `npm install` y `npm run db:setup`. Se trabaja directamente en `main`.

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

## 7. Cómo usa ventas el inventario

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

## 8. Recomendaciones

- Completar pronto un flujo corto de punta a punta: login → producto → venta → stock.
- No subir a `main` con pruebas fallando y revisar la pestaña **Actions** tras el push.
- Integrar seguido con frontend, apagando los datos de prueba módulo por módulo.
- Confirmar con el docente el despliegue: la rúbrica pide la nube y hoy la base es local.

## Referencias

`docs/modelo-er.png`, `docs/frontend-vistas.md` y `docs/plan-tecnico.html` (documento de
apoyo; aún menciona Supabase y Render). Detalle de pruebas en `../tests/README.md`.
