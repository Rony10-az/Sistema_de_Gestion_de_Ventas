'use client';

// Menú lateral del panel. Muestra solo las secciones que el rol del usuario
// puede usar (ver src/lib/roles.js) y marca la sección actual.

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ChartColumn, LayoutDashboard, Package, PackagePlus, ReceiptText, Tags, Truck, UserCog, Users, Wrench,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { menuParaRol } from '@/lib/roles';

const ICONOS = {
  dashboard: LayoutDashboard,
  productos: Package,
  categorias: Tags,
  proveedores: Truck,
  compras: PackagePlus,
  ventas: ReceiptText,
  clientes: Users,
  reportes: ChartColumn,
  usuarios: UserCog,
};

export function Marca() {
  return (
    <Link href="/dashboard" className="flex items-center gap-2 px-2 text-sidebar-foreground">
      <span className="grid size-8 place-items-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground">
        <Wrench className="size-4" aria-hidden="true" />
      </span>
      <span className="text-lg font-semibold tracking-tight">TecniFix</span>
    </Link>
  );
}

export function NavegacionPanel({ rol, onNavegar }) {
  const pathname = usePathname();
  const grupos = menuParaRol(rol);

  return (
    <nav aria-label="Secciones del panel" className="flex flex-col gap-6">
      {grupos.map((grupo) => (
        <div key={grupo.grupo} className="flex flex-col gap-1">
          <p className="px-3 text-xs font-medium uppercase tracking-wider text-sidebar-foreground/60">{grupo.grupo}</p>
          {grupo.items.map((item) => {
            const Icono = ICONOS[item.icono];
            const activo = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavegar}
                aria-current={activo ? 'page' : undefined}
                className={cn(
                  'flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring',
                  activo
                    ? 'bg-sidebar-accent font-medium text-sidebar-accent-foreground'
                    : 'text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground',
                )}
              >
                {Icono && <Icono className={cn('size-4', activo && 'text-sidebar-primary')} aria-hidden="true" />}
                {item.texto}
              </Link>
            );
          })}
        </div>
      ))}
    </nav>
  );
}

export default function Sidebar({ rol }) {
  return (
    <aside className="hidden w-64 shrink-0 flex-col gap-8 border-r border-sidebar-border bg-sidebar px-3 py-5 lg:flex">
      <Marca />
      <NavegacionPanel rol={rol} />
      <p className="mt-auto px-3 text-xs text-sidebar-foreground/50">Ventas e inventario</p>
    </aside>
  );
}
