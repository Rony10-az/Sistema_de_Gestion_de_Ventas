'use client';

// Confirmación antes de una acción que no se deshace fácil (eliminar, anular una venta).
// <ConfirmarDialogo titulo="¿Anular la venta B001-000142?" descripcion="El stock vuelve a subir."
//   textoConfirmar="Anular venta" peligro onConfirmar={anular}>
//   <Button variant="destructive">Anular</Button>
// </ConfirmarDialogo>

import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from './alert-dialog';
import { buttonVariants } from './button';

export function ConfirmarDialogo({ children, titulo, descripcion, textoConfirmar = 'Confirmar', peligro = false, onConfirmar }) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{titulo}</AlertDialogTitle>
          {descripcion && <AlertDialogDescription>{descripcion}</AlertDialogDescription>}
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirmar}
            className={peligro ? buttonVariants({ variant: 'destructive' }) : undefined}
          >
            {textoConfirmar}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
