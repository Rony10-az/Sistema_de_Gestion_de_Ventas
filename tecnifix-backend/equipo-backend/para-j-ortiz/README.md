# Para J Ortiz: cambios que afectan inventario

Fecha: 27/11/2026. Commits en `main` hasta `419b508`.

## 1. Antes de seguir trabajando

```powershell
git pull --rebase origin main
cd tecnifix-backend
npm install
npm run db:setup
npm test
```

Si creaste tablas a mano, pueden diferir de las de la migración. Lo más seguro es usar
una base nueva: cambia `DB_NAME` en tu `.env` y vuelve a ejecutar `npm run db:setup`.

## 2. Qué se cambió en tus archivos

En `src/routes/`: `productos`, `categorias`, `proveedores`, `compras` e `inventario`
(`*.routes.js`). Se quitó la función provisional `soloRoles` y ahora usan `verificarRol`.
**Los permisos y el mensaje de error 403 son los mismos.**

```js
const authMiddleware = require('../middlewares/auth.middleware');
const verificarRol = require('../middlewares/rol.middleware');

router.post('/', authMiddleware, verificarRol('admin', 'almacenero'), controlador.crear);
```

Los roles válidos son `admin`, `vendedor` y `almacenero`. Si una ruta declara otro, el
servidor no arranca.

También se editaron `docs/API.md` (sección "Permisos por rol") y la guía de backend.
Tus services, repositories y validators no se modificaron.

## 3. Qué más hay nuevo

- **Migración:** `src/database/migrations/002_modelo_tecnifix.sql` crea las 11 tablas,
  incluida `movimientos_inventario` con `motivo`. No la edites: un cambio va en `003`.
- **Usuarios de prueba** (contraseña `tecnifix123`): `admin@tecnifix.pe`,
  `vendedor@tecnifix.pe` y `almacen@tecnifix.pe`.
- **Datos de prueba:** categoría `General`, un proveedor y tres productos.
- **Bruno:** inicia sesión con el administrador.
- **GitHub Actions:** cada push a `main` prueba el backend y compila el frontend.

## 4. Cómo trabajamos

Directamente en `main`. Antes de cada push: `git pull --rebase origin main` y `npm test`.
Después, revisa la pestaña **Actions** del repositorio.

Para cambios delicados (migraciones, roles, rutas compartidas o archivos de otra persona)
se recomienda un Pull Request.

## 5. Por revisar o coordinar

- [ ] Confirma que la migración coincide con lo que esperan tus módulos.
- [ ] Las ventas todavía no usan `registrarSalida` ni `registrarDevolucion`: avisa a quien
  las programe si cambias esas funciones.
- [ ] La pantalla de productos del frontend aún espera una lista simple; la API responde
  `{ data, total, pagina, limite }`.

Si algo de esto no te cuadra, avisa antes de cambiarlo.
