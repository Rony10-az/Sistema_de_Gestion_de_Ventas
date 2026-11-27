// Datos de prueba de la tienda pública (catálogo que ve el cliente).
// Los campos base son los de la tabla `productos` de la migración 002 del backend
// (id, sku, nombre, descripcion, categoria_id, precio_venta, stock, stock_minimo, activo).
// precio_compra NO va: la tienda nunca lo muestra. Lo demás (slug, marca, imágenes, ficha,
// calificación) todavía no existe en la base: está pedido al backend en
// tecnifix-frontend/equipo-frontend/README.md. Las fotos son de Unsplash (licencia libre).

export const CATEGORIAS = [
  { id: 1, slug: 'cargadores-y-cables', nombre: 'Cargadores y cables', resumen: 'Energía y conexión para el día a día.' },
  { id: 2, slug: 'audio', nombre: 'Audio', resumen: 'Audífonos con y sin cable, para trabajar o entrenar.' },
  { id: 3, slug: 'perifericos', nombre: 'Periféricos', resumen: 'Mouse, teclados, cámaras y adaptadores.' },
  { id: 4, slug: 'almacenamiento', nombre: 'Almacenamiento y memoria', resumen: 'SSD, memorias RAM y discos portátiles.' },
  { id: 5, slug: 'repuestos', nombre: 'Repuestos', resumen: 'Pantallas, baterías y piezas para reparar.' },
  { id: 6, slug: 'herramientas', nombre: 'Herramientas', resumen: 'Kits propios para el taller y la casa.' },
];

// Foto de Unsplash por su identificador; el tamaño lo pone src/lib/cargador-imagenes.js
export const foto = (id) => `https://images.unsplash.com/${id}`;

const p = (datos) => ({ sku: `TFX-${datos.id}`, activo: true, stock_minimo: 5, precio_anterior: null, etiqueta: null, ...datos });

export const PRODUCTOS = [
  p({
    id: 101, slug: 'cable-usb-c-trenzado-2m', nombre: 'Cable USB-C a USB-C trenzado 2 m', marca: 'Baseus', categoria_id: 1,
    precio_venta: 39.9, stock: 48, etiqueta: 'Más vendido', calificacion: 4.9, resenas: 31,
    imagenes: [foto('photo-1760377821967-8bb2f250e041'), foto('photo-1595756630452-736bc8ef3693')],
    resumen: 'Carga a 100 W y no se pela en la punta.',
    descripcion: 'Cable con malla de nailon y conectores reforzados. Sirve para celulares, tablets y laptops que cargan por USB-C.',
    ficha: [['Longitud', '2 m'], ['Potencia', 'Hasta 100 W'], ['Datos', '480 Mbps'], ['Material', 'Nailon trenzado']],
    para: ['celular', 'laptop', 'cargar'],
  }),
  p({
    id: 102, slug: 'cargador-gan-65w', nombre: 'Cargador GaN 65 W de 3 puertos', marca: 'Anker', categoria_id: 1,
    precio_venta: 149, precio_anterior: 179, stock: 22, etiqueta: 'Carga rápida', calificacion: 4.8, resenas: 24,
    imagenes: [foto('photo-1557767382-97b28f5488e7'), foto('photo-1770417999831-1c070eb628e6')],
    resumen: 'Un solo cargador para el celular, la tablet y la laptop.',
    descripcion: 'Tecnología GaN: más pequeño y frío que un cargador común. Reparte la potencia entre sus tres puertos.',
    ficha: [['Potencia', '65 W'], ['Puertos', '2 USB-C + 1 USB-A'], ['Tecnología', 'GaN II'], ['Enchufe', 'Plegable']],
    para: ['celular', 'laptop', 'cargar'],
  }),
  p({
    id: 103, slug: 'bateria-externa-20000', nombre: 'Batería externa 20 000 mAh', marca: 'Xiaomi', categoria_id: 1,
    precio_venta: 119, stock: 15, calificacion: 4.7, resenas: 18,
    imagenes: [foto('photo-1566554738544-d962991c3fee'), foto('photo-1760708825913-65a50b3dc39b')],
    resumen: 'Hasta cuatro cargas completas de celular.',
    descripcion: 'Carga dos equipos a la vez y se recarga por USB-C en unas cuatro horas.',
    ficha: [['Capacidad', '20 000 mAh'], ['Salida', '22.5 W'], ['Puertos', '2 USB-A + 1 USB-C'], ['Peso', '370 g']],
    para: ['celular', 'cargar'],
  }),
  p({
    id: 104, slug: 'cable-hdmi-2-1-2m', nombre: 'Cable HDMI 2.1 8K de 2 m', marca: 'Ugreen', categoria_id: 1,
    precio_venta: 45.9, stock: 30, calificacion: 4.8, resenas: 12,
    imagenes: [foto('photo-1583259034006-5ea8361109e7')],
    resumen: 'Imagen 4K a 120 Hz para monitor, TV o consola.',
    descripcion: 'Cable certificado para HDMI 2.1, con conectores bañados en oro.',
    ficha: [['Versión', 'HDMI 2.1'], ['Resolución', '8K 60 Hz · 4K 120 Hz'], ['Longitud', '2 m'], ['Ancho de banda', '48 Gbps']],
    para: ['pc', 'laptop', 'conectar'],
  }),
  p({
    id: 105, slug: 'audifonos-bluetooth-anc', nombre: 'Audífonos Bluetooth con cancelación de ruido', marca: 'Soundcore', categoria_id: 2,
    precio_venta: 289, precio_anterior: 329, stock: 9, etiqueta: 'Oferta', calificacion: 4.8, resenas: 27,
    imagenes: [foto('photo-1585298723682-7115561c51b7'), foto('photo-1618366712010-f4ae9c647dcb')],
    resumen: 'Silencio para concentrarte, 40 horas de batería.',
    descripcion: 'Cancelación activa de ruido con modo ambiente. Se conectan a dos equipos a la vez.',
    ficha: [['Batería', 'Hasta 40 h'], ['Conexión', 'Bluetooth 5.3'], ['Cancelación', 'Activa (ANC)'], ['Carga', 'USB-C']],
    para: ['celular', 'laptop', 'escuchar'],
  }),
  p({
    id: 106, slug: 'audifonos-tws', nombre: 'Audífonos inalámbricos TWS', marca: 'Xiaomi', categoria_id: 2,
    precio_venta: 99.9, stock: 26, calificacion: 4.6, resenas: 22,
    imagenes: [foto('photo-1590658268037-6bf12165a8df')],
    resumen: 'Livianos, con estuche de carga de bolsillo.',
    descripcion: 'Audífonos sin cables con control táctil y resistencia al sudor.',
    ficha: [['Batería', '6 h + 24 h en estuche'], ['Conexión', 'Bluetooth 5.3'], ['Resistencia', 'IPX4'], ['Carga', 'USB-C']],
    para: ['celular', 'escuchar'],
  }),
  p({
    id: 107, slug: 'mouse-inalambrico-silencioso', nombre: 'Mouse inalámbrico silencioso', marca: 'Logitech', categoria_id: 3,
    precio_venta: 69.9, stock: 34, calificacion: 4.7, resenas: 19,
    imagenes: [foto('photo-1615663245857-ac93bb7c39e7')],
    resumen: 'Clic sin ruido y 18 meses con una pila.',
    descripcion: 'Receptor USB de bolsillo y diseño para ambas manos.',
    ficha: [['Conexión', 'Receptor USB 2.4 GHz'], ['Sensor', '1000 DPI'], ['Batería', '1 pila AA, 18 meses'], ['Clic', 'Silencioso']],
    para: ['laptop', 'pc', 'trabajar'],
  }),
  p({
    id: 108, slug: 'mouse-gamer-ultraligero', nombre: 'Mouse gamer ultraligero 26 000 DPI', marca: 'HyperX', categoria_id: 3,
    precio_venta: 159, stock: 11, etiqueta: 'Gamer', calificacion: 4.9, resenas: 14,
    imagenes: [foto('photo-1771444700533-ff7aa34d29fe')],
    resumen: '59 g y un sensor que no pierde el rastro.',
    descripcion: 'Carcasa con panal para bajar el peso y cable flexible tipo paracord.',
    ficha: [['Peso', '59 g'], ['Sensor', '26 000 DPI'], ['Botones', '6 programables'], ['Cable', 'Paracord 1.8 m']],
    para: ['pc', 'jugar'],
  }),
  p({
    id: 109, slug: 'teclado-mecanico-rgb', nombre: 'Teclado mecánico RGB switches rojos', marca: 'Redragon', categoria_id: 3,
    precio_venta: 219, stock: 7, calificacion: 4.8, resenas: 21,
    imagenes: [foto('photo-1547394765-185e1e68f34e'), foto('photo-1618384887929-16ec33fab9ef')],
    resumen: 'Teclas suaves para escribir y jugar horas.',
    descripcion: 'Formato compacto sin teclado numérico, iluminación RGB por tecla y switches intercambiables.',
    ficha: [['Switches', 'Rojos lineales'], ['Formato', 'TKL (87 teclas)'], ['Iluminación', 'RGB por tecla'], ['Cable', 'USB-C desmontable']],
    para: ['pc', 'jugar', 'trabajar'],
  }),
  p({
    id: 110, slug: 'camara-web-full-hd', nombre: 'Cámara web Full HD 1080p', marca: 'Logitech', categoria_id: 3,
    precio_venta: 199, stock: 6, calificacion: 4.6, resenas: 9,
    imagenes: [foto('photo-1760348213920-d2a90ed705fd')],
    resumen: 'Clases y reuniones con imagen nítida.',
    descripcion: 'Micrófono estéreo, enfoque automático y tapa de privacidad.',
    ficha: [['Resolución', '1080p a 30 fps'], ['Micrófono', 'Estéreo'], ['Enfoque', 'Automático'], ['Montaje', 'Clip para monitor']],
    para: ['laptop', 'pc', 'trabajar'],
  }),
  p({
    id: 111, slug: 'adaptador-wifi-doble-banda', nombre: 'Adaptador Wi-Fi USB doble banda', marca: 'TP-Link', categoria_id: 3,
    precio_venta: 69.9, stock: 18, calificacion: 4.5, resenas: 11,
    imagenes: [foto('photo-1785175861969-b4518b2eaaa6')],
    resumen: 'Wi-Fi rápido para la PC que no tiene antena.',
    descripcion: 'Dos antenas de alta ganancia y conexión a 2.4 y 5 GHz.',
    ficha: [['Velocidad', 'Hasta 1300 Mbps'], ['Bandas', '2.4 GHz y 5 GHz'], ['Antenas', '2 externas'], ['Puerto', 'USB 3.0']],
    para: ['pc', 'conectar'],
  }),
  p({
    id: 112, slug: 'hub-usb-7-puertos', nombre: 'Hub USB 3.0 de 7 puertos con interruptores', marca: 'Ugreen', categoria_id: 3,
    precio_venta: 79.9, stock: 13, calificacion: 4.7, resenas: 8,
    imagenes: [foto('photo-1760376789487-994070337c76'), foto('photo-1760376789478-c1023d2dc007')],
    resumen: 'Siete puertos y un botón para cada uno.',
    descripcion: 'Enciende y apaga cada puerto por separado. Incluye entrada de energía adicional.',
    ficha: [['Puertos', '7 USB 3.0'], ['Velocidad', '5 Gbps'], ['Interruptores', 'Uno por puerto'], ['Cable', '1 m']],
    para: ['laptop', 'pc', 'conectar'],
  }),
  p({
    id: 113, slug: 'ssd-nvme-1tb', nombre: 'SSD NVMe M.2 de 1 TB', marca: 'Kingston', categoria_id: 4,
    precio_venta: 259, stock: 10, etiqueta: 'Más rápido', calificacion: 4.9, resenas: 26,
    imagenes: [foto('photo-1669480380758-4b163a33f6f9')],
    resumen: 'Tu laptop enciende en segundos.',
    descripcion: 'Unidad PCIe 4.0 para laptops y PCs con ranura M.2. La instalamos gratis si la compras en tienda.',
    ficha: [['Capacidad', '1 TB'], ['Interfaz', 'PCIe 4.0 NVMe'], ['Lectura', '6000 MB/s'], ['Formato', 'M.2 2280']],
    para: ['laptop', 'pc', 'mejorar'],
  }),
  p({
    id: 114, slug: 'ssd-portatil-1tb', nombre: 'SSD portátil USB-C de 1 TB', marca: 'SanDisk', categoria_id: 4,
    precio_venta: 349, stock: 4, calificacion: 4.8, resenas: 10,
    imagenes: [foto('photo-1779896412305-638de9b07d8a')],
    resumen: 'Tus archivos en el bolsillo, resistente a caídas.',
    descripcion: 'Disco externo con carcasa de goma y gancho para colgar.',
    ficha: [['Capacidad', '1 TB'], ['Velocidad', '1050 MB/s'], ['Conexión', 'USB-C 3.2'], ['Resistencia', 'IP65, caídas de 2 m']],
    para: ['laptop', 'mejorar'],
  }),
  p({
    id: 115, slug: 'memoria-ram-ddr4-16gb', nombre: 'Memoria RAM DDR4 16 GB 3200 MHz', marca: 'Kingston Fury', categoria_id: 4,
    precio_venta: 189, stock: 3, calificacion: 4.9, resenas: 17,
    imagenes: [foto('photo-1541029071515-84cc54f84dc5'), foto('photo-1542978709-19c95dc3bc7e')],
    resumen: 'Más pestañas y programas abiertos sin trabarse.',
    descripcion: 'Módulo SODIMM para laptop. Te ayudamos a ver si tu equipo es compatible antes de comprar.',
    ficha: [['Capacidad', '16 GB'], ['Tipo', 'DDR4 SODIMM'], ['Frecuencia', '3200 MHz'], ['Voltaje', '1.2 V']],
    para: ['laptop', 'mejorar'],
  }),
  p({
    id: 116, slug: 'pantalla-celular-oled', nombre: 'Pantalla de repuesto OLED para celular', marca: 'Genérica premium', categoria_id: 5,
    precio_venta: 249, stock: 5, calificacion: 4.5, resenas: 13,
    imagenes: [foto('photo-1639776738932-956082f0b704'), foto('photo-1550041473-d296a3a8a18a')],
    resumen: 'Módulo completo con táctil, listo para instalar.',
    descripcion: 'Indica el modelo exacto de tu celular y confirmamos el stock antes de que vengas.',
    ficha: [['Tipo', 'OLED con táctil'], ['Incluye', 'Marco y adhesivo'], ['Garantía', '3 meses'], ['Instalación', 'En tienda']],
    para: ['celular', 'reparar'],
  }),
  p({
    id: 117, slug: 'bateria-laptop-45wh', nombre: 'Batería interna para laptop 45 Wh', marca: 'Genérica premium', categoria_id: 5,
    precio_venta: 179, stock: 2, calificacion: 4.4, resenas: 7,
    imagenes: [foto('photo-1769085794153-54fd3d57efaf')],
    resumen: 'Tu laptop vuelve a durar toda la mañana.',
    descripcion: 'Celdas nuevas con protección contra sobrecarga. Confirmamos la compatibilidad con tu modelo.',
    ficha: [['Capacidad', '45 Wh'], ['Celdas', '3 de litio'], ['Garantía', '6 meses'], ['Instalación', 'En tienda']],
    para: ['laptop', 'reparar'],
  }),
  p({
    id: 118, slug: 'smartwatch-deportivo', nombre: 'Reloj inteligente deportivo', marca: 'Amazfit', categoria_id: 2,
    precio_venta: 329, stock: 0, calificacion: 4.6, resenas: 15,
    imagenes: [foto('photo-1546868871-7041f2a55e12'), foto('photo-1579586337278-3befd40fd17a')],
    resumen: 'Pasos, sueño y notificaciones en la muñeca.',
    descripcion: 'Pantalla AMOLED, GPS integrado y hasta 12 días de batería.',
    ficha: [['Pantalla', 'AMOLED 1.43"'], ['GPS', 'Integrado'], ['Batería', 'Hasta 12 días'], ['Resistencia', '5 ATM']],
    para: ['celular', 'escuchar'],
  }),
  p({
    id: 119, slug: 'kit-destornilladores-64', nombre: 'Kit de destornilladores de precisión 64 en 1', marca: 'TecniFix', categoria_id: 6,
    precio_venta: 89.9, stock: 20, etiqueta: 'Marca propia', calificacion: 5, resenas: 16,
    imagenes: [foto('photo-1524224313114-ebd9c49dde82'), foto('photo-1581621293775-7aac902d7032')],
    resumen: 'Las 64 puntas que usamos en nuestro taller.',
    descripcion: 'Puntas de acero S2 magnetizadas, mango giratorio y estuche con cada punta rotulada.',
    ficha: [['Puntas', '64 de acero S2'], ['Mango', 'Aluminio con giro'], ['Extras', 'Pinza, ventosa y palanca'], ['Estuche', 'Rotulado']],
    para: ['celular', 'laptop', 'pc', 'reparar'],
  }),
  p({
    id: 120, slug: 'kit-mantenimiento-pc', nombre: 'Kit de mantenimiento: pasta térmica y limpieza', marca: 'TecniFix', categoria_id: 6,
    precio_venta: 49.9, stock: 25, etiqueta: 'Marca propia', calificacion: 4.9, resenas: 12,
    imagenes: [foto('photo-1597138804456-e7dca7f59d54'), foto('photo-1518770660439-4636190af475')],
    resumen: 'Tu equipo más fresco y sin polvo en 20 minutos.',
    descripcion: 'Pasta térmica, alcohol isopropílico, brochas antiestáticas y una guía paso a paso.',
    ficha: [['Pasta térmica', '4 g, 12.8 W/mK'], ['Limpieza', 'Alcohol isopropílico 99 %'], ['Brochas', '2 antiestáticas'], ['Guía', 'Paso a paso impresa']],
    para: ['laptop', 'pc', 'reparar'],
  }),
];

export const MARCAS = ['Anker', 'Baseus', 'Logitech', 'Kingston', 'Xiaomi', 'TP-Link', 'Ugreen', 'Redragon', 'SanDisk', 'HyperX', 'Soundcore', 'Amazfit'];

export const COMPROMISOS = [
  'Boleta y factura electrónica',
  'Garantía de 6 meses',
  'Stock actualizado en cada venta',
  'Recojo en tienda el mismo día',
  'Pago con Yape o tarjeta',
  'Te ayudamos a elegir gratis',
];

// Reseñas de ejemplo (datos de prueba, se marcan así en la página).
export const RESENAS = [
  { autor: 'Milagros C.', fecha: '11/2026', producto: 'SSD NVMe M.2 de 1 TB', estrellas: 5, texto: 'Llevé mi laptop que tardaba cinco minutos en prender. Me instalaron el SSD en la tienda y ahora enciende en segundos.' },
  { autor: 'Renzo A.', fecha: '10/2026', producto: 'Cargador GaN 65 W', estrellas: 5, texto: 'Dejé de cargar tres cargadores en la mochila. Con este cargo la laptop y el celular a la vez.' },
  { autor: 'Kiara P.', fecha: '10/2026', producto: 'Pantalla de repuesto OLED', estrellas: 4, texto: 'Confirmaron por mensaje que había stock de mi modelo antes de ir. El cambio fue rápido.' },
  { autor: 'Diego V.', fecha: '09/2026', producto: 'Kit de destornilladores 64 en 1', estrellas: 5, texto: 'Las puntas no se barren y el estuche trae todo rotulado. Lo uso para reparar las consolas de mis primos.' },
  { autor: 'Fiorella M.', fecha: '09/2026', producto: 'Memoria RAM DDR4 16 GB', estrellas: 5, texto: 'Me revisaron qué memoria aceptaba mi laptop antes de venderme. Buena atención.' },
  { autor: 'Joaquín T.', fecha: '08/2026', producto: 'Teclado mecánico RGB', estrellas: 5, texto: 'Me dieron boleta electrónica al toque y el teclado llegó sellado.' },
];

export const PREGUNTAS = [
  { p: '¿Cómo sé si un repuesto es compatible con mi equipo?', r: 'Usa el asistente de esta página o escríbenos el modelo exacto de tu equipo. Lo revisamos antes de que pagues.' },
  { p: '¿El stock que veo es real?', r: 'Sí. El catálogo sale del mismo inventario que usa la caja: cuando se registra una venta, el stock baja en ese momento.' },
  { p: '¿Me dan boleta o factura?', r: 'Siempre. Emitimos boleta o factura electrónica con IGV de 18 % y te la enviamos al correo.' },
  { p: '¿Qué garantía tienen los productos?', r: 'Seis meses por defecto de fábrica. Las pantallas de repuesto tienen tres meses y cubren fallas del módulo.' },
  { p: '¿Puedo reservar y pagar en tienda?', r: 'Sí. Arma tu carrito, reserva el pedido y paga al recogerlo con efectivo, Yape o tarjeta.' },
  { p: '¿Instalan lo que compro?', r: 'SSD, memorias RAM, baterías y pantallas se instalan en tienda. La instalación de SSD y RAM es gratis.' },
];

// Preguntas del asistente "Tres preguntas, el repuesto correcto".
export const ASISTENTE = [
  {
    clave: 'equipo',
    titulo: '¿Para qué equipo es?',
    ayuda: 'Elige el que más se parece al tuyo.',
    opciones: [
      { valor: 'celular', nombre: 'Celular o tablet', detalle: 'Android, iPhone o tablet.' },
      { valor: 'laptop', nombre: 'Laptop', detalle: 'De estudio, trabajo o gamer.' },
      { valor: 'pc', nombre: 'PC de escritorio', detalle: 'Torre, monitor y periféricos.' },
    ],
  },
  {
    clave: 'objetivo',
    titulo: '¿Qué quieres lograr?',
    ayuda: 'Te mostramos solo lo que sirve para eso.',
    opciones: [
      { valor: 'cargar', nombre: 'Cargar más rápido', detalle: 'Cargadores, cables y baterías.' },
      { valor: 'mejorar', nombre: 'Que vaya más rápido', detalle: 'SSD y memoria RAM.' },
      { valor: 'reparar', nombre: 'Reparar algo', detalle: 'Pantallas, baterías y herramientas.' },
      { valor: 'conectar', nombre: 'Conectar más cosas', detalle: 'Hubs, HDMI y Wi-Fi.' },
      { valor: 'escuchar', nombre: 'Escuchar mejor', detalle: 'Audífonos y relojes.' },
      { valor: 'trabajar', nombre: 'Trabajar cómodo', detalle: 'Mouse, teclado y cámara.' },
    ],
  },
  {
    clave: 'presupuesto',
    titulo: '¿Cuánto quieres gastar?',
    ayuda: 'Precios con IGV incluido.',
    opciones: [
      { valor: 100, nombre: 'Hasta S/ 100', detalle: 'Lo esencial.' },
      { valor: 250, nombre: 'Hasta S/ 250', detalle: 'El equilibrio.' },
      { valor: 10000, nombre: 'Lo que sea necesario', detalle: 'Lo mejor que tengamos.' },
    ],
  },
];

export const categoriaPorId = (id) => CATEGORIAS.find((c) => c.id === id);
export const categoriaPorSlug = (slug) => CATEGORIAS.find((c) => c.slug === slug);
export const productoPorSlug = (slug) => PRODUCTOS.find((x) => x.slug === slug);
export const productosDeCategoria = (id) => PRODUCTOS.filter((x) => x.categoria_id === id);

// Estado del stock como lo muestra la tienda (usa el stock mínimo del inventario).
export function estadoStock(producto) {
  if (producto.stock <= 0) return { tono: 'agotado', texto: 'Agotado' };
  if (producto.stock <= producto.stock_minimo) return { tono: 'pocos', texto: `Últimas ${producto.stock} unidades` };
  return { tono: 'disponible', texto: `En stock · ${producto.stock} unid.` };
}

// Recomendación del asistente: coincide equipo y objetivo, respeta el presupuesto y prioriza lo que hay en stock.
// Si nada calza con el equipo, se relaja ese filtro y luego el presupuesto, para no dejar al cliente sin opciones.
export function recomendar({ equipo, objetivo, presupuesto }) {
  const ordenar = (lista) =>
    lista.sort((a, b) => (b.stock > 0) - (a.stock > 0) || b.calificacion - a.calificacion).slice(0, 3);
  const intentos = [
    (x) => x.para.includes(equipo) && x.para.includes(objetivo) && x.precio_venta <= presupuesto,
    (x) => x.para.includes(objetivo) && x.precio_venta <= presupuesto,
    (x) => x.para.includes(objetivo),
  ];
  for (const filtro of intentos) {
    const lista = PRODUCTOS.filter(filtro);
    if (lista.length) return { exacto: filtro === intentos[0], productos: ordenar(lista) };
  }
  return { exacto: false, productos: [] };
}
