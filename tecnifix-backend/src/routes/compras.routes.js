// Rutas del dominio "compras". Solo admin y almacenero.

const { Router } = require('express');
const comprasController = require('../controllers/compras.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const { validarCompra, validarId, validarConsulta } = require('../validators/compras.validator');

// TODO: reemplazar por el middleware verificarRol cuando esté en middlewares/.
const soloRoles = (...roles) => (req, res, next) => {
  if (!roles.includes(req.usuario.rol)) {
    return res.status(403).json({ error: 'Tu rol no tiene permiso para esta acción' });
  }
  return next();
};

const router = Router();

router.use(authMiddleware, soloRoles('admin', 'almacenero'));

router.get('/', validarConsulta, comprasController.listar);
router.get('/:id', validarId, comprasController.obtenerPorId);
router.post('/', validarCompra, comprasController.crear);

module.exports = router;
