'use client';

// Cabecera de la tienda: barra de aviso, logo, navegación en píldora con mega menú,
// buscador, acceso del personal y carrito. Debajo lleva una barra que marca cuánto
// se ha avanzado en la página. En celulares el menú se abre en un panel lateral.

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { ArrowRight, ChevronDown, LayoutDashboard, LogIn, Menu, Search, ShoppingBag, User, Wrench } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useCarrito } from '../../context/CarritoContext';
import { formatearSoles } from '../../lib/formato';
import { cn } from '../../lib/utils';
import { productoPorSlug } from '../../mocks/tienda.mock';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Sheet, SheetContent, SheetDescription, SheetTitle } from '../ui/sheet';
import { BuscadorTienda } from './BuscadorTienda';
import { ChipEtiqueta } from './TarjetaProducto';

const cat = (slug) => `/catalogo?categoria=${slug}`;

export const MENU = [
  {
    id: 'energia',
    titulo: 'Cargadores y cables',
    eyebrow: 'Energía y conexión',
    descripcion: 'Cargadores GaN, cables que no se pelan y baterías externas para no quedarte sin carga.',
    enlace: { texto: 'Ver cargadores y cables', href: cat('cargadores-y-cables') },
    enlaces: [
      { texto: 'Todos los cargadores y cables', href: cat('cargadores-y-cables') },
      { texto: 'Cargador GaN 65 W', href: '/catalogo/cargador-gan-65w' },
      { texto: 'Cable USB-C trenzado', href: '/catalogo/cable-usb-c-trenzado-2m' },
      { texto: 'Batería externa 20 000 mAh', href: '/catalogo/bateria-externa-20000' },
      { texto: 'Cable HDMI 2.1', href: '/catalogo/cable-hdmi-2-1-2m' },
    ],
    destacado: 'cargador-gan-65w',
  },
  {
    id: 'perifericos',
    titulo: 'Audio y periféricos',
    eyebrow: 'Para trabajar y jugar',
    descripcion: 'Audífonos, mouse, teclados, cámaras y adaptadores probados en nuestro mostrador.',
    enlace: { texto: 'Ver periféricos', href: cat('perifericos') },
    enlaces: [
      { texto: 'Audio', href: cat('audio') },
      { texto: 'Periféricos', href: cat('perifericos') },
      { texto: 'Teclado mecánico RGB', href: '/catalogo/teclado-mecanico-rgb' },
      { texto: 'Mouse gamer ultraligero', href: '/catalogo/mouse-gamer-ultraligero' },
      { texto: 'Cámara web Full HD', href: '/catalogo/camara-web-full-hd' },
      { texto: 'Hub USB de 7 puertos', href: '/catalogo/hub-usb-7-puertos' },
    ],
    destacado: 'audifonos-bluetooth-anc',
  },
  {
    id: 'componentes',
    titulo: 'Componentes',
    eyebrow: 'Mejora y repara',
    descripcion: 'SSD, memorias RAM, pantallas y baterías. Te ayudamos a ver si son compatibles con tu equipo.',
    enlace: { texto: 'Ver repuestos', href: cat('repuestos') },
    enlaces: [
      { texto: 'Almacenamiento y memoria', href: cat('almacenamiento') },
      { texto: 'Repuestos', href: cat('repuestos') },
      { texto: 'Herramientas', href: cat('herramientas') },
      { texto: 'SSD NVMe de 1 TB', href: '/catalogo/ssd-nvme-1tb' },
      { texto: 'Memoria RAM DDR4 16 GB', href: '/catalogo/memoria-ram-ddr4-16gb' },
    ],
    destacado: 'ssd-nvme-1tb',
  },
  {
    id: 'ayuda',
    titulo: 'Ayuda',
    eyebrow: 'Te acompañamos',
    descripcion: '¿No sabes qué repuesto necesitas? Responde tres preguntas o revisa las dudas más comunes.',
    enlace: { texto: 'Abrir el asistente', href: '/#asistente' },
    enlaces: [
      { texto: 'Asistente de compra', href: '/#asistente' },
      { texto: 'Compra con respaldo', href: '/#respaldo' },
      { texto: 'Preguntas frecuentes', href: '/#preguntas' },
      { texto: 'Opiniones de clientes', href: '/#opiniones' },
    ],
  },
];

export function Logo({ className }) {
  return (
    <Link href="/" className={cn('flex shrink-0 items-center gap-2.5', className)} aria-label="TecniFix, inicio">
      <span className="degradado-marca grid size-10 place-items-center rounded-xl shadow-brillo">
        <Wrench className="size-5 text-white" aria-hidden="true" />
      </span>
      <span className="font-display text-xl font-semibold tracking-tight text-white">
        Tecni<span className="texto-marca">Fix</span>
      </span>
    </Link>
  );
}

function BarraAviso() {
  return (
    <div className="border-b border-white/[0.06] bg-black/60 text-xs text-muted-foreground">
      <div className="mx-auto flex h-9 max-w-[1400px] items-center justify-between gap-4 px-4 md:px-8">
        <p className="flex items-center gap-2 truncate">
          <span className="size-1.5 animate-respirar rounded-full bg-primary" aria-hidden="true" />
          Recojo gratis en tienda · Boleta o factura electrónica en cada compra
        </p>
        <p className="hidden shrink-0 font-mono uppercase tracking-[0.14em] sm:block">Lun a sáb · 9:00 a 19:00</p>
      </div>
    </div>
  );
}

function PanelMega({ seccion, alCerrar }) {
  const destacado = seccion.destacado ? productoPorSlug(seccion.destacado) : null;
  const numero = String(MENU.indexOf(seccion) + 1).padStart(2, '0');

  return (
    <div className="absolute inset-x-0 top-full hidden px-4 pt-3 md:px-8 lg:block">
      <div className="vidrio puntos mx-auto grid max-w-[1400px] animate-in fade-in slide-in-from-top-2 grid-cols-[1fr_1.2fr_0.9fr] overflow-hidden rounded-3xl bg-[hsl(270_20%_5%)] shadow-[0_40px_80px_-30px_rgb(0_0_0/0.9)] duration-300">
        <div className="flex flex-col gap-4 border-r border-white/[0.06] p-8">
          <p className="etiqueta text-[0.66rem]">
            <span className="text-accent-foreground">{numero}</span> &nbsp;{seccion.eyebrow}
          </p>
          <p className="font-display text-3xl font-semibold text-white">{seccion.titulo}</p>
          <p className="max-w-[40ch] text-sm leading-relaxed text-muted-foreground">{seccion.descripcion}</p>
          <Link
            href={seccion.enlace.href}
            onClick={alCerrar}
            className="group mt-2 inline-flex w-fit items-center gap-2 border-b border-primary/60 pb-1 text-sm font-semibold text-white"
          >
            {seccion.enlace.texto}
            <ArrowRight className="size-4 text-accent-foreground transition-transform group-hover:translate-x-1" aria-hidden="true" />
          </Link>
        </div>

        <ul className={cn('grid content-start gap-x-6 gap-y-1 p-8', seccion.enlaces.length > 4 && 'grid-cols-2')}>
          {seccion.enlaces.map((e, i) => (
            <li key={e.href} className="animate-aparecer" style={{ animationDelay: `${i * 45}ms` }}>
              <Link
                href={e.href}
                onClick={alCerrar}
                className="group flex items-baseline gap-3 rounded-xl px-3 py-3 text-[0.95rem] text-white/90 transition-colors hover:bg-white/[0.04] hover:text-white"
              >
                <span className="font-mono text-[0.68rem] text-accent-foreground/80">{String(i + 1).padStart(2, '0')}</span>
                <span className="transition-transform group-hover:translate-x-1">{e.texto}</span>
              </Link>
            </li>
          ))}
        </ul>

        {destacado ? (
          <Link
            href={`/catalogo/${destacado.slug}`}
            onClick={alCerrar}
            className="group m-4 flex flex-col overflow-hidden rounded-2xl border border-white/[0.08] bg-black/50 transition-colors hover:border-primary/50"
          >
            <span className="relative block aspect-[16/10] overflow-hidden">
              <Image
                src={destacado.imagenes[0]}
                alt=""
                fill
                sizes="22rem"
                className="object-cover transition-transform duration-700 group-hover:scale-110"
              />
            </span>
            <span className="flex flex-col gap-1.5 p-5">
              {destacado.etiqueta && <ChipEtiqueta className="w-fit">{destacado.etiqueta}</ChipEtiqueta>}
              <span className="font-display text-lg font-semibold text-white">{destacado.nombre}</span>
              <span className="text-sm text-muted-foreground">{formatearSoles(destacado.precio_venta)}</span>
            </span>
          </Link>
        ) : (
          <div className="m-4 flex flex-col justify-end gap-3 rounded-2xl border border-white/[0.08] bg-[radial-gradient(80%_60%_at_80%_0%,hsl(var(--primary)/0.25),transparent)] p-6">
            <p className="etiqueta text-[0.62rem]">Respuesta en menos de 1 minuto</p>
            <p className="font-display text-xl font-semibold text-white">Tres preguntas y te decimos qué llevar.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function MenuCuenta() {
  const { usuario } = useAuth();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="grid size-11 place-items-center rounded-full text-white/90 transition-colors hover:bg-white/[0.06] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="Cuenta"
        >
          <User className="size-5" aria-hidden="true" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64 rounded-2xl p-2">
        <DropdownMenuLabel className="font-normal">
          <span className="etiqueta text-[0.6rem]">Personal de la tienda</span>
          <span className="mt-1 block text-sm text-muted-foreground">
            {usuario ? `Sesión iniciada como ${usuario.nombre}` : 'Ventas, inventario y reportes.'}
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {usuario ? (
          <DropdownMenuItem asChild className="gap-2 rounded-xl py-2.5">
            <Link href="/dashboard">
              <LayoutDashboard className="size-4" aria-hidden="true" /> Ir al panel
            </Link>
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem asChild className="gap-2 rounded-xl py-2.5">
            <Link href="/login">
              <LogIn className="size-4" aria-hidden="true" /> Acceso del personal
            </Link>
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function Cabecera() {
  const { unidades, setAbierto: abrirCarrito } = useCarrito();
  const pathname = usePathname();
  const [abierta, setAbierta] = useState(null);
  const [compacta, setCompacta] = useState(false);
  const [buscador, setBuscador] = useState(false);
  const [movil, setMovil] = useState(false);
  const barra = useRef(null);
  const cierre = useRef(null);

  // Barra de progreso de lectura y cabecera compacta al bajar.
  useEffect(() => {
    let cuadro = 0;
    const actualizar = () => {
      cuadro = 0;
      const total = document.documentElement.scrollHeight - window.innerHeight;
      const avance = total > 0 ? window.scrollY / total : 0;
      if (barra.current) barra.current.style.transform = `scaleX(${avance})`;
      setCompacta(window.scrollY > 24);
    };
    const alDesplazar = (e) => {
      if (e?.type === 'scroll') setAbierta(null); // el mega menú se cierra al desplazarse
      if (!cuadro) cuadro = requestAnimationFrame(actualizar);
    };
    actualizar();
    window.addEventListener('scroll', alDesplazar, { passive: true });
    window.addEventListener('resize', alDesplazar);
    return () => {
      window.removeEventListener('scroll', alDesplazar);
      window.removeEventListener('resize', alDesplazar);
      cancelAnimationFrame(cuadro);
    };
  }, []);

  useEffect(() => {
    setAbierta(null);
    setMovil(false);
  }, [pathname]);

  useEffect(() => {
    if (!abierta) return undefined;
    const alTeclear = (e) => e.key === 'Escape' && setAbierta(null);
    window.addEventListener('keydown', alTeclear);
    return () => window.removeEventListener('keydown', alTeclear);
  }, [abierta]);

  const abrirCon = (id) => {
    clearTimeout(cierre.current);
    setAbierta(id);
  };
  const cerrarLuego = () => {
    clearTimeout(cierre.current);
    cierre.current = setTimeout(() => setAbierta(null), 160);
  };

  const seccion = MENU.find((m) => m.id === abierta);

  return (
    <>
      <BarraAviso />
      <header
        className={cn(
          'sticky top-0 z-40 border-b transition-colors duration-300',
          compacta || abierta ? 'border-white/[0.06] bg-background/75 backdrop-blur-xl' : 'border-transparent bg-transparent',
        )}
        onPointerLeave={cerrarLuego}
        onPointerEnter={() => clearTimeout(cierre.current)}
      >
        <div
          className={cn(
            'mx-auto flex max-w-[1400px] items-center gap-4 px-4 transition-[height] duration-300 md:px-8',
            compacta ? 'h-16' : 'h-20',
          )}
        >
          <Logo />

          <nav aria-label="Categorías" className="mx-auto hidden lg:block">
            <ul className="flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.03] p-1.5">
              {MENU.map((m) => (
                <li key={m.id}>
                  <button
                    type="button"
                    aria-expanded={abierta === m.id}
                    onPointerEnter={(e) => e.pointerType === 'mouse' && abrirCon(m.id)}
                    onClick={() => setAbierta((a) => (a === m.id ? null : m.id))}
                    className={cn(
                      'flex items-center gap-1.5 rounded-full border px-4 py-2 font-display text-[0.8rem] font-semibold uppercase tracking-[0.08em] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                      abierta === m.id
                        ? 'border-primary/60 bg-primary/15 text-white'
                        : 'border-transparent text-white/80 hover:text-white',
                    )}
                  >
                    {m.titulo}
                    <ChevronDown
                      className={cn('size-3.5 transition-transform duration-300', abierta === m.id && 'rotate-180')}
                      aria-hidden="true"
                    />
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          <div className="ml-auto flex items-center gap-1 lg:ml-0">
            <button
              type="button"
              onClick={() => setBuscador(true)}
              className="grid size-11 place-items-center rounded-full border border-white/10 text-white/90 transition-colors hover:border-primary/50 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label="Buscar productos"
            >
              <Search className="size-[1.1rem]" aria-hidden="true" />
            </button>
            <Link
              href="/#asistente"
              className="degradado-marca ml-2 hidden h-11 items-center gap-2 rounded-full px-5 font-display text-[0.8rem] font-semibold uppercase tracking-[0.08em] text-white shadow-brillo transition-all hover:-translate-y-px hover:shadow-brillo-fuerte xl:inline-flex"
            >
              Encontrar mi repuesto <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
            <MenuCuenta />
            <button
              type="button"
              onClick={() => abrirCarrito(true)}
              className="relative grid size-11 place-items-center rounded-full text-white/90 transition-colors hover:bg-white/[0.06] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label={`Abrir carrito, ${unidades} productos`}
            >
              <ShoppingBag className="size-5" aria-hidden="true" />
              {unidades > 0 && (
                <span className="degradado-marca absolute right-0.5 top-0.5 grid min-w-5 animate-in zoom-in place-items-center rounded-full px-1 font-mono text-[0.65rem] font-bold text-white">
                  {unidades}
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={() => setMovil(true)}
              className="grid size-11 place-items-center rounded-full text-white lg:hidden"
              aria-label="Abrir menú"
            >
              <Menu className="size-5" aria-hidden="true" />
            </button>
          </div>
        </div>

        <div className="absolute inset-x-0 bottom-0 h-px overflow-hidden" aria-hidden="true">
          <div ref={barra} className="degradado-marca h-full origin-left" style={{ transform: 'scaleX(0)' }} />
        </div>

        {seccion && <PanelMega key={seccion.id} seccion={seccion} alCerrar={() => setAbierta(null)} />}
      </header>

      <BuscadorTienda abierto={buscador} alCambiar={setBuscador} />

      <Sheet open={movil} onOpenChange={setMovil}>
        <SheetContent side="right" className="w-[22rem] max-w-[90vw] overflow-y-auto border-white/10 bg-background p-6">
          <SheetTitle className="sr-only">Menú</SheetTitle>
          <SheetDescription className="sr-only">Categorías y ayuda de la tienda</SheetDescription>
          <Logo />
          <nav aria-label="Categorías" className="mt-8 flex flex-col gap-6">
            {MENU.map((m, i) => (
              <div key={m.id}>
                <p className="etiqueta text-[0.62rem]">
                  <span className="text-accent-foreground">{String(i + 1).padStart(2, '0')}</span> &nbsp;{m.titulo}
                </p>
                <ul className="mt-2 flex flex-col">
                  {m.enlaces.map((e) => (
                    <li key={e.href}>
                      <Link
                        href={e.href}
                        onClick={() => setMovil(false)}
                        className="block rounded-lg px-2 py-2 text-[0.95rem] text-white/85 hover:bg-white/[0.04] hover:text-white"
                      >
                        {e.texto}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            <Link
              href="/#asistente"
              onClick={() => setMovil(false)}
              className="degradado-marca inline-flex h-12 items-center justify-center gap-2 rounded-full font-display text-sm font-semibold uppercase tracking-[0.08em] text-white shadow-brillo"
            >
              Encontrar mi repuesto <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </nav>
        </SheetContent>
      </Sheet>
    </>
  );
}
