'use client';

// Hace aparecer su contenido (sube y se aclara) cuando entra en pantalla al hacer scroll.
// <Revelar retraso={2}> … </Revelar>  → retraso en pasos de 90 ms para escalonar listas.
// Todos los bloques comparten un solo IntersectionObserver y se animan una sola vez.

import { useEffect, useRef } from 'react';
import { cn } from '../../lib/utils';

let observador = null;

function observar(elemento) {
  if (typeof IntersectionObserver === 'undefined') {
    elemento.classList.add('es-visible');
    return () => {};
  }
  if (!observador) {
    observador = new IntersectionObserver(
      (entradas) => {
        entradas.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('es-visible');
            observador.unobserve(e.target);
          }
        });
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.12 },
    );
  }
  observador.observe(elemento);
  return () => observador?.unobserve(elemento);
}

export function Revelar({ as: Etiqueta = 'div', retraso = 0, className, style, children, ...resto }) {
  const ref = useRef(null);
  useEffect(() => (ref.current ? observar(ref.current) : undefined), []);

  return (
    <Etiqueta ref={ref} className={cn('revelar', className)} style={{ '--retraso': `${retraso * 90}ms`, ...style }} {...resto}>
      {children}
    </Etiqueta>
  );
}

// Número que cuenta desde 0 hasta `valor` cuando aparece en pantalla.
export function Contador({ valor, decimales = 0, duracion = 1400, className }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const formato = (n) => n.toLocaleString('es-PE', { minimumFractionDigits: decimales, maximumFractionDigits: decimales });
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || typeof IntersectionObserver === 'undefined') {
      el.textContent = formato(valor);
      return undefined;
    }
    let cuadro;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      const inicio = performance.now();
      const paso = (ahora) => {
        const t = Math.min((ahora - inicio) / duracion, 1);
        el.textContent = formato(valor * (1 - (1 - t) ** 3));
        if (t < 1) cuadro = requestAnimationFrame(paso);
      };
      cuadro = requestAnimationFrame(paso);
    });
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(cuadro);
    };
  }, [valor, decimales, duracion]);

  return (
    <span ref={ref} className={className}>
      {valor.toLocaleString('es-PE', { minimumFractionDigits: decimales, maximumFractionDigits: decimales })}
    </span>
  );
}
