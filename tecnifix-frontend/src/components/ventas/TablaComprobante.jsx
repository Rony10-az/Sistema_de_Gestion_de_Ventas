// Líneas del comprobante y sus totales: operación gravada, IGV (18 %) y total.

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatearNumero, formatearSoles } from '@/lib/formato';

export function TablaComprobante({ venta }) {
  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Producto</TableHead>
            <TableHead className="text-right">Cant.</TableHead>
            <TableHead className="text-right">P. unitario</TableHead>
            <TableHead className="text-right">Importe</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {venta.items.map((i) => (
            <TableRow key={i.producto_id}>
              <TableCell className="font-medium">{i.nombre}</TableCell>
              <TableCell className="text-right tabular-nums">{formatearNumero(i.cantidad)}</TableCell>
              <TableCell className="text-right tabular-nums">{formatearSoles(i.precio_unitario)}</TableCell>
              <TableCell className="text-right tabular-nums">{formatearSoles(i.subtotal)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <dl className="mt-4 ml-auto grid w-full max-w-xs grid-cols-2 gap-2 text-sm">
        <dt className="text-muted-foreground">Operación gravada</dt>
        <dd className="text-right tabular-nums">{formatearSoles(venta.subtotal)}</dd>
        <dt className="text-muted-foreground">IGV (18 %)</dt>
        <dd className="text-right tabular-nums">{formatearSoles(venta.igv)}</dd>
        <dt className="border-t pt-2 text-base font-semibold">Total</dt>
        <dd className="border-t pt-2 text-right text-base font-semibold tabular-nums">{formatearSoles(venta.total)}</dd>
      </dl>
    </>
  );
}
