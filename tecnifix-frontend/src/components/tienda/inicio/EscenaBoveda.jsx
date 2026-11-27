'use client';

// Animación de entrada del hero (inspirada en la bóveda de hodl.swiss):
// 1) "Bóveda inicializándose…"  2) aparece la puerta  3) la rueda gira y se encienden
// las luces del teclado  4) los cerrojos se retraen y la puerta se abre  5) detrás
// aparecen los productos. Solo SVG + CSS, sin librerías 3D. Si el sistema pide
// reducir el movimiento, se muestran los productos directamente.

import { useEffect, useState } from 'react';
import { cn } from '../../../lib/utils';

const C = { x: 220, y: 230 }; // centro de la puerta en el viewBox
const RAYOS = [0, 45, 90, 135, 180, 225, 270, 315];
const HEX = [-90, -30, 30, 90, 150, 210]
  .map((a) => `${(C.x + 44 * Math.cos((a * Math.PI) / 180)).toFixed(1)},${(C.y + 44 * Math.sin((a * Math.PI) / 180)).toFixed(1)}`)
  .join(' ');

function PuertaBoveda({ fase }) {
  const girando = fase === 'girando' || fase === 'abriendo';
  const abriendo = fase === 'abriendo';

  return (
    <svg viewBox="0 0 460 460" className="h-auto w-full drop-shadow-[0_40px_80px_rgb(0_0_0/0.8)]" aria-hidden="true">
      <defs>
        <linearGradient id="bov-metal" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#4b4656" />
          <stop offset="0.45" stopColor="#d9d4e4" />
          <stop offset="0.55" stopColor="#8d879a" />
          <stop offset="1" stopColor="#3a3644" />
        </linearGradient>
        <linearGradient id="bov-cuerpo" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1d1a24" />
          <stop offset="1" stopColor="#0b0a0f" />
        </linearGradient>
        <radialGradient id="bov-disco" cx="0.4" cy="0.35" r="0.75">
          <stop offset="0" stopColor="#24202c" />
          <stop offset="1" stopColor="#09080c" />
        </radialGradient>
        <linearGradient id="bov-marca" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#e879f9" />
          <stop offset="1" stopColor="#8e2bc4" />
        </linearGradient>
      </defs>

      {/* Cuerpo y bisagras */}
      <rect x="20" y="20" width="420" height="420" rx="26" fill="url(#bov-cuerpo)" stroke="#2c2836" strokeWidth="2" />
      <rect x="28" y="28" width="404" height="404" rx="20" fill="none" stroke="rgb(255 255 255 / 0.04)" />
      {[110, 230, 350].map((y) => (
        <g key={y}>
          <rect x="6" y={y - 26} width="26" height="52" rx="6" fill="url(#bov-metal)" opacity="0.8" />
          <rect x="12" y={y - 4} width="14" height="8" rx="2" fill="#e879f9" opacity="0.9" />
        </g>
      ))}

      {/* Anillo exterior con marcas */}
      <circle cx={C.x} cy={C.y} r="176" fill="url(#bov-disco)" stroke="url(#bov-metal)" strokeWidth="12" />
      <circle cx={C.x} cy={C.y} r="160" fill="none" stroke="#2a2633" strokeWidth="4" />
      {RAYOS.map((a) => (
        <rect
          key={a}
          x={C.x - 2}
          y={C.y - 168}
          width="4"
          height="10"
          rx="1"
          fill="#e879f9"
          transform={`rotate(${a + 22.5} ${C.x} ${C.y})`}
          className="transition-opacity duration-700"
          opacity={girando ? 1 : 0.35}
        />
      ))}

      {/* Arco de luz que recorre el disco mientras se desbloquea */}
      <circle
        cx={C.x}
        cy={C.y}
        r="118"
        fill="none"
        stroke="url(#bov-marca)"
        strokeWidth="5"
        strokeLinecap="round"
        strokeDasharray="140 600"
        className={cn('transition-opacity duration-500', girando ? 'opacity-100' : 'opacity-0')}
        style={{ transformOrigin: `${C.x}px ${C.y}px`, animation: 'girar 1.4s linear infinite' }}
      />

      {/* Rueda con 8 cerrojos: gira y luego se retrae */}
      <g
        style={{
          transformOrigin: `${C.x}px ${C.y}px`,
          transform: `rotate(${girando ? 225 : 0}deg) scale(${abriendo ? 0.84 : 1})`,
          transition: 'transform 1.3s cubic-bezier(0.65, 0, 0.35, 1)',
        }}
      >
        {RAYOS.map((a) => (
          <g key={a} transform={`rotate(${a} ${C.x} ${C.y})`}>
            <rect x={C.x - 7} y={C.y - 152} width="14" height="92" rx="5" fill="url(#bov-metal)" />
            <rect x={C.x - 9} y={C.y - 158} width="18" height="10" rx="3" fill="#e879f9" />
          </g>
        ))}
        <circle cx={C.x} cy={C.y} r="64" fill="#0c0a10" stroke="url(#bov-metal)" strokeWidth="8" />
      </g>

      {/* Centro con el logo */}
      <circle cx={C.x} cy={C.y} r="52" fill="#08070b" />
      <polygon
        points={HEX}
        fill="rgb(181 30 192 / 0.18)"
        stroke="url(#bov-marca)"
        strokeWidth="3"
        className="transition-[filter] duration-700"
        style={{ filter: girando ? 'drop-shadow(0 0 10px #d946ef)' : 'none' }}
      />
      <text x={C.x} y={C.y + 4} textAnchor="middle" fontFamily="Outfit Variable, sans-serif" fontWeight="800" fontSize="26" fill="url(#bov-marca)">
        TF
      </text>
      <text x={C.x} y={C.y + 22} textAnchor="middle" fontFamily="ui-monospace, monospace" fontSize="7" letterSpacing="2" fill="#c4b5fd">
        TECNIFIX
      </text>

      {/* Teclado con luces que se encienden en orden */}
      <rect x="398" y="176" width="34" height="112" rx="6" fill="#0f0d14" stroke="#2c2836" strokeWidth="2" />
      {[0, 1, 2, 3, 4].map((i) => (
        <circle
          key={i}
          cx="415"
          cy={190 + i * 9}
          r="2.6"
          fill={girando ? '#e879f9' : '#3a3445'}
          style={{ transition: 'fill 0.2s', transitionDelay: `${i * 180}ms` }}
        />
      ))}
      {[0, 1, 2].map((fila) =>
        [0, 1].map((col) => (
          <rect key={`${fila}-${col}`} x={405 + col * 11} y={238 + fila * 12} width="8" height="8" rx="1.5" fill="#211e29" />
        )),
      )}
      <rect
        x="405"
        y="274"
        width="19"
        height="8"
        rx="1.5"
        fill={abriendo ? '#22c55e' : '#2a2633'}
        style={{ transition: 'fill 0.3s' }}
      />
    </svg>
  );
}

export function EscenaBoveda({ className, children }) {
  const [fase, setFase] = useState('inicio');

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setFase('abierta');
      return undefined;
    }
    const pasos = [
      [700, 'cerrada'],
      [1300, 'girando'],
      [2700, 'abriendo'],
      [3900, 'abierta'],
    ].map(([ms, f]) => setTimeout(() => setFase(f), ms));
    return () => pasos.forEach(clearTimeout);
  }, []);

  const visibles = fase === 'abriendo' || fase === 'abierta';

  return (
    <div className={cn('relative', className)}>
      <div
        className={cn(
          'absolute inset-0 transition-[opacity,transform] duration-1000 ease-out',
          visibles ? 'scale-100 opacity-100' : 'pointer-events-none scale-[0.88] opacity-0',
        )}
        style={{ transitionDelay: visibles ? '250ms' : '0ms' }}
      >
        {children}
      </div>

      {fase !== 'abierta' && (
        <div className="pointer-events-none absolute inset-0 grid place-items-center [perspective:1400px]" aria-hidden="true">
          <div
            className="w-[62%] max-w-[26rem]"
            style={{
              transformOrigin: '0% 50%',
              transition: 'transform 1.1s cubic-bezier(0.65, 0, 0.35, 1), opacity 1s ease',
              transform:
                fase === 'inicio' ? 'scale(0.82)' : fase === 'abriendo' ? 'rotateY(-104deg) translateX(-4%)' : 'scale(1)',
              opacity: fase === 'inicio' ? 0 : fase === 'abriendo' ? 0 : 1,
            }}
          >
            <PuertaBoveda fase={fase} />
          </div>

          {/* Destello al abrirse */}
          <span
            className={cn(
              'absolute left-1/2 top-1/2 size-[70%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,hsl(var(--primary)/0.55),transparent)] transition-opacity duration-700',
              fase === 'abriendo' ? 'opacity-100' : 'opacity-0',
            )}
          />

          {/* Texto de carga */}
          <p
            className={cn(
              'absolute bottom-[6%] flex flex-col items-center gap-2 font-mono text-[0.62rem] uppercase tracking-[0.3em] text-muted-foreground transition-opacity duration-500',
              fase === 'abriendo' ? 'opacity-0' : 'opacity-100',
            )}
          >
            {fase === 'inicio' ? 'Bóveda inicializándose' : fase === 'cerrada' ? 'Verificando stock' : 'Abriendo bóveda'}
            <span className="h-px w-32 overflow-hidden bg-white/10">
              <span
                className="degradado-marca block h-full origin-left transition-transform ease-linear"
                style={{
                  transitionDuration: '2600ms',
                  transform: `scaleX(${fase === 'inicio' ? 0.05 : 1})`,
                }}
              />
            </span>
          </p>
        </div>
      )}
    </div>
  );
}
