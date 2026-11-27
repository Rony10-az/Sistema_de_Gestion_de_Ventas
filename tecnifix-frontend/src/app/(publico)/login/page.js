'use client';

// Página /login: correo y contraseña. Valida en el navegador (el backend vuelve
// a validar), muestra el error de la API y, si todo va bien, entra al panel.
// Con datos de prueba activos muestra los usuarios de prueba de cada rol.

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Eye, EyeOff, LoaderCircle, Wrench } from 'lucide-react';
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
    <Card className="relative w-full max-w-md overflow-hidden">
      <span className="degradado-marca absolute inset-x-0 top-0 h-px opacity-80" aria-hidden="true" />
      <CardHeader>
        <CardTitle className="text-2xl text-white">Iniciar sesión</CardTitle>
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
          <Button type="submit" size="lg" disabled={enviando} className="mt-2 w-full">
            {enviando && <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />}
            {enviando ? 'Ingresando…' : 'Ingresar'}
          </Button>
        </form>

        {USAR_MOCKS && (
          <div className="mt-6 rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-4">
            <p className="etiqueta text-[0.65rem]">Usuarios de prueba</p>
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

// Frases de la cinta superior (se duplican para que el desplazamiento sea continuo).
const CINTA = [
  'Stock al día en cada venta',
  'Boleta y factura con IGV 18 %',
  'Kardex de cada producto',
  'Alertas de stock mínimo',
  'Reportes de ventas por día y por mes',
];

const VENTAJAS = [
  'Cada venta descuenta el stock sola',
  'Compras a proveedores que suben el stock',
  'Un menú distinto para cada rol',
];

function Cinta() {
  const fila = (oculta) => (
    <ul className="flex shrink-0 items-center" aria-hidden={oculta || undefined}>
      {CINTA.map((texto) => (
        <li key={texto} className="flex items-center gap-6 pr-6 font-mono text-[0.72rem] uppercase tracking-[0.16em] text-muted-foreground">
          <span className="size-1.5 rotate-45 bg-primary" aria-hidden="true" />
          {texto}
        </li>
      ))}
    </ul>
  );
  return (
    <div className="overflow-hidden border-b border-white/[0.06] bg-black/40 py-2.5 [mask-image:linear-gradient(90deg,transparent,#000_10%,#000_90%,transparent)]">
      <div className="cinta">
        {fila(false)}
        {fila(true)}
      </div>
    </div>
  );
}

export default function LoginPage() {
  const retraso = (n) => ({ animationDelay: `${n * 90}ms` });

  return (
    <div className="flex min-h-screen flex-col">
      <Cinta />

      <div className="mx-auto grid w-full max-w-6xl flex-1 items-center gap-12 px-5 py-10 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16 lg:px-8">
        <section className="flex flex-col gap-7">
          <div className="flex animate-aparecer flex-wrap items-center justify-between gap-4" style={retraso(0)}>
            <Link href="/" className="flex items-center gap-2.5" aria-label="TecniFix, ir a la tienda">
              <span className="degradado-marca grid size-10 place-items-center rounded-xl shadow-brillo">
                <Wrench className="size-5 text-white" aria-hidden="true" />
              </span>
              <span className="font-display text-2xl font-semibold tracking-tight text-white">
                Tecni<span className="texto-marca">Fix</span>
              </span>
            </Link>
            <Link href="/" className="etiqueta inline-flex items-center gap-2 text-[0.62rem] hover:text-white">
              <ArrowLeft className="size-3.5" aria-hidden="true" /> Volver a la tienda
            </Link>
          </div>

          <p
            className="etiqueta inline-flex w-fit animate-aparecer items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3.5 py-1.5"
            style={retraso(1)}
          >
            <span className="size-1.5 animate-respirar rounded-full bg-primary" aria-hidden="true" />
            Ventas e inventario · Repuestos y accesorios
          </p>

          <div className="flex animate-aparecer flex-col gap-5" style={retraso(2)}>
            <h1 className="font-display text-4xl font-bold uppercase leading-[1.02] tracking-tight text-white sm:text-5xl lg:text-6xl">
              Tu stock.
              <br />
              Tus ventas.
              <br />
              <span className="texto-marca">Bajo control.</span>
            </h1>
            <span className="linea-guiones" aria-hidden="true" />
          </div>

          <p className="max-w-[46ch] animate-aparecer text-base leading-relaxed text-muted-foreground" style={retraso(3)}>
            Controla el stock de cada repuesto, registra las ventas con su boleta y revisa cuánto vendiste en el mes,
            desde un solo lugar.
          </p>

          <ul className="flex animate-aparecer flex-col gap-3" style={retraso(4)}>
            {VENTAJAS.map((texto) => (
              <li key={texto} className="flex items-center gap-3 text-sm text-foreground/90">
                <span className="grid size-6 place-items-center rounded-full border border-primary/40 bg-primary/10 text-accent-foreground">
                  <svg viewBox="0 0 24 24" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="3" aria-hidden="true">
                    <path d="m5 12.5 4.5 4.5L19 7.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                {texto}
              </li>
            ))}
          </ul>
        </section>

        <section className="flex animate-aparecer justify-center lg:justify-end" style={retraso(3)}>
          <Suspense fallback={null}>
            <FormularioLogin />
          </Suspense>
        </section>
      </div>

      <p className="etiqueta px-5 pb-6 text-center text-[0.62rem] text-muted-foreground/60">
        Desarrollo de Aplicaciones Web Avanzado · Tecsup · 2026
      </p>
    </div>
  );
}
