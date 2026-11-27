'use client';

// Página /usuarios (solo admin): gestión de usuarios y roles.
// Por ahora es un marcador: se completa en la siguiente tarea de Oscar.

import { EncabezadoPagina } from '../../../components/ui/encabezado-pagina';
import { EstadoVacio } from '../../../components/ui/estados';

export default function UsuariosPage() {
  return (
    <>
      <EncabezadoPagina titulo="Usuarios" descripcion="Crea cuentas para el personal y asígnales un rol." />
      <EstadoVacio titulo="Sección en construcción" descripcion="Aquí aparecerá la lista de usuarios con su rol y estado." />
    </>
  );
}
