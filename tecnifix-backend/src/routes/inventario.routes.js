// Rutas del dominio "inventario". Solo el admin ajusta el stock.
// El kardex (GET /productos/:id/movimientos) se declara en productos.routes.js.

const { Router } = require('express');
const inventarioController = require('../controllers/inventario.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const { validarAjuste } = require('../validators/inventario.validator');

// TODO: reemplazar por el middleware verificarRol cuando esté en middlewares/.
const soloRoles = (...roles) => (req, res, next) => {
  if (!roles.includes(req.usuario.rol)) {
    return res.status(403).json({ error: 'Tu rol no tiene permiso para esta acción' });
  }
  return next();
};

const router = Router();

router.use(authMiddleware, soloRoles('admin'));

router.post('/ajustes', validarAjuste, inventarioController.ajustar);

module.exports = router;
