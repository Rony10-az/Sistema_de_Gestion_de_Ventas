'use client';

// Página raíz "/": si hay sesión manda al dashboard; si no, al login.

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../hooks/useAuth';

export default function HomePage() {
  const { usuario, cargando } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!cargando) router.replace(usuario ? '/dashboard' : '/login');
  }, [usuario, cargando, router]);

  return (
    <div className="grid min-h-screen place-items-center text-sm text-muted-foreground" role="status">
      Cargando TecniFix…
    </div>
  );
}
