// Layout raíz: envuelve TODA la app. Carga los estilos de Tailwind, la sesión
// (AuthProvider) y el contenedor de avisos (toast). El panel interno tiene su
// propio layout en src/app/(panel)/layout.js.

import '@fontsource-variable/outfit';
import '@fontsource-variable/nunito-sans';
import './globals.css';
import { AuthProvider } from '../context/AuthContext';
import { Toaster } from '../components/ui/sonner';

export const metadata = {
  title: {
    default: 'TecniFix',
    template: '%s | TecniFix',
  },
  description: 'Gestión de ventas e inventario para una tienda de repuestos y accesorios tecnológicos',
  // Es un sistema interno: los buscadores no deben indexarlo.
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className="fondo-resplandor">
        <AuthProvider>{children}</AuthProvider>
        <Toaster theme="dark" richColors position="top-right" />
      </body>
    </html>
  );
}
