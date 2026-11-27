'use client';

// Formulario de cliente en un diálogo, para crear (cliente=null) o editar.
// No llama a la API: recibe
//   onGuardar(datos)                  → promesa; puede lanzar ApiError con `campos`
//   verificarDocumento(doc, excluirId) → promesa<boolean>: true si el documento ya existe
// Se cierra solo cuando onGuardar termina bien.

import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { CampoFormulario } from '@/components/ui/campo-formulario';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const LONGITUD = { DNI: 8, RUC: 11 };
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validar(valores) {
  const errores = {};
  const { tipo_documento: tipo, documento, nombre, telefono, email, direccion } = valores;

  if (!nombre.trim()) errores.nombre = 'El nombre es obligatorio';
  if (!/^\d+$/.test(documento) || documento.length !== LONGITUD[tipo]) {
    errores.documento = `El ${tipo} debe tener ${LONGITUD[tipo]} dígitos`;
  }
  if (telefono.trim() && !/^9\d{8}$/.test(telefono.trim())) {
    errores.telefono = 'El teléfono debe tener 9 dígitos y empezar con 9';
  }
  if (email.trim() && !EMAIL.test(email.trim())) errores.email = 'El correo no tiene un formato válido';
  if (tipo === 'RUC' && !direccion.trim()) errores.direccion = 'La dirección es obligatoria para un RUC';
  return errores;
}

function Campos({ cliente, onGuardar, verificarDocumento, onCerrar }) {
  const [valores, setValores] = useState({
    tipo_documento: cliente?.tipo_documento ?? 'DNI',
    documento: cliente?.documento ?? '',
    nombre: cliente?.nombre ?? '',
    telefono: cliente?.telefono ?? '',
    email: cliente?.email ?? '',
    direccion: cliente?.direccion ?? '',
  });
  const [errores, setErrores] = useState({});
  const [guardando, setGuardando] = useState(false);

  function cambiar(campo, valor) {
    setValores((v) => ({ ...v, [campo]: valor }));
    setErrores((e) => ({ ...e, [campo]: undefined }));
  }

  async function enviar(evento) {
    evento.preventDefault();
    const encontrados = validar(valores);
    if (Object.keys(encontrados).length > 0) {
      setErrores(encontrados);
      return;
    }

    setGuardando(true);
    try {
      if (await verificarDocumento(valores.documento, cliente?.id ?? null)) {
        setErrores({ documento: 'Ya existe un cliente con ese documento' });
        return;
      }
      await onGuardar(valores);
      onCerrar();
    } catch (error) {
      if (error.campos) setErrores(error.campos);
      else toast.error(error.message || 'No se pudo guardar el cliente');
    } finally {
      setGuardando(false);
    }
  }

  const esRuc = valores.tipo_documento === 'RUC';

  return (
    <form onSubmit={enviar} noValidate className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-[8rem_1fr]">
        <CampoFormulario id="tipo_documento" etiqueta="Tipo" error={errores.tipo_documento}>
          <Select
            value={valores.tipo_documento}
            onValueChange={(tipo) => {
              setValores((v) => ({ ...v, tipo_documento: tipo, documento: '' }));
              setErrores((e) => ({ ...e, documento: undefined, tipo_documento: undefined }));
            }}
          >
            <SelectTrigger id="tipo_documento">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="DNI">DNI</SelectItem>
              <SelectItem value="RUC">RUC</SelectItem>
            </SelectContent>
          </Select>
        </CampoFormulario>

        <CampoFormulario id="documento" etiqueta="Documento" error={errores.documento} ayuda={`${LONGITUD[valores.tipo_documento]} dígitos`}>
          <Input
            id="documento"
            inputMode="numeric"
            maxLength={LONGITUD[valores.tipo_documento]}
            value={valores.documento}
            onChange={(e) => cambiar('documento', e.target.value.replace(/\D/g, ''))}
            aria-invalid={!!errores.documento}
            aria-describedby={errores.documento ? 'documento-error' : undefined}
          />
        </CampoFormulario>
      </div>

      <CampoFormulario id="nombre" etiqueta={esRuc ? 'Razón social' : 'Nombre completo'} error={errores.nombre}>
        <Input
          id="nombre"
          value={valores.nombre}
          onChange={(e) => cambiar('nombre', e.target.value)}
          aria-invalid={!!errores.nombre}
          aria-describedby={errores.nombre ? 'nombre-error' : undefined}
        />
      </CampoFormulario>

      <div className="grid gap-4 sm:grid-cols-2">
        <CampoFormulario id="telefono" etiqueta="Teléfono (opcional)" error={errores.telefono} ayuda="9 dígitos, empieza con 9">
          <Input
            id="telefono"
            inputMode="numeric"
            maxLength={9}
            value={valores.telefono}
            onChange={(e) => cambiar('telefono', e.target.value.replace(/\D/g, ''))}
            aria-invalid={!!errores.telefono}
            aria-describedby={errores.telefono ? 'telefono-error' : undefined}
          />
        </CampoFormulario>

        <CampoFormulario id="email" etiqueta="Correo (opcional)" error={errores.email}>
          <Input
            id="email"
            type="email"
            value={valores.email}
            onChange={(e) => cambiar('email', e.target.value)}
            aria-invalid={!!errores.email}
            aria-describedby={errores.email ? 'email-error' : undefined}
          />
        </CampoFormulario>
      </div>

      <CampoFormulario id="direccion" etiqueta={esRuc ? 'Dirección' : 'Dirección (opcional)'} error={errores.direccion}>
        <Input
          id="direccion"
          value={valores.direccion}
          onChange={(e) => cambiar('direccion', e.target.value)}
          aria-invalid={!!errores.direccion}
          aria-describedby={errores.direccion ? 'direccion-error' : undefined}
        />
      </CampoFormulario>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCerrar} disabled={guardando}>
          Cancelar
        </Button>
        <Button type="submit" disabled={guardando}>
          {guardando ? 'Guardando…' : 'Guardar'}
        </Button>
      </DialogFooter>
    </form>
  );
}

export function FormularioCliente({ open, onOpenChange, cliente = null, onGuardar, verificarDocumento }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{cliente ? 'Editar cliente' : 'Nuevo cliente'}</DialogTitle>
          <DialogDescription>
            {cliente ? 'Actualiza los datos del cliente.' : 'Registra un cliente con su DNI o RUC.'}
          </DialogDescription>
        </DialogHeader>
        <Campos
          cliente={cliente}
          onGuardar={onGuardar}
          verificarDocumento={verificarDocumento}
          onCerrar={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
