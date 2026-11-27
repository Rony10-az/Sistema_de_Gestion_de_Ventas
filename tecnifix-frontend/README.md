# Frontend — TecniFix (Next.js)

Interfaz web que consume la API del backend (`Sistema_de_Gestion_de_Ventas/tecnifix-backend`). Usa el
**App Router** de Next.js 14, **Tailwind CSS 3** y componentes **shadcn/ui** (en JavaScript).

## Cómo correr

```bash
cp .env.example .env.local
npm install
npm run dev     # http://localhost:3000
```

Con `NEXT_PUBLIC_USE_MOCKS=true` (valor por defecto) la app funciona **sin el backend**, con los datos de
`src/mocks/`. Usuarios de prueba (contraseña `tecnifix123`):

| Rol | Correo |
|---|---|
| Administrador | `admin@tecnifix.pe` |
| Vendedor | `vendedor@tecnifix.pe` |
| Almacenero | `almacen@tecnifix.pe` |

Cuando el backend esté corriendo, cambia a `NEXT_PUBLIC_USE_MOCKS=false` y ajusta `NEXT_PUBLIC_API_URL`.

## Estructura

La guía para el equipo (estado, tareas de cada uno, qué falta diseñar y pendientes con backend) está en
**`equipo-frontend/README.md`**.

| Carpeta | Qué va aquí |
|---|---|
| `src/app/(tienda)/` | Tienda pública: portada (`/`), catálogo (`/catalogo`) y ficha de producto (`/catalogo/[slug]`). |
| `src/components/tienda/` | Piezas de la tienda: cabecera con mega menú, carrito, tarjetas, bóveda animada, chat, sello y `Revelar` (aparece al hacer scroll). |
| `src/app/(publico)/` | Páginas sin sesión (login). El paréntesis no aparece en la URL. |
| `src/app/(panel)/` | Páginas internas. Su `layout.js` pone el menú por rol y manda al login si no hay sesión. |
| `src/components/ui/` | Componentes genéricos (shadcn/ui y los comunes de TecniFix). Sin lógica de negocio. |
| `src/components/layout/` | Menú lateral (`Sidebar.jsx`) y barra superior (`Topbar.jsx`). |
| `src/components/inventario/`, `clientes/`, `ventas/`, `dashboard/` | Componentes propios de cada módulo, en `PascalCase`. |
| `src/services/` | Llamadas a la API, un archivo por dominio. Solo ellos usan `apiFetch`. |
| `src/mocks/` | Datos de prueba de cada módulo (`modulo.mock.js`), con la forma del contrato. |
| `src/lib/` | `fetcher.js`, `mock.js`, `formato.js`, `roles.js`, `utils.js` y `cargador-imagenes.js` (fotos de Unsplash ya redimensionadas). |
| `src/context/`, `src/hooks/` | Sesión del usuario (`AuthContext`, `useAuth`) y carrito de la tienda (`CarritoContext`). |

## Base común (úsenla, no la dupliquen)

**Componentes de `src/components/ui/`**

| Componente | Para qué |
|---|---|
| `Button`, `Input`, `Label`, `Card`, `Table`, `Badge`, `Select`, `Dialog`, `Sheet`, `DropdownMenu`, `Skeleton`, `Separator` | shadcn/ui |
| `EncabezadoPagina` | Título de la página con descripción y botones a la derecha |
| `Buscador` | Búsqueda con espera; llama a `onBuscar(texto)` cuando el usuario deja de escribir |
| `Paginacion` | Para respuestas `{ data, total, pagina, limite }` |
| `TablaCargando`, `EstadoVacio`, `EstadoError` (en `estados.jsx`) | Los tres estados obligatorios de cada listado |
| `ConfirmarDialogo` | Confirmar antes de eliminar o anular |
| `CampoFormulario` | Etiqueta + campo + error debajo (incluye los errores de `campos` de la API) |
| `toast` de `sonner` | Avisos: `toast.success('Producto guardado')`, `toast.error(error.message)` |

**Utilidades de `src/lib/`**

- `formatearSoles(119)` → `S/ 119.00` · `formatearFecha`, `formatearFechaHora`, `formatearNumero`.
- `ROLES`, `MENU`, `puedeVer(ruta, rol)`: qué ve cada rol. Si agregas una página nueva al menú, avísale a Oscar.
- `apiFetch(ruta, { method, body })`: manda el token solo. Lanza `ApiError` con `status`, `message` y `campos`.

## Cómo escribir un service con datos de prueba

Cada uno crea su `src/mocks/<modulo>.mock.js` y su service elige entre el mock y la API:

```js
// src/services/productos.service.js
import { apiFetch } from '../lib/fetcher';
import { USAR_MOCKS, simular, paginar } from '../lib/mock';
import { productosMock } from '../mocks/productos.mock';

export function listarProductos({ buscar = '', categoria = '', pagina = 1, limite = 10 } = {}) {
  if (USAR_MOCKS) {
    const lista = categoria ? productosMock.filter((p) => p.categoria_id === Number(categoria)) : productosMock;
    return simular(paginar(lista, { buscar, pagina, limite, camposBusqueda: ['nombre', 'sku'] }));
  }
  const params = new URLSearchParams({ buscar, categoria, pagina, limite });
  return apiFetch(`/productos?${params}`);
}
```

Los datos del mock deben tener **los mismos nombres de campos que la base de datos** (ver
`docs/modelo-er.png`): `precio_venta`, `stock_minimo`, `serie_numero`, etc. Así, cuando el backend esté listo,
solo se cambia `NEXT_PUBLIC_USE_MOCKS` y las pantallas siguen funcionando.

## Cómo escribir una página del panel

```js
'use client';
import { EncabezadoPagina } from '../../../components/ui/encabezado-pagina';
// ...
export default function ProductosPage() {
  // estados: cargando → TablaCargando · error → EstadoError · lista vacía → EstadoVacio
  return (
    <>
      <EncabezadoPagina titulo="Productos" descripcion="Catálogo con precios y stock." />
      {/* contenido */}
    </>
  );
}
```

El layout del panel ya pone el menú, protege la página y muestra el aviso si el rol no tiene permiso.
No uses `<main>` dentro de tus páginas: usa un fragmento `<>…</>` o un `<div>`.

## Antes de subir

```bash
npm run lint
npm run build
```
