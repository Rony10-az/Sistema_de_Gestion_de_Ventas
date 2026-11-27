# TecniFix · Guía para continuar el frontend

Cómo poner a funcionar el frontend, cómo está organizado, qué falta y quién lo hace.
No escribas aquí contraseñas, tokens ni datos personales: todo el que tenga acceso al repositorio puede leerlo.

**Última actualización:** 27 de noviembre de 2026 · **Demo en línea:** https://tecnifix-frontend.vercel.app (con datos de prueba)

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

> Después de `git pull`, si alguien agregó paquetes, corre `npm install` otra vez. Si `npm run build` falla con
> "Cannot find module for page", borra la carpeta `.next` y vuelve a compilar.

**Comprobar que funciona:**

| Prueba | Resultado esperado |
|---|---|
| http://localhost:3000 | Tienda pública: la bóveda se abre y muestra los productos |
| Ícono de usuario → "Acceso del personal" (o `/login`) | Login del panel |
| Entrar como Administrador | Menú con las 9 secciones |
| Entrar como Vendedor y abrir `/usuarios` | "No tienes acceso a esta sección" |
| `npm run lint` | Sin errores |
| `npm run build` | Compila sin errores (lo mismo revisa el CI en cada push a `main`) |

## 2. Cómo está organizado

La aplicación tiene **dos caras**:

| Parte | Rutas | Para quién |
|---|---|---|
| Tienda pública | `/`, `/catalogo`, `/catalogo/[slug]` | Clientes: ven productos con stock real, arman el carrito y reservan |
| Panel interno | `/login`, `/dashboard`, `/productos`, `/ventas`, … | Personal: admin, vendedor y almacenero |

```
página (app/) → componentes del módulo → services/ → lib/fetcher.js → API
                                              └→ mocks/ (si USE_MOCKS=true)
```

| Carpeta | Hace | No hace |
|---|---|---|
| `app/(tienda)/` | Portada, catálogo y ficha de producto de la tienda pública | Pedir sesión |
| `app/(panel)/<modulo>/` | Arma la pantalla, maneja estados y permisos de botones | `fetch` directo, `<main>` propio, menú |
| `components/<modulo>/` | Piezas de la pantalla: tablas, formularios, diálogos | Llamar a la API |
| `components/tienda/` | Cabecera con mega menú, carrito, tarjetas, bóveda, chat y sello | Nada del panel |
| `components/ui/` | Componentes genéricos (shadcn/ui y comunes) | Lógica de negocio. Solo los toca Oscar |
| `services/` | Llama a la API o al mock con la forma del contrato | JSX ni estados de React |
| `mocks/` | Datos de prueba con los nombres de campos de la base | Lógica de pantallas |
| `lib/` | `fetcher`, `mock`, `formato`, `roles`, `cargador-imagenes` | Nada de un módulo. Solo los toca Oscar |

Nombres: páginas `page.js`, componentes en PascalCase (`TablaProductos.jsx`), services `modulo.service.js`,
mocks `modulo.mock.js`. Textos de la interfaz en español.

## 3. Guía de estilo (inspirada en hodl.swiss)

Fondo negro, acento magenta → violeta, títulos en **Outfit** y textos en **Nunito Sans**. Los botones, tarjetas,
tablas, campos y badges de `components/ui/` **ya tienen el estilo**: si los usas, tu pantalla se ve igual que el resto.
No pongas colores sueltos (`bg-purple-500`): usa las clases de abajo o los colores del tema (`primary`, `muted`, etc.).

| Clase o componente | Para qué |
|---|---|
| `<Button>` | Píldora con degradado y brillo. `variant="outline"` para la acción secundaria |
| `<Card>` | Tarjeta de vidrio oscuro con borde de luz |
| `<EncabezadoPagina etiqueta="Inventario" titulo="Productos">` | Título de cada página con etiqueta pequeña arriba |
| `degradado-marca` | Fondo con el degradado de la marca (botones, avatares, íconos destacados) |
| `texto-marca` | Resalta una parte de un título con el degradado |
| `etiqueta` | Texto pequeño en monoespaciada y mayúsculas (`01 — VENTAS`) |
| `vidrio` | Superficie de vidrio oscuro para paneles y ventanas |
| `animate-aparecer` | El bloque aparece subiendo (para la carga de la página) |
| `<Revelar retraso={n}>` (`components/tienda/Revelar.jsx`) | Aparece al hacer scroll, escalonado de 90 ms en 90 ms |
| `shadow-brillo` | Brillo magenta debajo de un elemento destacado |

Toda animación nueva debe respetar `prefers-reduced-motion` (las clases de arriba ya lo hacen).

## 4. Cómo agregar una pantalla

1. Revisar en `docs/frontend-vistas.md` sus campos, validaciones, ruta de la API y qué rol la usa.
2. Revisar en `docs/API.md` si el backend ya documentó la ruta (el inventario ya está completo).
3. Crear o completar el mock del módulo (`src/mocks/<modulo>.mock.js`) con datos realistas de la tienda.
4. Escribir el service: si `USAR_MOCKS`, usa `simular` y `paginar`; si no, `apiFetch` (ejemplo en `../README.md`).
5. Crear los componentes del módulo en `src/components/<modulo>/`.
6. Crear la página con `EncabezadoPagina` y los tres estados (`TablaCargando`, `EstadoVacio`, `EstadoError`).
7. Validar los formularios en el navegador con `CampoFormulario` **y** mostrar los errores de `campos` que devuelve la
   API (el backend vuelve a validar).
8. `npm run lint`, `npm run build`, `git pull --rebase origin main`, commit, push y aviso en `#tecnifix-avisos`.

Está terminada cuando muestra los tres estados, valida los datos, respeta los permisos del rol, se ve bien en
el celular, compila sin errores y funciona tanto con los datos de prueba como con la API real.

Los commits siguen la forma `tipo(frontend): resumen`, con viñetas que expliquen los cambios.

## 5. Lo que el frontend espera de la API

Es el mismo formato acordado con backend (`docs/API.md`, "Reglas comunes"):

| Caso | Respuesta |
|---|---|
| Listado | `{ "data": [], "total": 0, "pagina": 1, "limite": 10 }` |
| Error | `{ "error": "mensaje" }` → `ApiError` con `status` y `message` |
| Validación | `{ "error": "Datos inválidos", "campos": { } }` → `error.campos` |
| Login | `{ "token": "...", "usuario": { "id", "nombre", "email", "rol" } }` |

El `fetcher` cierra la sesión solo si la API responde 401. El login acepta 400 y 401 como clave incorrecta
mientras el backend pasa a 401.

**Cambios del modelo (migración 002 de backend) que hay que respetar en los mocks:** `productos.precio` ahora es
`precio_venta`; los productos tienen `sku`, `categoria_id`, `precio_compra`, `stock_minimo` y `activo`; los pagos
solo aceptan `efectivo`, `tarjeta` y `yape`; las ventas tienen `fecha` (antes `creado_en`), `serie_numero`,
`tipo_comprobante`, `subtotal`, `igv` y `estado` (`pagada` o `anulada`).

## 6. Estado actual

| Parte | Estado | Quién |
|---|---|---|
| Base: Tailwind, shadcn/ui, tema estilo hodl.swiss, layout del panel, menú por rol, login, componentes comunes | **Listo** | Oscar |
| Tienda pública: portada con bóveda animada, cintas, asistente de compra, carrusel, catálogo con filtros, ficha de producto, carrito, buscador, chat y sello | **Listo con datos de prueba** | Oscar |
| Despliegue en Vercel | **Listo** (se actualiza a pedido) | Oscar |
| Clientes: lista, formulario DNI/RUC y ficha con historial | **Listo con datos de prueba** | Pareja de ventas |
| Ventas: historial y comprobante | **Listo con datos de prueba** | Pareja de ventas |
| Productos | Solo página de ejemplo | Gabriel |
| Categorías, proveedores, compras | Sin página | Gabriel |
| Caja (nueva venta), dashboard, reportes | Sin página (dashboard de ejemplo) | Pareja de ventas |
| Usuarios | Página de ejemplo | Oscar |

## 7. Lo que falta hacer, por persona

### Gabriel · inventario

El backend de inventario **ya está terminado y documentado** en `docs/API.md`: se puede conectar directo a la API real.

| # | Pantalla | Listo cuando |
|---|---|---|
| 1 | `/productos`: tabla con buscador (nombre o SKU), filtro de categoría, "stock bajo" y paginación | Filtra y pagina con mock y con API |
| 2 | `/productos/nuevo` y edición: formulario con las reglas de `docs/frontend-vistas.md` | Avisa si `precio_venta` < `precio_compra` |
| 3 | `/productos/[id]`: detalle, kardex (`/productos/:id/movimientos`) y ajuste de stock con motivo (solo admin) | El almacenero no ve precios |
| 4 | `/categorias` y `/proveedores`: alta y edición en diálogo | Muestra el 409 si el nombre o RUC se repite |
| 5 | `/compras`, `/compras/nueva`, `/compras/[id]` | El total se calcula en pantalla y el stock sube |

### Pareja de ventas (Jacqueline y Chinchaiguara) · ventas y reportes

| # | Pantalla | Listo cuando |
|---|---|---|
| 1 | `/ventas/nueva` (caja): buscar producto, carrito, cliente, boleta o factura, método de pago e IGV | Llega al comprobante; si falta stock muestra el 409 |
| 2 | Anulación desde `/ventas/[id]` (solo admin) con motivo | La venta queda `anulada` y el stock vuelve |
| 3 | `/dashboard` por rol | Admin: ventas del día y del mes, stock bajo y últimas compras. Vendedor: sus ventas. Almacenero: stock bajo y compras |
| 4 | `/reportes`: ventas por día y por mes, productos más vendidos, con filtro de fechas | Gráficos y tabla con los mismos datos |
| 5 | Cambiar los mocks de ventas al modelo nuevo (`fecha`, `serie_numero`, `estado`, pagos sin Plin) | Coincide con `docs/API.md` cuando backend lo publique |

### Oscar · base, tienda y usuarios

| # | Tarea | Listo cuando |
|---|---|---|
| 1 | `/usuarios`: lista, alta y edición con rol, activar o desactivar (solo admin) | Valida correo y rol; no se puede desactivar a sí mismo |
| 2 | Instalar la librería de gráficos para dashboard y reportes (propuesta: Recharts) | La pareja de ventas puede usarla |
| 3 | Formulario de reserva de la tienda (nombre, DNI y teléfono) | Valida en el navegador y en el servidor |
| 4 | Conectar la tienda a la API pública cuando backend la tenga (sección 9) | El catálogo muestra el stock de la base |
| 5 | Mantener esta guía, revisar los push y desplegar en Vercel | La demo siempre muestra lo último de `main` |

### Todos

- Apagar los mocks módulo por módulo cuando backend termine cada ruta.
- Probar cada pantalla con los tres roles y en el celular antes de subirla.
- Guardar capturas en `notas/` para la presentación.

## 8. Qué falta diseñar

Antes de programar, conviene acordar cómo se verán estas pantallas (un boceto en papel o Figma basta). Todas usan la
guía de estilo de la sección 3.

| Pantalla | Qué hay que decidir | Quién |
|---|---|---|
| Caja (`/ventas/nueva`) | Dos columnas: productos a la izquierda y carrito fijo a la derecha; cómo se elige cliente rápido; teclado para buscar por SKU | Pareja de ventas |
| Dashboard | Qué tarjetas ve cada rol (números grandes con `Contador`), un gráfico de ventas de la semana y la lista de stock bajo | Pareja de ventas |
| Reportes | Filtro de fechas, gráfico de barras por día o mes, ranking de productos y botón para imprimir | Pareja de ventas |
| Kardex | Línea de tiempo de entradas y salidas con el stock resultante y la referencia (compra o venta) | Gabriel |
| Formularios de producto y compra | Orden de los campos, cómo se agregan líneas a una compra y cómo se ve el total | Gabriel |
| Usuarios | Tabla con rol en badge, estado activo y bloqueo por intentos fallidos | Oscar |
| Tienda: reserva y seguimiento | Formulario de reserva y una página "Mi reserva" con su estado | Oscar |
| Tienda: contacto y ubicación | Dirección, horario y mapa (sin datos personales reales) | Oscar |

## 9. Lo que se le pidió al backend

El detalle, con el estado de cada punto, está en **`docs/pendientes-backend.md`**. Resumen:

| Tema | Estado |
|---|---|
| 11 tablas del modelo | **Hecho** (migración 002) |
| Motivo del ajuste de stock | **Hecho** (columna `motivo`) |
| Contrato y paginación de inventario | **Hecho** (`docs/API.md`) |
| Login con clave incorrecta → 401 | Pendiente |
| Contrato de auth, clientes, ventas y pagos en `docs/API.md` | Pendiente |
| Rutas de usuarios (CRUD, solo admin) | Pendiente |
| Rutas de dashboard y reportes | Pendiente |
| Rutas públicas para la tienda (catálogo sin sesión) | **Nuevo**, por conversar |
| Reservas de la tienda | **Nuevo**, por decidir |
| CORS con la URL de Vercel | Pendiente |

## 10. Quién toca qué

| Persona | Archivos en `src/` |
|---|---|
| Oscar | `app/layout.js`, `app/robots.js`, `app/not-found.js`, `app/(publico)/`, `app/(tienda)/`, `app/(panel)/layout.js`, `app/(panel)/usuarios/`, `components/ui/`, `components/layout/`, `components/tienda/`, `context/`, `hooks/`, `lib/`, mocks y services de `auth`, `usuarios` y `tienda`, `package.json`, `next.config.js` |
| Gabriel | `app/(panel)/productos/`, `categorias/`, `proveedores/`, `compras/`, `components/inventario/`, mocks y services de `productos`, `categorias`, `proveedores`, `compras`, `inventario` |
| Pareja de ventas | `app/(panel)/clientes/`, `ventas/`, `dashboard/`, `reportes/`, `components/clientes/`, `ventas/`, `dashboard/`, mocks y services de `clientes`, `ventas`, `pagos`, `reportes` |

- El equipo frontend trabaja directo en `main`: `git pull --rebase origin main` antes de cada commit y de cada push.
- Si necesitas una función de otro, la **importas**; si le falta algo, se lo pides a su dueño.
- Solo Oscar instala paquetes (`package.json` y `package-lock.json`).
- Nadie del equipo frontend toca `tecnifix-backend/`: lo que se necesita se anota en `docs/pendientes-backend.md`.
- Las notas de trabajo van en `notas/` de la raíz (no se sube).

## 11. Recomendaciones

- Primero que funcione, después el diseño fino: usar los componentes que ya existen.
- Probar cada pantalla con los tres roles antes de subirla.
- Mantener los mocks con la misma forma que el contrato: es lo que permite conectar sin rehacer pantallas.
- Avisar en `#tecnifix-avisos` cada vez que se sube algo, y en `docs/pendientes-backend.md` lo que se necesita de backend.
- Si el CI de GitHub marca error en tu push, arréglalo antes de seguir (corre `npm run lint` y `npm run build`).

## Referencias

`docs/frontend-vistas.md` (cada pantalla con sus campos), `docs/API.md` (contrato), `docs/modelo-er.png`,
`docs/pendientes-backend.md`, `docs/plan-tecnico.html` y `../README.md` (componentes comunes y ejemplos de código).
