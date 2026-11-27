'use client';

// Barra superior del panel: botón de menú en celulares, aviso de modo de prueba
// y menú del usuario con su rol y el botón para cerrar sesión.

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FlaskConical, LogOut, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetDescription, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useAuth } from '@/hooks/useAuth';
import { ROLES } from '@/lib/roles';
import { USAR_MOCKS } from '@/lib/mock';
import { Marca, NavegacionPanel } from './Sidebar';

function iniciales(nombre = '') {
  return nombre.split(' ').filter(Boolean).slice(0, 2).map((p) => p[0]).join('').toUpperCase();
}

export default function Topbar() {
  const { usuario, logout } = useAuth();
  const router = useRouter();
  const [menuAbierto, setMenuAbierto] = useState(false);

  function cerrarSesion() {
    logout();
    router.replace('/login');
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-white/[0.06] bg-background/60 px-4 backdrop-blur-xl md:px-8">
      <Sheet open={menuAbierto} onOpenChange={setMenuAbierto}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Abrir menú">
            <Menu className="size-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-72 border-sidebar-border bg-sidebar p-5 text-sidebar-foreground">
          <SheetTitle className="sr-only">Menú</SheetTitle>
          <SheetDescription className="sr-only">Secciones del panel de TecniFix</SheetDescription>
          <div className="flex flex-col gap-8">
            <Marca />
            <NavegacionPanel rol={usuario.rol} onNavegar={() => setMenuAbierto(false)} />
          </div>
        </SheetContent>
      </Sheet>

      {USAR_MOCKS && (
        <Badge variant="outline" className="gap-1.5 border-white/10 bg-white/[0.03] font-mono text-[0.65rem] uppercase tracking-[0.14em] text-muted-foreground">
          <span className="size-1.5 animate-respirar rounded-full bg-primary" aria-hidden="true" />
          <FlaskConical className="size-3" aria-hidden="true" />
          Datos de prueba
        </Badge>
      )}

      <div className="ml-auto">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-auto gap-3 px-2 py-1.5">
              <span className="degradado-marca grid size-8 place-items-center rounded-full font-display text-xs font-semibold text-white shadow-brillo">
                {iniciales(usuario.nombre)}
              </span>
              <span className="hidden text-left leading-tight sm:block">
                <span className="block text-sm font-medium">{usuario.nombre}</span>
                <span className="block text-xs text-muted-foreground">{ROLES[usuario.rol] ?? usuario.rol}</span>
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="font-normal">
              <span className="block text-sm font-medium">{usuario.nombre}</span>
              <span className="block truncate text-xs text-muted-foreground">{usuario.email}</span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={cerrarSesion} className="gap-2">
              <LogOut className="size-4" aria-hidden="true" />
              Cerrar sesión
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
