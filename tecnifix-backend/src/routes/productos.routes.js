// Rutas del dominio "productos". Todas exigen sesión: cualquier rol consulta;
// solo admin y almacenero crean, editan y desactivan.

const { Router } = require('express');
const productosController = require('../controllers/productos.controller');
const inventarioController = require('../controllers/inventario.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const inventarioValidator = require('../validators/inventario.validator');
const {
  validarProductoNuevo,
  validarProductoEditado,
  validarId,
  validarConsulta,
} = require('../validators/productos.validator');

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

router.get('/', validarConsulta, productosController.listar);
router.get('/:id', validarId, productosController.obtenerPorId);
router.get(
  '/:id/movimientos',
  puedeEditar,
  inventarioValidator.validarId,
  inventarioValidator.validarConsulta,
  inventarioController.listarMovimientos
);
router.post('/', puedeEditar, validarProductoNuevo, productosController.crear);
router.put('/:id', puedeEditar, validarId, validarProductoEditado, productosController.actualizar);
router.delete('/:id', puedeEditar, validarId, productosController.desactivar);

module.exports = router;
