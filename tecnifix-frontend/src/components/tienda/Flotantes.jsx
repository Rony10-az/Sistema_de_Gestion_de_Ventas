'use client';

// Elementos flotantes de la tienda (como en hodl.swiss):
// - Abajo a la izquierda, un chat con respuestas automáticas a las dudas más comunes.
// - Abajo a la derecha, un sello giratorio "Compra con respaldo" que lleva a esa sección.
// Si en la ficha de producto aparece la barra fija de compra, ambos suben (variable --barra-compra).

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { MessageCircle, SendHorizontal, ShieldCheck, X } from 'lucide-react';
import { cn } from '../../lib/utils';
import { PREGUNTAS } from '../../mocks/tienda.mock';

const MAX = 200;

// Se revisan en orden: primero los temas concretos y al final los generales ("hay", "tienen").
const RESPUESTAS = [
  { claves: ['boleta', 'factura', 'comprobante', 'ruc'], texto: PREGUNTAS[2].r },
  { claves: ['garant', 'falla', 'devol'], texto: PREGUNTAS[3].r },
  { claves: ['pago', 'pagar', 'yape', 'tarjeta', 'efectivo', 'reserv'], texto: PREGUNTAS[4].r },
  { claves: ['instal', 'ssd', 'ram', 'memoria', 'pantalla', 'bateria'], texto: PREGUNTAS[5].r },
  { claves: ['horario', 'hora', 'abren', 'abierto', 'atienden'], texto: 'Atendemos de lunes a sábado, de 9:00 a 19:00.' },
  { claves: ['precio', 'cuanto', 'cuesta', 'igv'], texto: 'Todos los precios del catálogo ya incluyen IGV. Lo que ves es lo que pagas.', enlace: { texto: 'Ver precios', href: '/catalogo' } },
  { claves: ['envio', 'delivery', 'lima'], texto: 'Hacemos envíos a todo Lima en 24 a 48 horas, o puedes recoger gratis en tienda el mismo día.' },
  { claves: ['compatib', 'modelo', 'sirve', 'cual'], texto: PREGUNTAS[0].r, enlace: { texto: 'Abrir el asistente', href: '/#asistente' } },
  { claves: ['stock', 'hay', 'tienen', 'disponible', 'queda'], texto: PREGUNTAS[1].r, enlace: { texto: 'Ver el catálogo', href: '/catalogo' } },
];

const SUGERENCIAS = ['¿El stock es real?', '¿Me dan factura?', '¿Qué garantía tienen?', '¿Cuál es el horario?'];

const normalizar = (t) => t.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

function responder(pregunta) {
  const q = normalizar(pregunta);
  return (
    RESPUESTAS.find((r) => r.claves.some((c) => q.includes(c))) ?? {
      texto: 'No tengo esa respuesta guardada. Prueba con el asistente de compra o pregúntanos en tienda.',
      enlace: { texto: 'Ver preguntas frecuentes', href: '/#preguntas' },
    }
  );
}

function Chat({ alCerrar }) {
  const [mensajes, setMensajes] = useState([
    { de: 'tienda', texto: 'Hola, soy el asistente de TecniFix. ¿En qué te ayudo? Elige una pregunta o escríbela.' },
  ]);
  const [texto, setTexto] = useState('');
  const [escribiendo, setEscribiendo] = useState(false);
  const lista = useRef(null);
  const campo = useRef(null);

  useEffect(() => {
    campo.current?.focus();
  }, []);
  useEffect(() => {
    lista.current?.scrollTo({ top: lista.current.scrollHeight, behavior: 'smooth' });
  }, [mensajes, escribiendo]);

  function enviar(pregunta) {
    const limpio = pregunta.trim();
    if (!limpio || limpio.length > MAX || escribiendo) return;
    setMensajes((m) => [...m, { de: 'cliente', texto: limpio }]);
    setTexto('');
    setEscribiendo(true);
    setTimeout(() => {
      setMensajes((m) => [...m, { de: 'tienda', ...responder(limpio) }]);
      setEscribiendo(false);
    }, 650);
  }

  return (
    <div
      role="dialog"
      aria-label="Chat de ayuda de TecniFix"
      className="vidrio absolute bottom-[calc(100%+0.75rem)] left-0 flex h-[30rem] max-h-[70vh] w-[22rem] max-w-[calc(100vw-2rem)] animate-in flex-col overflow-hidden rounded-3xl bg-[hsl(270_20%_5%/0.97)] fade-in slide-in-from-bottom-3 duration-300"
      onKeyDown={(e) => e.key === 'Escape' && alCerrar()}
    >
      <div className="degradado-marca flex items-center justify-between px-5 py-4">
        <div>
          <p className="font-display font-semibold text-white">TecniFix · Ayuda</p>
          <p className="flex items-center gap-1.5 text-xs text-white/80">
            <span className="size-1.5 animate-respirar rounded-full bg-white" aria-hidden="true" /> Respuestas automáticas
          </p>
        </div>
        <button type="button" onClick={alCerrar} className="rounded-full p-1.5 text-white/90 hover:bg-white/15" aria-label="Cerrar chat">
          <X className="size-4" aria-hidden="true" />
        </button>
      </div>

      <ol ref={lista} className="flex flex-1 flex-col gap-3 overflow-y-auto p-4" aria-live="polite">
        {mensajes.map((m, i) => (
          <li
            key={i}
            className={cn(
              'max-w-[85%] animate-in rounded-2xl px-4 py-2.5 text-sm leading-relaxed fade-in slide-in-from-bottom-1',
              m.de === 'cliente' ? 'self-end rounded-br-md bg-primary/25 text-white' : 'self-start rounded-bl-md bg-white/[0.06] text-white/90',
            )}
          >
            {m.texto}
            {m.enlace && (
              <Link href={m.enlace.href} onClick={alCerrar} className="mt-2 block font-semibold text-accent-foreground hover:underline">
                {m.enlace.texto} →
              </Link>
            )}
          </li>
        ))}
        {escribiendo && (
          <li className="flex gap-1 self-start rounded-2xl bg-white/[0.06] px-4 py-3" aria-label="Escribiendo">
            {[0, 1, 2].map((d) => (
              <span key={d} className="size-1.5 animate-respirar rounded-full bg-white/60" style={{ animationDelay: `${d * 150}ms` }} />
            ))}
          </li>
        )}
      </ol>

      <div className="sin-barra flex gap-2 overflow-x-auto px-4 pb-3">
        {SUGERENCIAS.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => enviar(s)}
            className="shrink-0 rounded-full border border-white/10 px-3 py-1.5 text-xs text-white/85 hover:border-primary/50 hover:text-white"
          >
            {s}
          </button>
        ))}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          enviar(texto);
        }}
        className="flex items-center gap-2 border-t border-white/[0.08] p-3"
      >
        <label htmlFor="chat-texto" className="sr-only">
          Escribe tu pregunta
        </label>
        <input
          id="chat-texto"
          ref={campo}
          value={texto}
          maxLength={MAX}
          onChange={(e) => setTexto(e.target.value)}
          placeholder="Escribe tu pregunta…"
          className="h-10 flex-1 rounded-full border border-white/10 bg-white/[0.03] px-4 text-sm text-white outline-none placeholder:text-muted-foreground focus:border-primary/60"
        />
        <button
          type="submit"
          disabled={!texto.trim() || escribiendo}
          className="degradado-marca grid size-10 shrink-0 place-items-center rounded-full text-white disabled:opacity-40"
          aria-label="Enviar pregunta"
        >
          <SendHorizontal className="size-4" aria-hidden="true" />
        </button>
      </form>
    </div>
  );
}

function Sello() {
  const texto = 'COMPRA CON RESPALDO · STOCK REAL · TECNIFIX · ';
  return (
    <Link
      href="/#respaldo"
      className="group relative grid size-[4.5rem] place-items-center rounded-full bg-black/70 shadow-[0_10px_30px_-8px_hsl(var(--brillo)/0.8)] backdrop-blur transition-transform hover:scale-110 sm:size-20"
      aria-label="Compra con respaldo: ver nuestros compromisos"
    >
      <svg viewBox="0 0 100 100" className="girar-lento absolute inset-0 size-full" style={{ animationDuration: '18s' }} aria-hidden="true">
        <defs>
          <path id="sello-circulo" d="M50,50 m-38,0 a38,38 0 1,1 76,0 a38,38 0 1,1 -76,0" />
          <linearGradient id="sello-borde" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#e879f9" />
            <stop offset="1" stopColor="#8e2bc4" />
          </linearGradient>
        </defs>
        <circle cx="50" cy="50" r="48" fill="none" stroke="url(#sello-borde)" strokeWidth="2" />
        <text fontFamily="ui-monospace, monospace" fontSize="8.6" fontWeight="700" letterSpacing="1.4" fill="#f5d0fe">
          <textPath href="#sello-circulo">{texto}</textPath>
        </text>
      </svg>
      <span className="degradado-marca grid size-9 place-items-center rounded-full shadow-brillo sm:size-10">
        <ShieldCheck className="size-5 text-white" aria-hidden="true" />
      </span>
    </Link>
  );
}

export function Flotantes() {
  const [abierto, setAbierto] = useState(false);

  return (
    <>
      <div className="fixed bottom-[calc(1.25rem+var(--barra-compra,0px))] left-4 z-40 transition-[bottom] duration-500 md:left-6">
        {abierto && <Chat alCerrar={() => setAbierto(false)} />}
        <button
          type="button"
          onClick={() => setAbierto((v) => !v)}
          aria-expanded={abierto}
          aria-label={abierto ? 'Cerrar chat de ayuda' : 'Abrir chat de ayuda'}
          className="degradado-marca relative grid size-14 place-items-center rounded-full text-white shadow-brillo-fuerte transition-transform hover:scale-105 active:scale-95 sm:size-16"
        >
          {!abierto && <span className="absolute inset-0 animate-ping rounded-full bg-primary/40 [animation-duration:2.6s]" aria-hidden="true" />}
          {abierto ? <X className="relative size-6" aria-hidden="true" /> : <MessageCircle className="relative size-6" aria-hidden="true" />}
        </button>
      </div>
      <div className="fixed bottom-[calc(1.25rem+var(--barra-compra,0px))] right-4 z-40 transition-[bottom] duration-500 md:right-6">
        <Sello />
      </div>
    </>
  );
}
