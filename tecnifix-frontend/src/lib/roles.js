// Roles del sistema y menú del panel. Es la única fuente para saber
// qué ve cada rol: el menú lateral se arma con MENU y el layout del panel
// usa puedeVer() para bloquear las páginas que el rol no puede usar.
// Debe coincidir con verificarRol() del backend (ver AGENTS.md).

export const ROLES = {
  admin: 'Administrador',
  vendedor: 'Vendedor',
  almacenero: 'Almacenero',
};

const TODOS = ['admin', 'vendedor', 'almacenero'];

export const MENU = [
  {
    grupo: 'General',
    items: [{ href: '/dashboard', texto: 'Dashboard', icono: 'dashboard', roles: TODOS }],
  },
  {
    grupo: 'Inventario',
    items: [
      { href: '/productos', texto: 'Productos', icono: 'productos', roles: TODOS },
      { href: '/categorias', texto: 'Categorías', icono: 'categorias', roles: ['admin', 'almacenero'] },
      { href: '/proveedores', texto: 'Proveedores', icono: 'proveedores', roles: ['admin', 'almacenero'] },
      { href: '/compras', texto: 'Compras', icono: 'compras', roles: ['admin', 'almacenero'] },
    ],
  },
  {
    grupo: 'Ventas',
    items: [
      { href: '/ventas', texto: 'Ventas', icono: 'ventas', roles: ['admin', 'vendedor'] },
      { href: '/clientes', texto: 'Clientes', icono: 'clientes', roles: ['admin', 'vendedor'] },
      { href: '/reportes', texto: 'Reportes', icono: 'reportes', roles: ['admin'] },
    ],
  },
  {
    grupo: 'Administración',
    items: [{ href: '/usuarios', texto: 'Usuarios', icono: 'usuarios', roles: ['admin'] }],
  },
];

// Menú filtrado para un rol, sin grupos vacíos.
export function menuParaRol(rol) {
  return MENU.map((g) => ({ ...g, items: g.items.filter((i) => i.roles.includes(rol)) })).filter(
    (g) => g.items.length > 0,
  );
}

// ¿Puede este rol abrir esta ruta? Las rutas que no están en el menú se permiten.
export function puedeVer(pathname, rol) {
  const item = MENU.flatMap((g) => g.items).find((i) => pathname === i.href || pathname.startsWith(`${i.href}/`));
  return item ? item.roles.includes(rol) : true;
}
