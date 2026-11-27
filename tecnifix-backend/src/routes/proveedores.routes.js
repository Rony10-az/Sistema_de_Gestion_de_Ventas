// Rutas del dominio "proveedores". Todas exigen sesión: cualquier rol puede
// listar; solo admin y almacenero crean y editan.

const { Router } = require('express');
const proveedoresController = require('../controllers/proveedores.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const {
  validarProveedor,
  validarId,
  validarConsulta,
} = require('../validators/proveedores.validator');

// TODO: reemplazar por el middleware verificarRol cuando esté en middlewares/.
const soloRoles = (...roles) => (req, res, next) => {
  if (!roles.includes(req.usuario.rol)) {
    return res.status(403).json({ error: 'Tu rol no tiene permiso para esta acción' });
  }
  return next();
};

const puedeEditar = soloRoles('admin', 'almacenero');

const router = Router();

router.use(authMiddleware);

router.get('/', validarConsulta, proveedoresController.listar);
router.post('/', puedeEditar, validarProveedor, proveedoresController.crear);
router.put('/:id', puedeEditar, validarId, validarProveedor, proveedoresController.actualizar);

module.exports = router;
