'use client';

// Página /ventas: historial con filtros por fechas, estado y comprobante o cliente.
// El administrador ve todas las ventas; el vendedor solo las suyas.

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { Buscador } from '@/components/ui/buscador';
import { Button } from '@/components/ui/button';
import { EncabezadoPagina } from '@/components/ui/encabezado-pagina';
import { EstadoError, EstadoVacio, TablaCargando } from '@/components/ui/estados';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Paginacion } from '@/components/ui/paginacion';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BadgeEstadoVenta } from '@/components/ventas/BadgeEstadoVenta';
import { useAuth } from '@/hooks/useAuth';
import { formatearFecha, formatearSoles } from '@/lib/formato';
import { listarVentas } from '@/services/ventas.service';

const LIMITE = 10;

export default function VentasPage() {
  const { usuario } = useAuth();
  const soloPropias = usuario?.rol === 'vendedor';
  const vendedorId = soloPropias ? usuario.id : '';

  const [buscar, setBuscar] = useState('');
  const [desde, setDesde] = useState('');
  const [hasta, setHasta] = useState('');
  const [estado, setEstado] = useState('todos');
  const [pagina, setPagina] = useState(1);
  const [resultado, setResultado] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  const cargar = useCallback(async () => {
    setCargando(true);
    setError(null);
    try {
      setResultado(
        await listarVentas({
          desde,
          hasta,
          estado: estado === 'todos' ? '' : estado,
          buscar,
          pagina,
          limite: LIMITE,
          vendedor_id: vendedorId,
        }),
      );
    } catch (e) {
      setError(e);
    } finally {
      setCargando(false);
    }
  }, [desde, hasta, estado, buscar, pagina, vendedorId]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const alBuscar = useCallback((texto) => {
    setBuscar(texto);
    setPagina(1);
  }, []);

  const hayFiltros = Boolean(buscar || desde || hasta || estado !== 'todos');

  function limpiarFiltros() {
    setDesde('');
    setHasta('');
    setEstado('todos');
    setPagina(1);
  }

  const botonNueva = (
    <Button asChild>
      <Link href="/ventas/nueva">
        <Plus aria-hidden="true" />
        Nueva venta
      </Link>
    </Button>
  );

  return (
    <>
      <EncabezadoPagina
        titulo="Ventas"
        descripcion={soloPropias ? 'Historial de tus ventas.' : 'Historial de ventas y comprobantes.'}
      >
        {botonNueva}
      </EncabezadoPagina>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
        <Buscador onBuscar={alBuscar} placeholder="Buscar por comprobante o cliente…" />
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="filtro-desde">Desde</Label>
          <Input
            id="filtro-desde"
            type="date"
            value={desde}
            max={hasta || undefined}
            onChange={(e) => {
              setDesde(e.target.value);
              setPagina(1);
            }}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="filtro-hasta">Hasta</Label>
          <Input
            id="filtro-hasta"
            type="date"
            value={hasta}
            min={desde || undefined}
            onChange={(e) => {
              setHasta(e.target.value);
              setPagina(1);
            }}
          />
        </div>
        <div className="flex flex-col gap-1.5 sm:w-40">
          <Label htmlFor="filtro-estado">Estado</Label>
          <Select
            value={estado}
            onValueChange={(valor) => {
              setEstado(valor);
              setPagina(1);
            }}
          >
            <SelectTrigger id="filtro-estado">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              <SelectItem value="pagada">Pagada</SelectItem>
              <SelectItem value="anulada">Anulada</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {(desde || hasta || estado !== 'todos') && (
          <Button variant="ghost" onClick={limpiarFiltros}>
            Limpiar filtros
          </Button>
        )}
      </div>

      {cargando && <TablaCargando columnas={6} />}

      {!cargando && error && <EstadoError mensaje={error.message} onReintentar={cargar} />}

      {!cargando && !error && resultado?.data.length === 0 && (
        <EstadoVacio
          titulo={hayFiltros ? 'Sin resultados' : 'Aún no hay ventas'}
          descripcion={
            hayFiltros ? 'No encontramos ventas con esos filtros.' : 'Registra tu primera venta para verla aquí.'
          }
          accion={!hayFiltros && botonNueva}
        />
      )}

      {!cargando && !error && resultado?.data.length > 0 && (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Comprobante</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead className="hidden md:table-cell">Vendedor</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead>Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {resultado.data.map((v) => (
                <TableRow key={v.id}>
                  <TableCell className="whitespace-nowrap font-medium tabular-nums">
                    <Link href={`/ventas/${v.id}`} className="hover:underline">
                      {v.serie_numero}
                    </Link>
                  </TableCell>
                  <TableCell className="whitespace-nowrap">{formatearFecha(v.fecha)}</TableCell>
                  <TableCell>{v.cliente_nombre}</TableCell>
                  <TableCell className="hidden md:table-cell">{v.vendedor_nombre}</TableCell>
                  <TableCell className="text-right tabular-nums">{formatearSoles(v.total)}</TableCell>
                  <TableCell>
                    <BadgeEstadoVenta estado={v.estado} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Paginacion pagina={resultado.pagina} limite={resultado.limite} total={resultado.total} onCambiar={setPagina} />
        </>
      )}
    </>
  );
}
