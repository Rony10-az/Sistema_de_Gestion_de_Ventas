'use client';

// Texto que se "descifra" letra por letra al cargar (efecto del hero de hodl.swiss).
// Los lectores de pantalla leen el texto final desde el primer momento.

import { useEffect, useRef } from 'react';

const SIGNOS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%&*+<>/';

export function TextoDescifrado({ texto, retraso = 0, duracion = 900, className }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;

    let cuadro;
    let espera;
    el.textContent = texto.replace(/\S/g, ' ');

    espera = setTimeout(() => {
      const inicio = performance.now();
      const paso = (ahora) => {
        const avance = Math.min((ahora - inicio) / duracion, 1);
        const fijas = Math.floor(avance * texto.length);
        el.textContent = texto
          .split('')
          .map((letra, i) => (i < fijas || letra === ' ' ? letra : SIGNOS[(Math.random() * SIGNOS.length) | 0]))
          .join('');
        if (avance < 1) cuadro = requestAnimationFrame(paso);
        else el.textContent = texto;
      };
      cuadro = requestAnimationFrame(paso);
    }, retraso);

    return () => {
      clearTimeout(espera);
      cancelAnimationFrame(cuadro);
      el.textContent = texto;
    };
  }, [texto, retraso, duracion]);

  return (
    <span className={className} aria-label={texto}>
      <span ref={ref} aria-hidden="true">
        {texto}
      </span>
    </span>
  );
}
