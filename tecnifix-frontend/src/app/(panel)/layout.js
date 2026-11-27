'use client';

// Layout de todas las páginas internas (carpeta (panel)): menú lateral, barra
// superior y protección.
// - Sin sesión → manda a /login y vuelve a la página después de entrar.
// - Si el rol no puede ver la sección (src/lib/roles.js) → muestra un aviso.
// Las páginas de cada módulo solo se preocupan de su contenido.

import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ShieldAlert } from 'lucide-react';
import Sidebar from '../../components/layout/Sidebar';
import Topbar from '../../components/layout/Topbar';
import { Button } from '../../components/ui/button';
import { Skeleton } from '../../components/ui/skeleton';
import { useAuth } from '../../hooks/useAuth';
import { puedeVer } from '../../lib/roles';

function PanelCargando() {
  return (
    <div className="flex min-h-screen" role="status" aria-label="Cargando el panel">
      <div className="hidden w-64 bg-sidebar lg:block" />
      <div className="flex flex-1 flex-col gap-6 p-8">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    </div>
  );
}

function SinPermiso() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-4 py-16 text-center">
      <ShieldAlert className="size-12 text-warning" aria-hidden="true" />
      <div>
        <h1 className="text-xl font-semibold">No tienes acceso a esta sección</h1>
        <p className="mt-2 text-sm text-muted-foreground">Tu rol no tiene permiso para verla. Si crees que es un error, habla con el administrador.</p>
      </div>
      <Button asChild variant="outline">
        <Link href="/dashboard">Volver al dashboard</Link>
      </Button>
    </div>
  );
}

export default function PanelLayout({ children }) {
  const { usuario, cargando } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!cargando && !usuario) router.replace(`/login?siguiente=${encodeURIComponent(pathname)}`);
  }, [cargando, usuario, pathname, router]);

  if (cargando || !usuario) return <PanelCargando />;

  return (
    <div className="flex min-h-screen">
      <Sidebar rol={usuario.rol} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />
        <main id="contenido" className="mx-auto w-full max-w-7xl flex-1 p-4 md:p-8">
          {puedeVer(pathname, usuario.rol) ? children : <SinPermiso />}
        </main>
      </div>
    </div>
  );
}
