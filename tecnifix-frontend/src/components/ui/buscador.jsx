'use client';

// Campo de búsqueda con espera (debounce): avisa con onBuscar(texto) cuando el
// usuario deja de escribir, así no se llama a la API en cada tecla.

import { useEffect, useRef, useState } from 'react';
import { Search } from 'lucide-react';
import { Input } from './input';
import { cn } from '@/lib/utils';

export function Buscador({ onBuscar, placeholder = 'Buscar…', espera = 350, valorInicial = '', className, id = 'buscador' }) {
  const [texto, setTexto] = useState(valorInicial);
  const primeraVez = useRef(true);

  useEffect(() => {
    if (primeraVez.current) {
      primeraVez.current = false;
      return undefined;
    }
    const t = setTimeout(() => onBuscar(texto.trim()), espera);
    return () => clearTimeout(t);
  }, [texto, espera, onBuscar]);

  return (
    <div className={cn('relative w-full sm:max-w-xs', className)}>
      <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
      <Input
        id={id}
        type="search"
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="pl-9"
      />
    </div>
  );
}
