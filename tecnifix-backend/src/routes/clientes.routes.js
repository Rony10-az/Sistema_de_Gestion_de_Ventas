// Rutas del dominio "clientes". Solo admin y vendedor; eliminar, solo admin.

const { Router } = require('express');
const clientesController = require('../controllers/clientes.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const verificarRol = require('../middlewares/rol.middleware');

const router = Router();

router.use(authMiddleware, verificarRol('admin', 'vendedor'));

router.get('/', clientesController.listar);
router.get('/:id', clientesController.obtenerPorId);
router.post('/', clientesController.crear);
router.put('/:id', clientesController.actualizar);
router.delete('/:id', verificarRol('admin'), clientesController.eliminar);

module.exports = router;
