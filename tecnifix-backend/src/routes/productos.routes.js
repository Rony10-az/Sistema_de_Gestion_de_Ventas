// Rutas del dominio "productos". Todas exigen sesión: cualquier rol consulta;
// solo admin y almacenero crean, editan y desactivan.

const { Router } = require('express');
const productosController = require('../controllers/productos.controller');
const inventarioController = require('../controllers/inventario.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const verificarRol = require('../middlewares/rol.middleware');
const inventarioValidator = require('../validators/inventario.validator');
const {
  validarProductoNuevo,
  validarProductoEditado,
  validarId,
  validarConsulta,
} = require('../validators/productos.validator');

const puedeEditar = verificarRol('admin', 'almacenero');

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
