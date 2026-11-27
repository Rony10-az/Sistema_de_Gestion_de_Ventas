'use client';

// Carrito en panel lateral: cambia cantidades (sin pasar el stock), muestra el desglose
// con IGV y permite reservar el pedido para pagarlo y recogerlo en tienda.

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { ArrowRight, LoaderCircle, Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useCarrito } from '../../context/CarritoContext';
import { formatearSoles } from '../../lib/formato';
import { simular } from '../../lib/mock';
import { Sheet, SheetContent, SheetDescription, SheetTitle } from '../ui/sheet';

const IGV = 0.18;

export function Cantidad({ valor, maximo, alCambiar, nombre, tamano = 'sm' }) {
  const alto = tamano === 'sm' ? 'h-9' : 'h-12';
  return (
    <div className={`inline-flex ${alto} items-center rounded-full border border-white/10 bg-white/[0.03]`}>
      <button
        type="button"
        onClick={() => alCambiar(valor - 1)}
        className="grid h-full w-9 place-items-center rounded-l-full text-white/80 hover:text-white disabled:opacity-40"
        aria-label={`Quitar una unidad de ${nombre}`}
        disabled={valor <= 1 && tamano !== 'sm'}
      >
        <Minus className="size-3.5" aria-hidden="true" />
      </button>
      <span className="min-w-7 text-center font-mono text-sm text-white" aria-live="polite">
        {valor}
      </span>
      <button
        type="button"
        onClick={() => alCambiar(valor + 1)}
        className="grid h-full w-9 place-items-center rounded-r-full text-white/80 hover:text-white disabled:opacity-40"
        aria-label={`Agregar una unidad de ${nombre}`}
        disabled={valor >= maximo}
      >
        <Plus className="size-3.5" aria-hidden="true" />
      </button>
    </div>
  );
}

export function CarritoLateral() {
  const { items, total, unidades, abierto, setAbierto, cambiarCantidad, quitar, vaciar } = useCarrito();
  const [enviando, setEnviando] = useState(false);
  const gravada = total / (1 + IGV);

  async function reservar() {
    // Validación en el navegador: nada vacío ni por encima del stock (el backend vuelve a validar).
    const excedido = items.find((l) => l.cantidad > l.producto.stock);
    if (items.length === 0 || excedido) {
      toast.error(excedido ? `No hay stock suficiente de ${excedido.producto.nombre}` : 'Tu carrito está vacío');
      return;
    }
    setEnviando(true);
    await simular(null, 700);
    setEnviando(false);
    vaciar();
    setAbierto(false);
    toast.success('Pedido reservado', {
      description: 'Te esperamos en tienda para pagar y recibir tu boleta o factura electrónica.',
    });
  }

  return (
    <Sheet open={abierto} onOpenChange={setAbierto}>
      <SheetContent side="right" className="flex w-[26rem] max-w-[92vw] flex-col gap-0 border-white/10 bg-[hsl(270_20%_4%)] p-0 sm:max-w-[26rem]">
        <div className="border-b border-white/[0.08] px-6 py-6">
          <SheetTitle className="font-display text-sm font-semibold uppercase tracking-[0.22em] text-white">Tu carrito</SheetTitle>
          <SheetDescription className="mt-1 text-xs text-muted-foreground">
            {unidades > 0 ? `${unidades} ${unidades === 1 ? 'producto' : 'productos'} · se pagan al recoger` : 'Reserva ahora y paga al recoger.'}
          </SheetDescription>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-5 px-6 text-center">
            <span className="grid size-16 place-items-center rounded-2xl border border-primary/30 bg-primary/10">
              <ShoppingBag className="size-7 text-accent-foreground" aria-hidden="true" />
            </span>
            <p className="font-display text-xl text-white">Tu carrito está vacío</p>
            <Link
              href="/catalogo"
              onClick={() => setAbierto(false)}
              className="inline-flex h-11 items-center gap-2 rounded-full border border-white/15 px-6 font-display text-xs font-semibold uppercase tracking-[0.12em] text-white hover:border-primary/60"
            >
              Ir al catálogo <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </div>
        ) : (
          <>
            <ul className="flex-1 divide-y divide-white/[0.06] overflow-y-auto px-6">
              {items.map(({ producto, cantidad }) => (
                <li key={producto.id} className="flex gap-4 py-5 animate-in fade-in slide-in-from-right-4 duration-300">
                  <Link
                    href={`/catalogo/${producto.slug}`}
                    onClick={() => setAbierto(false)}
                    className="relative size-20 shrink-0 overflow-hidden rounded-2xl bg-black"
                  >
                    <Image src={producto.imagenes[0]} alt="" fill sizes="80px" className="object-cover" />
                  </Link>
                  <div className="flex min-w-0 flex-1 flex-col gap-2">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium leading-snug text-white">{producto.nombre}</p>
                      <button
                        type="button"
                        onClick={() => quitar(producto.id)}
                        className="shrink-0 rounded-full p-1 text-muted-foreground hover:text-destructive"
                        aria-label={`Quitar ${producto.nombre} del carrito`}
                      >
                        <Trash2 className="size-4" aria-hidden="true" />
                      </button>
                    </div>
                    <div className="mt-auto flex items-center justify-between">
                      <Cantidad
                        valor={cantidad}
                        maximo={producto.stock}
                        nombre={producto.nombre}
                        alCambiar={(n) => cambiarCantidad(producto.id, n)}
                      />
                      <span className="font-display font-semibold text-white">{formatearSoles(producto.precio_venta * cantidad)}</span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <div className="border-t border-white/[0.08] bg-black/40 px-6 py-5">
              <dl className="flex flex-col gap-1.5 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <dt>Operación gravada</dt>
                  <dd>{formatearSoles(gravada)}</dd>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <dt>IGV (18 %)</dt>
                  <dd>{formatearSoles(total - gravada)}</dd>
                </div>
                <div className="mt-2 flex justify-between border-t border-white/[0.08] pt-3 font-display text-lg font-semibold text-white">
                  <dt>Total</dt>
                  <dd>{formatearSoles(total)}</dd>
                </div>
              </dl>
              <button
                type="button"
                onClick={reservar}
                disabled={enviando}
                className="degradado-marca mt-5 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full font-display text-sm font-semibold uppercase tracking-[0.1em] text-white shadow-brillo transition-all hover:-translate-y-px hover:shadow-brillo-fuerte disabled:opacity-70"
              >
                {enviando && <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />}
                {enviando ? 'Reservando…' : 'Reservar pedido'}
              </button>
              <p className="mt-3 text-center text-xs text-muted-foreground">Pagas en tienda con efectivo, Yape o tarjeta.</p>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
