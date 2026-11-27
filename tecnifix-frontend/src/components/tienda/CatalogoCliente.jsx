'use client';

// Catálogo con filtros: categoría (chips), búsqueda, "solo con stock" y orden.
// Los filtros se reflejan en la URL (?categoria=…&q=…) para poder compartir el enlace.

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, BadgeCheck, PackageSearch, Search, Store, Truck, X } from 'lucide-react';
import { cn } from '../../lib/utils';
import { CATEGORIAS, PRODUCTOS, categoriaPorId, categoriaPorSlug } from '../../mocks/tienda.mock';
import { Revelar } from './Revelar';
import { TarjetaProducto } from './TarjetaProducto';

const ORDENES = [
  { valor: 'destacados', texto: 'Destacados' },
  { valor: 'precio-asc', texto: 'Precio: menor a mayor' },
  { valor: 'precio-desc', texto: 'Precio: mayor a menor' },
  { valor: 'calificacion', texto: 'Mejor calificados' },
];

const valida = (slug) => (categoriaPorSlug(slug) ? slug : '');
const normalizar = (texto) => texto.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

export function CatalogoCliente({ categoriaInicial = '', busquedaInicial = '' }) {
  const pathname = usePathname();
  const [categoria, setCategoria] = useState(valida(categoriaInicial));
  const [busqueda, setBusqueda] = useState(busquedaInicial.slice(0, 60));
  const [soloStock, setSoloStock] = useState(false);
  const [orden, setOrden] = useState('destacados');

  // Si se llega desde el menú con otra categoría (o búsqueda) estando ya en el catálogo.
  useEffect(() => setCategoria(valida(categoriaInicial)), [categoriaInicial]);
  useEffect(() => setBusqueda(busquedaInicial.slice(0, 60)), [busquedaInicial]);

  // Cambia la URL sin recargar la página (así el campo de búsqueda no pierde el foco).
  const actualizarUrl = (cat, q) => {
    const params = new URLSearchParams();
    if (cat) params.set('categoria', cat);
    if (q.trim()) params.set('q', q.trim());
    const texto = params.toString();
    window.history.replaceState(null, '', texto ? `${pathname}?${texto}` : pathname);
  };

  const elegirCategoria = (slug) => {
    setCategoria(slug);
    actualizarUrl(slug, busqueda);
  };

  const lista = useMemo(() => {
    const cat = categoriaPorSlug(categoria);
    const q = normalizar(busqueda.trim());
    const filtrada = PRODUCTOS.filter(
      (x) =>
        (!cat || x.categoria_id === cat.id) &&
        (!soloStock || x.stock > 0) &&
        (!q || normalizar(`${x.nombre} ${x.marca} ${categoriaPorId(x.categoria_id)?.nombre}`).includes(q)),
    );
    const ordenar = {
      destacados: (a, b) => (b.stock > 0) - (a.stock > 0) || Boolean(b.etiqueta) - Boolean(a.etiqueta) || b.resenas - a.resenas,
      'precio-asc': (a, b) => a.precio_venta - b.precio_venta,
      'precio-desc': (a, b) => b.precio_venta - a.precio_venta,
      calificacion: (a, b) => b.calificacion - a.calificacion,
    }[orden];
    return [...filtrada].sort(ordenar);
  }, [categoria, busqueda, soloStock, orden]);

  const actual = categoriaPorSlug(categoria);

  return (
    <>
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute right-[-10%] top-[-30%] -z-10 h-[40rem] w-[50rem] rounded-full bg-primary/15 blur-[120px]" aria-hidden="true" />
        <div className="mx-auto max-w-[1400px] px-4 pb-10 pt-12 md:px-8 lg:pt-16">
          <nav aria-label="Ruta" className="etiqueta animate-aparecer text-[0.62rem]">
            <Link href="/" className="hover:text-white">Inicio</Link> / <span className="text-white/80">Catálogo</span>
            {actual && <> / <span className="text-accent-foreground">{actual.nombre}</span></>}
          </nav>

          <div className="mt-8 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="flex flex-col gap-5">
              <p className="etiqueta inline-flex w-fit animate-aparecer items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-[0.62rem]">
                <span className="size-1.5 animate-respirar rounded-full bg-primary" aria-hidden="true" /> Tienda · TecniFix
              </p>
              <h1 key={categoria} className="animate-aparecer font-display text-[clamp(2.4rem,5.5vw,4.6rem)] font-semibold leading-[1.02] tracking-tight text-white">
                {actual ? (
                  <>
                    {actual.nombre.split(' ').slice(0, -1).join(' ')}{' '}
                    <span className="texto-marca">{actual.nombre.split(' ').at(-1)}</span>
                  </>
                ) : (
                  <>
                    Catálogo de <span className="texto-marca">repuestos</span>
                  </>
                )}
              </h1>
              <p className="max-w-[58ch] animate-aparecer text-lg text-muted-foreground" style={{ animationDelay: '120ms' }}>
                {actual
                  ? actual.resumen
                  : 'Productos originales y sellados, con el stock que hay hoy en tienda. ¿No sabes cuál te sirve? Usa el asistente.'}
              </p>
            </div>
            <div className="flex animate-aparecer flex-col items-start gap-4 lg:items-end" style={{ animationDelay: '200ms' }}>
              <p className="flex items-baseline gap-2">
                <span className="texto-marca font-display text-6xl font-bold leading-none">{lista.length}</span>
                <span className="etiqueta text-[0.62rem]">productos</span>
              </p>
              <Link
                href="/#asistente"
                className="inline-flex h-11 items-center gap-2 rounded-full border border-white/15 px-5 font-display text-xs font-semibold uppercase tracking-[0.1em] text-white hover:border-primary/60"
              >
                ¿Cuál me sirve? <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </div>
          </div>

          <ul className="mt-8 flex animate-aparecer flex-wrap gap-2" style={{ animationDelay: '260ms' }}>
            {[
              { icono: BadgeCheck, texto: 'Originales y sellados' },
              { icono: Store, texto: 'Recojo el mismo día' },
              { icono: Truck, texto: 'Envíos a todo Lima' },
            ].map(({ icono: Icono, texto }) => (
              <li key={texto} className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-white/85">
                <Icono className="size-4 text-accent-foreground" aria-hidden="true" /> {texto}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mx-auto max-w-[1400px] px-4 md:px-8" aria-label="Productos">
        <div className="sticky top-16 z-20 -mx-4 border-y border-white/[0.06] bg-background/80 px-4 py-4 backdrop-blur-xl md:-mx-8 md:px-8">
          <div className="flex flex-col gap-3 2xl:flex-row 2xl:items-center 2xl:justify-between">
            <div className="sin-barra -mx-1 flex items-center gap-2 overflow-x-auto px-1">
              <span className="etiqueta shrink-0 pr-2 text-[0.6rem]">Categoría</span>
              {[{ slug: '', nombre: 'Todos' }, ...CATEGORIAS].map((c) => (
                <button
                  key={c.slug || 'todos'}
                  type="button"
                  aria-pressed={categoria === c.slug}
                  onClick={() => elegirCategoria(c.slug)}
                  className={cn(
                    'shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition-all',
                    categoria === c.slug
                      ? 'degradado-marca border-transparent text-white shadow-brillo'
                      : 'border-white/10 bg-white/[0.03] text-white/80 hover:border-white/25 hover:text-white',
                  )}
                >
                  {c.nombre}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <label className="relative">
                <span className="sr-only">Buscar en el catálogo</span>
                <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                <input
                  value={busqueda}
                  maxLength={60}
                  onChange={(e) => {
                    setBusqueda(e.target.value);
                    actualizarUrl(categoria, e.target.value);
                  }}
                  placeholder="Buscar…"
                  className="h-10 w-52 rounded-full border border-white/10 bg-white/[0.03] pl-10 pr-9 text-sm text-white outline-none placeholder:text-muted-foreground focus:border-primary/60"
                />
                {busqueda && (
                  <button
                    type="button"
                    onClick={() => {
                      setBusqueda('');
                      actualizarUrl(categoria, '');
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white"
                    aria-label="Borrar búsqueda"
                  >
                    <X className="size-4" aria-hidden="true" />
                  </button>
                )}
              </label>
              <label className="inline-flex cursor-pointer items-center gap-2.5 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-white/85">
                <input
                  type="checkbox"
                  checked={soloStock}
                  onChange={(e) => setSoloStock(e.target.checked)}
                  className="size-4 accent-[hsl(296_73%_50%)]"
                />
                Solo con stock
              </label>
              <label className="inline-flex items-center gap-2">
                <span className="etiqueta text-[0.6rem]">Ordenar</span>
                <select
                  value={orden}
                  onChange={(e) => setOrden(e.target.value)}
                  className="h-10 rounded-full border border-white/10 bg-[hsl(270_16%_7%)] px-4 text-sm text-white outline-none focus:border-primary/60"
                >
                  {ORDENES.map((o) => (
                    <option key={o.valor} value={o.valor}>
                      {o.texto}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>
        </div>

        {lista.length === 0 ? (
          <div className="my-20 flex animate-aparecer flex-col items-center gap-4 rounded-3xl border border-dashed border-white/10 bg-white/[0.02] px-6 py-16 text-center">
            <span className="grid size-16 place-items-center rounded-2xl border border-primary/30 bg-primary/10">
              <PackageSearch className="size-7 text-accent-foreground" aria-hidden="true" />
            </span>
            <p className="font-display text-2xl text-white">No hay productos con esos filtros</p>
            <p className="max-w-[44ch] text-muted-foreground">Prueba con otra categoría o quita el filtro de stock. También puedes preguntarle al asistente.</p>
            <button
              type="button"
              onClick={() => {
                setBusqueda('');
                setSoloStock(false);
                elegirCategoria('');
              }}
              className="mt-2 inline-flex h-11 items-center rounded-full border border-white/15 px-6 font-display text-xs font-semibold uppercase tracking-[0.1em] text-white hover:border-primary/60"
            >
              Ver todo el catálogo
            </button>
          </div>
        ) : (
          <ul className="grid gap-5 py-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {lista.map((x, i) => (
              <Revelar as="li" key={`${categoria}-${x.id}`} retraso={i % 4}>
                <TarjetaProducto producto={x} prioridad={i < 4} />
              </Revelar>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
