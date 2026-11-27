// Rutas del dominio "compras". Solo admin y almacenero.

const { Router } = require('express');
const comprasController = require('../controllers/compras.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const verificarRol = require('../middlewares/rol.middleware');
const { validarCompra, validarId, validarConsulta } = require('../validators/compras.validator');

const router = Router();

router.use(authMiddleware, verificarRol('admin', 'almacenero'));

router.get('/', validarConsulta, comprasController.listar);
router.get('/:id', validarId, comprasController.obtenerPorId);
router.post('/', validarCompra, comprasController.crear);

module.exports = router;
