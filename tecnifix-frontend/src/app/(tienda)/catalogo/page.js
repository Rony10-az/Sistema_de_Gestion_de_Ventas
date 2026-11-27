// /catalogo: todos los productos con filtros. Acepta ?categoria=slug y ?q=texto.

import { CatalogoCliente } from '../../../components/tienda/CatalogoCliente';

export const metadata = {
  title: 'Catálogo',
  description: 'Cargadores, cables, audio, periféricos, SSD, memorias, repuestos y herramientas con stock real.',
};

export default function CatalogoPage({ searchParams }) {
  const categoria = typeof searchParams?.categoria === 'string' ? searchParams.categoria : '';
  const q = typeof searchParams?.q === 'string' ? searchParams.q : '';
  return <CatalogoCliente categoriaInicial={categoria} busquedaInicial={q} />;
}
