// Layout de la tienda pública (portada, catálogo y ficha de producto):
// cabecera con mega menú, carrito lateral y pie. El panel interno usa (panel)/layout.js.

import { CarritoProvider } from '../../context/CarritoContext';
import { Cabecera } from '../../components/tienda/Cabecera';
import { CarritoLateral } from '../../components/tienda/CarritoLateral';
import { Flotantes } from '../../components/tienda/Flotantes';
import { PieTienda } from '../../components/tienda/PieTienda';

export default function TiendaLayout({ children }) {
  return (
    <CarritoProvider>
      <a
        href="#contenido-tienda"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-primary focus:px-4 focus:py-2 focus:text-white"
      >
        Saltar al contenido
      </a>
      <Cabecera />
      <main id="contenido-tienda">{children}</main>
      <PieTienda />
      <CarritoLateral />
      <Flotantes />
    </CarritoProvider>
  );
}
