'use client';

// Carrito de la tienda pública. Se guarda en el navegador (localStorage) para que no
// se pierda al recargar. La cantidad nunca supera el stock del producto.

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { PRODUCTOS } from '../mocks/tienda.mock';

const CLAVE = 'tecnifix-carrito';
const CarritoContext = createContext(null);

function leerGuardado() {
  try {
    const datos = JSON.parse(localStorage.getItem(CLAVE) || '[]');
    return Array.isArray(datos) ? datos.filter((l) => PRODUCTOS.some((x) => x.id === l.id) && l.cantidad > 0) : [];
  } catch {
    return [];
  }
}

export function CarritoProvider({ children }) {
  const [lineas, setLineas] = useState([]);
  const [abierto, setAbierto] = useState(false);
  const [listo, setListo] = useState(false);

  useEffect(() => {
    setLineas(leerGuardado());
    setListo(true);
  }, []);

  useEffect(() => {
    if (!listo) return;
    try {
      localStorage.setItem(CLAVE, JSON.stringify(lineas));
    } catch {
      // Navegación privada o almacenamiento bloqueado: el carrito vive solo en memoria.
    }
  }, [lineas, listo]);

  const agregar = useCallback((producto, cantidad = 1) => {
    if (producto.stock <= 0) {
      toast.error('Este producto está agotado');
      return;
    }
    const linea = lineas.find((l) => l.id === producto.id);
    const pedida = (linea?.cantidad ?? 0) + cantidad;
    const nueva = Math.min(pedida, producto.stock);
    setLineas((actual) =>
      actual.some((l) => l.id === producto.id)
        ? actual.map((l) => (l.id === producto.id ? { ...l, cantidad: nueva } : l))
        : [...actual, { id: producto.id, cantidad: nueva }],
    );
    if (pedida > producto.stock) toast.warning(`Solo quedan ${producto.stock} unidades de este producto`);
    else toast.success('Agregado al carrito', { description: producto.nombre });
    setAbierto(true);
  }, [lineas]);

  const cambiarCantidad = useCallback((id, cantidad) => {
    const producto = PRODUCTOS.find((x) => x.id === id);
    setLineas((actual) =>
      cantidad <= 0
        ? actual.filter((l) => l.id !== id)
        : actual.map((l) => (l.id === id ? { ...l, cantidad: Math.min(cantidad, producto?.stock ?? cantidad) } : l)),
    );
  }, []);

  const quitar = useCallback((id) => setLineas((actual) => actual.filter((l) => l.id !== id)), []);
  const vaciar = useCallback(() => setLineas([]), []);

  const valor = useMemo(() => {
    const items = lineas
      .map((l) => ({ ...l, producto: PRODUCTOS.find((x) => x.id === l.id) }))
      .filter((l) => l.producto);
    const total = items.reduce((suma, l) => suma + l.producto.precio_venta * l.cantidad, 0);
    const unidades = items.reduce((suma, l) => suma + l.cantidad, 0);
    return { items, total, unidades, abierto, setAbierto, agregar, cambiarCantidad, quitar, vaciar };
  }, [lineas, abierto, agregar, cambiarCantidad, quitar, vaciar]);

  return <CarritoContext.Provider value={valor}>{children}</CarritoContext.Provider>;
}

export function useCarrito() {
  const contexto = useContext(CarritoContext);
  if (!contexto) throw new Error('useCarrito debe usarse dentro de <CarritoProvider>');
  return contexto;
}
