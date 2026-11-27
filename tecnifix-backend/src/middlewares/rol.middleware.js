// Comprueba que el usuario autenticado tenga uno de los roles permitidos.
// Va siempre después de auth.middleware, que es quien llena req.usuario:
//   router.post('/', authMiddleware, verificarRol('admin'), controlador.crear);
// Sin sesión responde 401; con un rol no permitido, 403.

const ROLES = ['admin', 'vendedor', 'almacenero'];

function verificarRol(...permitidos) {
  // Un rol mal escrito en una ruta debe notarse al arrancar, no en producción.
  const desconocidos = permitidos.filter((rol) => !ROLES.includes(rol));
  if (!permitidos.length || desconocidos.length) {
    throw new Error(`verificarRol: roles no válidos (${desconocidos.join(', ') || 'ninguno'})`);
  }

  return (req, res, next) => {
    if (!req.usuario) {
      return res.status(401).json({ error: 'Token no proporcionado' });
    }
    if (!permitidos.includes(req.usuario.rol)) {
      return res.status(403).json({ error: 'Tu rol no tiene permiso para esta acción' });
    }
    return next();
  };
}

module.exports = verificarRol;
