# TecniFix · Guía para continuar el frontend

Cómo poner a funcionar el frontend, cómo está organizado y qué pantallas faltan, en orden.
No escribas aquí contraseñas, tokens ni datos personales: todo el que tenga acceso al repositorio puede leerlo.

## 1. Ponerlo a funcionar

Requisitos: Node 22 y Git. Desde `tecnifix-frontend/`:

```powershell
npm install
Copy-Item .env.example .env.local
npm run dev           # http://localhost:3000
```

Con `NEXT_PUBLIC_USE_MOCKS=true` (valor por defecto) funciona **sin el backend**, con los datos de `src/mocks/`.
Usuarios de prueba, contraseña `tecnifix123`:

| Rol | Correo |
|---|---|
| Administrador | `admin@tecnifix.pe` |
| Vendedor | `vendedor@tecnifix.pe` |
| Almacenero | `almacen@tecnifix.pe` |

Para usar la API real: levanta el backend (`../tecnifix-backend/equipo-backend/README.md`), pon
`NEXT_PUBLIC_USE_MOCKS=false` en `.env.local` y reinicia `npm run dev`. Con Docker se levanta todo junto desde la
carpeta principal (`docker compose up --build`; ver el README principal).

**Comprobar que funciona:**

| Prueba | Resultado esperado |
|---|---|
| http://localhost:3000 | Lleva al login |
| Entrar como Administrador | Menú con las 9 secciones |
| Entrar como Vendedor y abrir `/usuarios` | "No tienes acceso a esta sección" |
| `npm run lint` | Sin errores |
| `npm run build` | Compila sin errores |

## 2. Cómo está organizado

```
página (app/) → componentes del módulo → services/ → lib/fetcher.js → API
                                              └→ mocks/ (si USE_MOCKS=true)
```

| Carpeta | Hace | No hace |
|---|---|---|
| `app/(panel)/<modulo>/` | Arma la pantalla, maneja estados y permisos de botones | `fetch` directo, `<main>` propio, menú |
| `components/<modulo>/` | Piezas de la pantalla: tablas, formularios, diálogos | Llamar a la API |
| `components/ui/` | Componentes genéricos (shadcn/ui y comunes) | Lógica de negocio. Solo los toca Oscar |
| `services/` | Llama a la API o al mock con la forma del contrato | JSX ni estados de React |
| `mocks/` | Datos de prueba con los nombres de campos de la base | Lógica de pantallas |
| `lib/` | `fetcher`, `mock`, `formato`, `roles` | Nada de un módulo. Solo los toca Oscar |

Nombres: páginas `page.js`, componentes en PascalCase (`TablaProductos.jsx`), services `modulo.service.js`,
mocks `modulo.mock.js`. Textos de la interfaz en español.

## 3. Cómo agregar una pantalla

1. Revisar en `docs/frontend-vistas.md` sus campos, validaciones, ruta de la API y qué rol la usa.
2. Crear o completar el mock del módulo (`src/mocks/<modulo>.mock.js`) con datos realistas de la tienda.
3. Escribir el service: si `USAR_MOCKS`, usa `simular` y `paginar`; si no, `apiFetch` (ejemplo en `../README.md`).
4. Crear los componentes del módulo en `src/components/<modulo>/`.
5. Crear la página con `EncabezadoPagina` y los tres estados (`TablaCargando`, `EstadoVacio`, `EstadoError`).
6. Validar los formularios con `CampoFormulario` y mostrar los errores de `campos` que devuelve la API.
7. `npm run lint`, `npm run build`, `git pull --rebase origin main`, commit, push y aviso en `#tecnifix-avisos`.

Está terminada cuando muestra los tres estados, valida los datos, respeta los permisos del rol, se ve bien en
el celular, compila sin errores y funciona tanto con los datos de prueba como con la API real.

Los commits siguen la forma `tipo(frontend): resumen`, con viñetas que expliquen los cambios.

## 4. Lo que el frontend espera de la API

Es el mismo formato acordado con backend (ver `../../tecnifix-backend/equipo-backend/README.md`, sección 4):

| Caso | Respuesta |
|---|---|
| Listado | `{ "data": [], "total": 0, "pagina": 1, "limite": 10 }` |
| Error | `{ "error": "mensaje" }` → `ApiError` con `status` y `message` |
| Validación | `{ "error": "Datos inválidos", "campos": { } }` → `error.campos` |
| Login | `{ "token": "...", "usuario": { "id", "nombre", "email", "rol" } }` |

El `fetcher` cierra la sesión solo si la API responde 401. El login acepta 400 y 401 como clave incorrecta
mientras el backend pasa a 401.

## 5. Estado actual

**Listo:** Tailwind y shadcn/ui, layout del panel con menú por rol y protección de páginas, login con datos de
prueba, componentes comunes, formato de soles y fechas, patrón de mocks y `Dockerfile` (lo agregó Rony).

**Incompleto:** las pantallas de cada módulo. `productos`, `clientes`, `ventas` y `dashboard` tienen solo una
página de ejemplo que se rehace siguiendo esta guía; `categorias`, `proveedores`, `compras` y `reportes` no tienen página.

## 6. Pasos a seguir

En este orden, para tener pronto un flujo completo para la demostración (login → producto → venta → stock):

| Paso | Quién | Qué hacer | Listo cuando |
|---|---|---|---|
| 1 | Gabriel · pareja de ventas | Mocks de su módulo | Datos realistas con los campos de `docs/modelo-er.png` |
| 2 | Gabriel | Listado de productos con buscador, categoría, stock bajo y paginación | Filtra y pagina con el mock |
| 3 | Pareja de ventas | Clientes: lista, formulario con DNI o RUC y ficha | Valida documento y muestra historial |
| 4 | Gabriel | Nuevo producto y detalle con kardex y ajuste de stock | El almacenero no ve precios |
| 5 | Pareja de ventas | Caja: carrito, cliente, boleta o factura, IGV y pago simulado | Llega al comprobante |
| 6 | Pareja de ventas | Comprobante, historial y anulación (admin) | El vendedor solo ve las suyas |
| 7 | Gabriel | Categorías y proveedores | Alta y edición en diálogo |
| 8 | Gabriel | Compras: lista, nueva y detalle | El total se calcula en pantalla |
| 9 | Oscar | Usuarios (solo admin) | Crea y edita con rol |
| 10 | Pareja de ventas · Oscar | Dashboard por rol y reportes; Oscar instala la librería de gráficos | Cada rol ve su resumen |
| 11 | Todos | Apagar los mocks módulo por módulo cuando backend termine cada ruta | Funciona con la API real |
| 12 | Oscar | Despliegue en Vercel | URL pública funcionando |

## 7. Quién toca qué

| Persona | Archivos en `src/` |
|---|---|
| Oscar | `app/layout.js`, `app/page.js`, `app/robots.js`, `app/not-found.js`, `app/(publico)/`, `app/(panel)/layout.js`, `app/(panel)/usuarios/`, `components/ui/`, `components/layout/`, `context/`, `hooks/`, `lib/`, mocks y services de `auth` y `usuarios`, `package.json` |
| Gabriel | `app/(panel)/productos/`, `categorias/`, `proveedores/`, `compras/`, `components/inventario/`, mocks y services de `productos`, `categorias`, `proveedores`, `compras`, `inventario` |
| Pareja de ventas | `app/(panel)/clientes/`, `ventas/`, `dashboard/`, `reportes/`, `components/clientes/`, `ventas/`, `dashboard/`, mocks y services de `clientes`, `ventas`, `pagos`, `reportes` |

- El equipo frontend trabaja directo en `main`: `git pull --rebase origin main` antes de cada commit y de cada push.
- Si necesitas una función de otro, la **importas**; si le falta algo, se lo pides a su dueño.
- Solo Oscar instala paquetes (`package.json` y `package-lock.json`).
- Nadie del equipo frontend toca `tecnifix-backend/`.
- Las notas de trabajo van en `notas/` de la raíz (no se sube).

## 8. Puntos por confirmar con backend

El detalle está en `docs/pendientes-backend.md`. Backend ya respondió algunos en su guía (sección 7):

| Tema | Estado |
|---|---|
| Caja | Propuesta de backend: `/pagos/simular` solo aprueba o rechaza y `POST /ventas` recibe `metodo_pago` y guarda venta y pago juntos. El frontend puede trabajar así |
| Motivo del ajuste de stock | Backend propone la columna `motivo` en `movimientos_inventario` |
| Login con clave incorrecta | Pasará a 401 (hoy 400) |
| Listados paginados y 11 tablas | En los pasos 2, 5 y 6 de la guía de backend |

## 9. Recomendaciones

- Primero que funcione, después el diseño fino: usar los componentes que ya existen.
- Probar cada pantalla con los tres roles antes de subirla.
- Mantener los mocks con la misma forma que el contrato: es lo que permite conectar sin rehacer pantallas.
- Avisar en `#tecnifix-avisos` cada vez que se sube algo, y en `docs/pendientes-backend.md` lo que se necesita de backend.
- Guardar en `notas/` las capturas para la presentación a medida que se terminan las pantallas.

## Referencias

`docs/frontend-vistas.md` (cada pantalla con sus campos), `docs/modelo-er.png`, `docs/pendientes-backend.md`,
`docs/plan-tecnico.html` y `../README.md` (componentes comunes y ejemplos de código).
