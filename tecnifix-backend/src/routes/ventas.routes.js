// Rutas del dominio "ventas": registrar una venta y consultarla.
// Solo admin y vendedor. El vendedor ve únicamente sus ventas (ventas.service).

const { Router } = require('express');
const ventasController = require('../controllers/ventas.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const verificarRol = require('../middlewares/rol.middleware');

const router = Router();

router.use(authMiddleware, verificarRol('admin', 'vendedor'));

router.get('/', ventasController.listar);
router.get('/:id', ventasController.obtenerPorId);
router.post('/', ventasController.crear);

module.exports = router;
