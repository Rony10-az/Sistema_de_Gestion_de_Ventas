'use client';

// Buscador de la tienda (se abre con la lupa de la cabecera). Filtra mientras se escribe
// por nombre, marca o categoría y lleva a la ficha del producto.

import Image from 'next/image';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { ArrowRight, Search } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '../ui/dialog';
import { formatearSoles } from '../../lib/formato';
import { CATEGORIAS, PRODUCTOS, categoriaPorId } from '../../mocks/tienda.mock';

const normalizar = (texto) => texto.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

export function BuscadorTienda({ abierto, alCambiar }) {
  const [texto, setTexto] = useState('');

  const resultados = useMemo(() => {
    const q = normalizar(texto.trim());
    if (!q) return PRODUCTOS.filter((x) => x.etiqueta).slice(0, 5);
    return PRODUCTOS.filter((x) =>
      normalizar(`${x.nombre} ${x.marca} ${categoriaPorId(x.categoria_id)?.nombre}`).includes(q),
    ).slice(0, 7);
  }, [texto]);

  const cerrar = () => {
    alCambiar(false);
    setTexto('');
  };

  return (
    <Dialog open={abierto} onOpenChange={(v) => (v ? alCambiar(true) : cerrar())}>
      <DialogContent className="top-[12%] max-w-2xl translate-y-0 gap-0 overflow-hidden rounded-3xl border-white/10 bg-[hsl(270_20%_5%/0.97)] p-0 data-[state=open]:slide-in-from-top-4">
        <DialogTitle className="sr-only">Buscar productos</DialogTitle>
        <DialogDescription className="sr-only">Escribe el nombre, la marca o la categoría del producto.</DialogDescription>
        <div className="flex items-center gap-3 border-b border-white/[0.08] px-5">
          <Search className="size-5 text-accent-foreground" aria-hidden="true" />
          <input
            autoFocus
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            placeholder="Busca un cargador, un SSD, una pantalla…"
            aria-label="Buscar productos"
            maxLength={60}
            className="h-16 flex-1 bg-transparent text-base text-white outline-none placeholder:text-muted-foreground"
          />
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-3">
          <p className="etiqueta px-3 pb-2 pt-2 text-[0.62rem]">{texto.trim() ? `${resultados.length} resultados` : 'Destacados'}</p>
          {resultados.length === 0 ? (
            <div className="px-3 py-8 text-center">
              <p className="font-display text-lg text-white">No encontramos &quot;{texto.trim()}&quot;</p>
              <p className="mt-1 text-sm text-muted-foreground">Prueba con una categoría:</p>
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                {CATEGORIAS.map((c) => (
                  <Link
                    key={c.id}
                    href={`/catalogo?categoria=${c.slug}`}
                    onClick={cerrar}
                    className="rounded-full border border-white/10 px-3 py-1.5 text-sm text-white/85 hover:border-primary/50 hover:text-white"
                  >
                    {c.nombre}
                  </Link>
                ))}
              </div>
            </div>
          ) : (
            <ul className="flex flex-col">
              {resultados.map((x) => (
                <li key={x.id}>
                  <Link
                    href={`/catalogo/${x.slug}`}
                    onClick={cerrar}
                    className="group flex items-center gap-4 rounded-2xl p-3 transition-colors hover:bg-white/[0.05] focus-visible:bg-white/[0.05] focus-visible:outline-none"
                  >
                    <span className="relative size-14 shrink-0 overflow-hidden rounded-xl bg-black">
                      <Image src={x.imagenes[0]} alt="" fill sizes="56px" className="object-cover" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-medium text-white">{x.nombre}</span>
                      <span className="block font-mono text-[0.66rem] uppercase tracking-[0.12em] text-muted-foreground">
                        {x.marca} · {categoriaPorId(x.categoria_id)?.nombre}
                      </span>
                    </span>
                    <span className="font-display font-semibold text-white">{formatearSoles(x.precio_venta)}</span>
                    <ArrowRight className="size-4 text-accent-foreground opacity-0 transition-all group-hover:translate-x-1 group-hover:opacity-100" aria-hidden="true" />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
        <Link
          href={`/catalogo${texto.trim() ? `?q=${encodeURIComponent(texto.trim())}` : ''}`}
          onClick={cerrar}
          className="flex items-center justify-between border-t border-white/[0.08] px-6 py-4 text-sm font-semibold text-white hover:bg-white/[0.03]"
        >
          Ver todo el catálogo <ArrowRight className="size-4 text-accent-foreground" aria-hidden="true" />
        </Link>
      </DialogContent>
    </Dialog>
  );
}
