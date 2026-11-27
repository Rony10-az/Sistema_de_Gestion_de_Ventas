'use client';

// Página /clientes/[id]: ficha del cliente con su historial de ventas.

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, Pencil } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EncabezadoPagina } from '@/components/ui/encabezado-pagina';
import { EstadoError, EstadoVacio, TablaCargando } from '@/components/ui/estados';
import { Paginacion } from '@/components/ui/paginacion';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FormularioCliente } from '@/components/clientes/FormularioCliente';
import { formatearFecha, formatearSoles } from '@/lib/formato';
import { actualizarCliente, existeDocumento, listarVentasDeCliente, obtenerCliente } from '@/services/clientes.service';

const LIMITE = 10;

function Dato({ etiqueta, valor }) {
  return (
    <div>
      <dt className="text-sm text-muted-foreground">{etiqueta}</dt>
      <dd className="font-medium">{valor || '—'}</dd>
    </div>
  );
}

export default function FichaClientePage() {
  const { id } = useParams();
  const [cliente, setCliente] = useState(null);
  const [cargandoCliente, setCargandoCliente] = useState(true);
  const [errorCliente, setErrorCliente] = useState(null);

  const [pagina, setPagina] = useState(1);
  const [ventas, setVentas] = useState(null);
  const [cargandoVentas, setCargandoVentas] = useState(true);
  const [errorVentas, setErrorVentas] = useState(null);

  const [editando, setEditando] = useState(false);

  const cargarCliente = useCallback(async () => {
    setCargandoCliente(true);
    setErrorCliente(null);
    try {
      setCliente(await obtenerCliente(id));
    } catch (e) {
      setErrorCliente(e);
    } finally {
      setCargandoCliente(false);
    }
  }, [id]);

  const cargarVentas = useCallback(async () => {
    setCargandoVentas(true);
    setErrorVentas(null);
    try {
      setVentas(await listarVentasDeCliente(id, { pagina, limite: LIMITE }));
    } catch (e) {
      setErrorVentas(e);
    } finally {
      setCargandoVentas(false);
    }
  }, [id, pagina]);

  useEffect(() => {
    cargarCliente();
  }, [cargarCliente]);

  useEffect(() => {
    cargarVentas();
  }, [cargarVentas]);

  async function guardar(datos) {
    await actualizarCliente(id, datos);
    toast.success('Cliente actualizado');
    await cargarCliente();
  }

  const volver = (
    <Button asChild variant="ghost" size="sm" className="mb-2 -ml-2">
      <Link href="/clientes">
        <ArrowLeft aria-hidden="true" />
        Volver a clientes
      </Link>
    </Button>
  );

  if (cargandoCliente && !cliente) {
    return (
      <>
        {volver}
        <TablaCargando filas={3} columnas={2} />
      </>
    );
  }

  if (errorCliente) {
    return (
      <>
        {volver}
        <EstadoError
          titulo={errorCliente.status === 404 ? 'Cliente no encontrado' : 'No se pudo cargar el cliente'}
          mensaje={errorCliente.message}
          onReintentar={cargarCliente}
        />
      </>
    );
  }

  return (
    <>
      {volver}
      <EncabezadoPagina titulo={cliente.nombre} descripcion={`${cliente.tipo_documento} ${cliente.documento}`}>
        <Button onClick={() => setEditando(true)}>
          <Pencil aria-hidden="true" />
          Editar
        </Button>
      </EncabezadoPagina>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Datos del cliente</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-4 sm:grid-cols-2">
            <Dato etiqueta="Tipo de documento" valor={cliente.tipo_documento} />
            <Dato etiqueta="Documento" valor={cliente.documento} />
            <Dato etiqueta="Teléfono" valor={cliente.telefono} />
            <Dato etiqueta="Correo" valor={cliente.email} />
            <div className="sm:col-span-2">
              <Dato etiqueta="Dirección" valor={cliente.direccion} />
            </div>
          </dl>
        </CardContent>
      </Card>

      <h2 className="mb-3 text-lg font-semibold">Historial de ventas</h2>

      {cargandoVentas && <TablaCargando columnas={4} filas={3} />}

      {!cargandoVentas && errorVentas && <EstadoError mensaje={errorVentas.message} onReintentar={cargarVentas} />}

      {!cargandoVentas && !errorVentas && ventas?.data.length === 0 && (
        <EstadoVacio titulo="Sin ventas" descripcion="Este cliente todavía no tiene compras registradas." />
      )}

      {!cargandoVentas && !errorVentas && ventas?.data.length > 0 && (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Comprobante</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead>Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ventas.data.map((v) => (
                <TableRow key={v.serie_numero}>
                  <TableCell className="font-medium tabular-nums">{v.serie_numero}</TableCell>
                  <TableCell>{formatearFecha(v.fecha)}</TableCell>
                  <TableCell className="text-right tabular-nums">{formatearSoles(v.total)}</TableCell>
                  <TableCell>
                    <Badge variant={v.estado === 'anulada' ? 'destructive' : 'secondary'}>
                      {v.estado === 'anulada' ? 'Anulada' : 'Completada'}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Paginacion pagina={ventas.pagina} limite={ventas.limite} total={ventas.total} onCambiar={setPagina} />
        </>
      )}

      <FormularioCliente
        open={editando}
        onOpenChange={setEditando}
        cliente={cliente}
        onGuardar={guardar}
        verificarDocumento={existeDocumento}
      />
    </>
  );
}
