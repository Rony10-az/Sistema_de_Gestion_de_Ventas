'use client';

// Página /login: correo y contraseña. Valida en el navegador (el backend vuelve
// a validar), muestra el error de la API y, si todo va bien, entra al panel.
// Con datos de prueba activos muestra los usuarios de prueba de cada rol.

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, EyeOff, LoaderCircle, Wrench } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../../../hooks/useAuth';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { CampoFormulario } from '../../../components/ui/campo-formulario';
import { USAR_MOCKS } from '../../../lib/mock';
import { ROLES } from '../../../lib/roles';
import { CLAVE_DE_PRUEBA, usuariosDePrueba } from '../../../mocks/auth.mock';

const CORREO_VALIDO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validar({ email, password }) {
  const errores = {};
  if (!email.trim()) errores.email = 'Escribe tu correo';
  else if (!CORREO_VALIDO.test(email.trim())) errores.email = 'El correo no tiene un formato válido';
  if (!password) errores.password = 'Escribe tu contraseña';
  return errores;
}

function mensajeDeError(error) {
  if (error.status === 423) return error.message;
  if (error.status === 400 || error.status === 401) return 'Correo o contraseña incorrectos';
  return error.message || 'No se pudo iniciar sesión';
}

function FormularioLogin() {
  const { usuario, cargando, login } = useAuth();
  const router = useRouter();
  const destino = useSearchParams().get('siguiente') || '/dashboard';

  const [valores, setValores] = useState({ email: '', password: '' });
  const [errores, setErrores] = useState({});
  const [errorGeneral, setErrorGeneral] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [verClave, setVerClave] = useState(false);

  useEffect(() => {
    if (!cargando && usuario) router.replace(destino);
  }, [cargando, usuario, destino, router]);

  function cambiar(campo) {
    return (e) => {
      setValores((v) => ({ ...v, [campo]: e.target.value }));
      setErrores((er) => ({ ...er, [campo]: undefined }));
      setErrorGeneral('');
    };
  }

  async function enviar(e) {
    e.preventDefault();
    const encontrados = validar(valores);
    setErrores(encontrados);
    if (Object.keys(encontrados).length > 0) return;

    setEnviando(true);
    try {
      const u = await login(valores.email.trim(), valores.password);
      toast.success(`Bienvenido, ${u.nombre}`);
      router.replace(destino);
    } catch (error) {
      setErrorGeneral(mensajeDeError(error));
    } finally {
      setEnviando(false);
    }
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle className="text-xl">Iniciar sesión</CardTitle>
        <CardDescription>Ingresa con tu cuenta de la tienda.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={enviar} noValidate className="flex flex-col gap-4">
          {errorGeneral && (
            <p role="alert" className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
              {errorGeneral}
            </p>
          )}
          <CampoFormulario id="email" etiqueta="Correo" error={errores.email}>
            <Input
              id="email"
              type="email"
              autoComplete="username"
              value={valores.email}
              onChange={cambiar('email')}
              aria-invalid={!!errores.email}
              aria-describedby={errores.email ? 'email-error' : undefined}
            />
          </CampoFormulario>
          <CampoFormulario id="password" etiqueta="Contraseña" error={errores.password}>
            <div className="relative">
              <Input
                id="password"
                type={verClave ? 'text' : 'password'}
                autoComplete="current-password"
                value={valores.password}
                onChange={cambiar('password')}
                aria-invalid={!!errores.password}
                aria-describedby={errores.password ? 'password-error' : undefined}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setVerClave((v) => !v)}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-label={verClave ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              >
                {verClave ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </CampoFormulario>
          <Button type="submit" disabled={enviando} className="mt-2">
            {enviando && <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />}
            {enviando ? 'Ingresando…' : 'Ingresar'}
          </Button>
        </form>

        {USAR_MOCKS && (
          <div className="mt-6 rounded-md border border-dashed p-3">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Usuarios de prueba</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Solo en modo de datos de prueba. Contraseña: <code className="font-mono">{CLAVE_DE_PRUEBA}</code>
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {usuariosDePrueba.map((u) => (
                <Button
                  key={u.email}
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setValores({ email: u.email, password: CLAVE_DE_PRUEBA });
                    setErrores({});
                    setErrorGeneral('');
                  }}
                >
                  {ROLES[u.rol]}
                </Button>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <section className="hidden flex-col justify-between bg-sidebar p-10 text-sidebar-foreground lg:flex">
        <div className="flex items-center gap-2">
          <span className="grid size-9 place-items-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground">
            <Wrench className="size-5" aria-hidden="true" />
          </span>
          <span className="text-xl font-semibold tracking-tight">TecniFix</span>
        </div>
        <div className="max-w-md">
          <h1 className="text-3xl font-semibold leading-tight tracking-tight">
            Ventas e inventario de tu tienda de repuestos, en un solo lugar.
          </h1>
          <p className="mt-4 text-sidebar-foreground/70">
            Controla el stock de cada producto, registra las ventas con su boleta y revisa cuánto vendiste en el mes.
          </p>
        </div>
        <p className="text-sm text-sidebar-foreground/50">Desarrollo de Aplicaciones Web Avanzado · Tecsup</p>
      </section>
      <section className="flex items-center justify-center p-6">
        <Suspense fallback={null}>
          <FormularioLogin />
        </Suspense>
      </section>
    </div>
  );
}
