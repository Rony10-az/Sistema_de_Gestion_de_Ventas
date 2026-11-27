'use client';

// Página /clientes: listado paginado con buscador por documento o nombre,
// y alta/edición en un diálogo. Visible para admin y vendedor (ver lib/roles.js).

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Pencil, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Buscador } from '@/components/ui/buscador';
import { Button } from '@/components/ui/button';
import { EncabezadoPagina } from '@/components/ui/encabezado-pagina';
import { EstadoError, EstadoVacio, TablaCargando } from '@/components/ui/estados';
import { Paginacion } from '@/components/ui/paginacion';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FormularioCliente } from '@/components/clientes/FormularioCliente';
import { actualizarCliente, crearCliente, existeDocumento, listarClientes } from '@/services/clientes.service';

const LIMITE = 10;

export default function ClientesPage() {
  const [buscar, setBuscar] = useState('');
  const [pagina, setPagina] = useState(1);
  const [resultado, setResultado] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [formulario, setFormulario] = useState({ abierto: false, cliente: null });

  const cargar = useCallback(async () => {
    setCargando(true);
    setError(null);
    try {
      setResultado(await listarClientes({ buscar, pagina, limite: LIMITE }));
    } catch (e) {
      setError(e);
    } finally {
      setCargando(false);
    }
  }, [buscar, pagina]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const alBuscar = useCallback((texto) => {
    setBuscar(texto);
    setPagina(1);
  }, []);

  async function guardar(datos) {
    const editando = formulario.cliente;
    if (editando) await actualizarCliente(editando.id, datos);
    else await crearCliente(datos);
    toast.success(editando ? 'Cliente actualizado' : 'Cliente creado');
    await cargar();
  }

  const abrirNuevo = () => setFormulario({ abierto: true, cliente: null });

  return (
    <>
      <EncabezadoPagina titulo="Clientes" descripcion="Registro de clientes con DNI o RUC y su historial de compras.">
        <Button onClick={abrirNuevo}>
          <Plus aria-hidden="true" />
          Nuevo cliente
        </Button>
      </EncabezadoPagina>

      <div className="mb-4">
        <Buscador onBuscar={alBuscar} placeholder="Buscar por documento o nombre…" />
      </div>

      {cargando && <TablaCargando columnas={5} />}

      {!cargando && error && <EstadoError mensaje={error.message} onReintentar={cargar} />}

      {!cargando && !error && resultado?.data.length === 0 && (
        <EstadoVacio
          titulo={buscar ? 'Sin resultados' : 'Aún no hay clientes'}
          descripcion={buscar ? `No encontramos clientes para “${buscar}”.` : 'Registra tu primer cliente para empezar.'}
          accion={
            !buscar && (
              <Button onClick={abrirNuevo}>
                <Plus aria-hidden="true" />
                Nuevo cliente
              </Button>
            )
          }
        />
      )}

      {!cargando && !error && resultado?.data.length > 0 && (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Documento</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead className="hidden md:table-cell">Teléfono</TableHead>
                <TableHead className="hidden lg:table-cell">Correo</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {resultado.data.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="whitespace-nowrap">
                    <Badge variant="outline" className="mr-2">
                      {c.tipo_documento}
                    </Badge>
                    <span className="tabular-nums">{c.documento}</span>
                  </TableCell>
                  <TableCell className="font-medium">
                    <Link href={`/clientes/${c.id}`} className="hover:underline">
                      {c.nombre}
                    </Link>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">{c.telefono || '—'}</TableCell>
                  <TableCell className="hidden lg:table-cell">{c.email || '—'}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setFormulario({ abierto: true, cliente: c })}
                      aria-label={`Editar a ${c.nombre}`}
                    >
                      <Pencil aria-hidden="true" />
                      Editar
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Paginacion pagina={resultado.pagina} limite={resultado.limite} total={resultado.total} onCambiar={setPagina} />
        </>
      )}

      <FormularioCliente
        open={formulario.abierto}
        onOpenChange={(abierto) => setFormulario((f) => ({ ...f, abierto }))}
        cliente={formulario.cliente}
        onGuardar={guardar}
        verificarDocumento={existeDocumento}
      />
    </>
  );
}
