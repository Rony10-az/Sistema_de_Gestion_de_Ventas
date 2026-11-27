# Pruebas HTTP con Bruno

1. Levanta la API (`npm run dev` o Docker).
2. En Bruno: **Open Collection** y elige esta carpeta.
3. Selecciona el entorno **local**.
4. En **auth**, ejecuta *Registrar* (solo la primera vez) y *Iniciar sesion*: guarda el token.
5. Corre cada carpeta, o toda la colección, en orden.

`ventas / Crear venta` usa el cliente 1 de los datos de prueba y deja una venta con
total 0, porque el cálculo todavía no está programado.
