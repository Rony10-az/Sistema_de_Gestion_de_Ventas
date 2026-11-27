'use client';

// Página /ventas/[id]: comprobante de la venta. Solo el administrador puede anularla.

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, Ban } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ConfirmarDialogo } from '@/components/ui/confirmar-dialogo';
import { EncabezadoPagina } from '@/components/ui/encabezado-pagina';
import { EstadoError, TablaCargando } from '@/components/ui/estados';
import { BadgeEstadoVenta } from '@/components/ventas/BadgeEstadoVenta';
import { TablaComprobante } from '@/components/ventas/TablaComprobante';
import { useAuth } from '@/hooks/useAuth';
import { formatearFechaHora } from '@/lib/formato';
import { anularVenta, obtenerVenta } from '@/services/ventas.service';

const METODOS_PAGO = { efectivo: 'Efectivo', tarjeta: 'Tarjeta', yape: 'Yape' };
const TIPOS = { boleta: 'Boleta de venta', factura: 'Factura' };

function Dato({ etiqueta, valor, children }) {
  return (
    <div>
      <dt className="text-sm text-muted-foreground">{etiqueta}</dt>
      <dd className="font-medium">{children ?? (valor || '—')}</dd>
    </div>
  );
}

export default function ComprobantePage() {
  const { id } = useParams();
  const { usuario } = useAuth();
  const [venta, setVenta] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  const cargar = useCallback(async () => {
    setCargando(true);
    setError(null);
    try {
      setVenta(await obtenerVenta(id));
    } catch (e) {
      setError(e);
    } finally {
      setCargando(false);
    }
  }, [id]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  async function anular() {
    try {
      setVenta(await anularVenta(id));
      toast.success(`Venta ${venta.serie_numero} anulada`);
    } catch (e) {
      toast.error(e.message);
    }
  }

  const volver = (
    <Button asChild variant="ghost" size="sm" className="mb-2 -ml-2">
      <Link href="/ventas">
        <ArrowLeft aria-hidden="true" />
        Volver a ventas
      </Link>
    </Button>
  );

  if (cargando && !venta) {
    return (
      <>
        {volver}
        <TablaCargando filas={4} columnas={3} />
      </>
    );
  }

  if (error) {
    return (
      <>
        {volver}
        <EstadoError
          titulo={error.status === 404 ? 'Venta no encontrada' : 'No se pudo cargar la venta'}
          mensaje={error.message}
          onReintentar={cargar}
        />
      </>
    );
  }

  // El vendedor solo puede abrir sus propias ventas (la API real lo valida con el token).
  if (usuario?.rol === 'vendedor' && venta.vendedor_id !== usuario.id) {
    return (
      <>
        {volver}
        <EstadoError titulo="Venta no encontrada" mensaje="Esta venta no está entre las tuyas." />
      </>
    );
  }

  const puedeAnular = usuario?.rol === 'admin' && venta.estado === 'pagada';

  return (
    <>
      {volver}
      <EncabezadoPagina titulo={venta.serie_numero} descripcion={TIPOS[venta.tipo_comprobante]}>
        {puedeAnular && (
          <ConfirmarDialogo
            titulo={`¿Anular la venta ${venta.serie_numero}?`}
            descripcion="El comprobante quedará como anulado y esta acción no se puede deshacer."
            textoConfirmar="Anular venta"
            peligro
            onConfirmar={anular}
          >
            <Button variant="destructive">
              <Ban aria-hidden="true" />
              Anular venta
            </Button>
          </ConfirmarDialogo>
        )}
      </EncabezadoPagina>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Datos del comprobante</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Dato etiqueta="Comprobante" valor={venta.serie_numero} />
            <Dato etiqueta="Fecha" valor={formatearFechaHora(venta.fecha)} />
            <Dato etiqueta="Estado">
              <BadgeEstadoVenta estado={venta.estado} />
            </Dato>
            <Dato etiqueta="Cliente">
              <Link href={`/clientes/${venta.cliente_id}`} className="hover:underline">
                {venta.cliente_nombre}
              </Link>
            </Dato>
            <Dato etiqueta="Vendedor" valor={venta.vendedor_nombre} />
            <Dato etiqueta="Método de pago" valor={METODOS_PAGO[venta.metodo_pago]} />
          </dl>
        </CardContent>
      </Card>

      <TablaComprobante venta={venta} />
    </>
  );
}
