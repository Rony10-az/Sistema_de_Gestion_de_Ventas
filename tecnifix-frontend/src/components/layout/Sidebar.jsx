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
    <Link href="/dashboard" className="flex items-center gap-2.5 px-2 text-sidebar-foreground">
      <span className="degradado-marca grid size-9 place-items-center rounded-xl shadow-brillo">
        <Wrench className="size-4 text-white" aria-hidden="true" />
      </span>
      <span className="font-display text-xl font-semibold tracking-tight text-white">
        Tecni<span className="texto-marca">Fix</span>
      </span>
    </Link>
  );
}

export function NavegacionPanel({ rol, onNavegar }) {
  const pathname = usePathname();
  const grupos = menuParaRol(rol);

  return (
    <nav aria-label="Secciones del panel" className="flex flex-col gap-7">
      {grupos.map((grupo) => (
        <div key={grupo.grupo} className="flex flex-col gap-1">
          <p className="etiqueta px-3 pb-1 text-[0.65rem] text-sidebar-foreground/45">{grupo.grupo}</p>
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
                  'group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all duration-300',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring',
                  activo
                    ? 'bg-white/[0.06] font-semibold text-white'
                    : 'text-sidebar-foreground/70 hover:bg-white/[0.04] hover:text-white',
                )}
              >
                {activo && (
                  <span className="degradado-marca absolute inset-y-2 left-0 w-[3px] rounded-full" aria-hidden="true" />
                )}
                {Icono && (
                  <Icono
                    className={cn(
                      'size-4 transition-colors',
                      activo ? 'text-accent-foreground' : 'text-sidebar-foreground/50 group-hover:text-accent-foreground',
                    )}
                    aria-hidden="true"
                  />
                )}
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
    <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col gap-9 overflow-y-auto border-r border-sidebar-border bg-sidebar px-3 py-6 lg:flex">
      <Marca />
      <NavegacionPanel rol={rol} />
      <p className="etiqueta mt-auto px-3 text-[0.62rem] text-sidebar-foreground/35">Ventas · Inventario · 2026</p>
    </aside>
  );
}
