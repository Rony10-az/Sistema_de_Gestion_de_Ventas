// Etiqueta con el estado de una venta: pagada o anulada.

import { Badge } from '@/components/ui/badge';

export function BadgeEstadoVenta({ estado }) {
  return (
    <Badge variant={estado === 'anulada' ? 'destructive' : 'secondary'}>
      {estado === 'anulada' ? 'Anulada' : 'Pagada'}
    </Badge>
  );
}
