// Página para rutas que no existen o secciones que aún no tienen página.

import Link from 'next/link';
import { Button } from '../components/ui/button';

export const metadata = { title: 'Página no encontrada' };

export default function NotFound() {
  return (
    <div className="grid min-h-screen place-items-center p-6">
      <div className="flex max-w-md animate-aparecer flex-col items-center gap-4 text-center">
        <p className="texto-marca font-display text-7xl font-bold">404</p>
        <h1 className="text-2xl font-semibold tracking-tight text-white">Esta página no existe o todavía está en construcción</h1>
        <p className="text-sm text-muted-foreground">Puede que la sección aún no esté lista. Vuelve a la tienda o al panel.</p>
        <div className="flex flex-wrap justify-center gap-2">
          <Button asChild>
            <Link href="/">Ir a la tienda</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/dashboard">Ir al panel</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
