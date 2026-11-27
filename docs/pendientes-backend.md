# Pendientes para el backend

**Para:** Rony, Jerónimo y la pareja de ventas en backend · **De:** equipo frontend (Oscar, Gabriel y la pareja de ventas en frontend) · **Fecha:** 26 de noviembre de 2026

Aquí el frontend anota lo que necesita del backend para conectar sus pantallas. **No se tocó nada del backend**: son pedidos
para conversarlos. Cuando algo se resuelva, se marca como hecho. Las pantallas ya funcionan con datos de prueba con la forma
que se pide abajo: cuando el backend entregue el dato, la pantalla ya sabe dónde ponerlo.

Cómo se usa este archivo:
- Lo edita el equipo frontend (Oscar lo mantiene). El backend responde en Discord o en su `tecnifix-backend/README.md`.
- Las notas de trabajo de cada uno van en la carpeta `notas/` de la raíz, que está en el `.gitignore` y no se sube.

---

## 1. Login: responder 401 con clave incorrecta · pendiente

> **Respuesta de backend** (guía de backend, sección 7): pasará a 401.

**Hoy:** con correo o contraseña incorrectos, `auth.service.js` lanza un error sin `status` y el manejador central responde **400**.

**Qué necesita el frontend:** **401** con `{ "error": "Correo o contraseña incorrectos" }`, y **423** cuando la cuenta está
bloqueada por intentos fallidos. El frontend ya acepta 400 y 401, así que no se rompe mientras tanto.

## 2. Listados paginados · pendiente

**Hoy:** `GET /productos` (y los demás listados) devuelven una lista simple.

**Qué necesita el frontend:** `{ "data": [...], "total": 87, "pagina": 1, "limite": 10 }`, aceptando `?pagina=`, `?limite=` y
`?buscar=`. Filtros que usan las pantallas:

| Ruta | Filtros |
|---|---|
| `GET /productos` | `buscar` (nombre o SKU), `categoria`, `stockBajo=true` |
| `GET /clientes` | `buscar` (documento o nombre) |
| `GET /ventas` | `desde`, `hasta`, `estado`, `buscar`; el vendedor solo recibe las suyas |
| `GET /compras` | `limite` (el dashboard pide las 5 últimas) |

## 3. Tablas que faltan · pendiente

**Hoy:** la base tiene 5 tablas (`usuarios`, `productos`, `clientes`, `ventas`, `venta_detalle`).

**Qué necesita el frontend:** las 11 del modelo (`docs/modelo-er.png`). Faltan `categorias`, `proveedores`, `compras`,
`compra_detalle`, `movimientos_inventario` y `pagos`, y columnas nuevas en las que ya existen:
- `usuarios`: `rol` con `admin | vendedor | almacenero`, `intentos_fallidos`, `bloqueado_hasta`, `activo`.
- `productos`: `sku`, `categoria_id`, `precio_compra`, `precio_venta`, `stock_minimo`, `activo`.
- `clientes`: `tipo_documento` (`DNI | RUC`), `direccion`.
- `ventas`: `serie_numero`, `tipo_comprobante`, `subtotal`, `igv`, `estado`, `metodo_pago`.

Los datos de prueba del frontend usan exactamente estos nombres de campos.

## 4. Ajustes de stock: dónde va el motivo · por decidir

> **Respuesta de backend:** propone la columna `motivo` en `movimientos_inventario`. El frontend está de acuerdo.

**Qué muestra el frontend:** en el detalle del producto, el admin ajusta el stock con una cantidad (positiva o negativa) y un
**motivo** obligatorio (por ejemplo "conteo físico").

**Qué necesita el backend:** `POST /inventario/ajustes` con `{ producto_id, cantidad, motivo }`, y guardar el motivo en
`movimientos_inventario` (hoy el modelo solo tiene `referencia`). Propuesta: agregar la columna `motivo`.

## 5. Caja: orden de las llamadas al cobrar · por decidir

> **Respuesta de backend:** `/pagos/simular` solo aprueba o rechaza; `POST /ventas` recibe `metodo_pago` y guarda la venta y el pago
> juntos. El frontend puede trabajar así: falta confirmarlo entre los dos y anotarlo en `docs/API.md`.

**Qué muestra el frontend:** el vendedor arma el carrito, elige cliente, boleta o factura y método de pago, y pulsa "Cobrar".

**Propuesta:**
1. `POST /pagos/simular` con `{ monto, metodo }` → `{ aprobado: true, referencia: "SIM-000123" }`.
2. Si se aprueba, `POST /ventas` con `{ cliente_id, tipo_comprobante, metodo_pago, referencia_pago, items: [{ producto_id, cantidad }] }`.
3. Respuesta **201** con la venta completa (para mostrar la boleta). Si falta stock, **409** diciendo qué producto.

Los precios, el IGV y el total los calcula el backend; el frontend solo los muestra.

## 6. Contrato de la API · pendiente

**Qué necesita el frontend:** `docs/API.md` con cada ruta: método, quién puede usarla, cuerpo que recibe, respuesta y errores.
Las rutas y el formato ya acordados están en `docs/plan-tecnico.html` (sección "Contrato de la API").

## 7. CORS para el despliegue · más adelante

Cuando el frontend esté en Vercel, agregar su URL a `CORS_ORIGIN` en Render (además de `http://localhost:3000`).

---

## Resueltos

*(Todavía ninguno.)*
