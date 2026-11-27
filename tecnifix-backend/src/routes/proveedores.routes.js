// Rutas del dominio "proveedores". Todas exigen sesión: cualquier rol puede
// listar; solo admin y almacenero crean y editan.

const { Router } = require('express');
const proveedoresController = require('../controllers/proveedores.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const verificarRol = require('../middlewares/rol.middleware');
const {
  validarProveedor,
  validarId,
  validarConsulta,
} = require('../validators/proveedores.validator');

const puedeEditar = verificarRol('admin', 'almacenero');

const router = Router();

router.use(authMiddleware);

router.get('/', validarConsulta, proveedoresController.listar);
router.post('/', puedeEditar, validarProveedor, proveedoresController.crear);
router.put('/:id', puedeEditar, validarId, validarProveedor, proveedoresController.actualizar);

module.exports = router;
