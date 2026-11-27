// Rutas del dominio "inventario". Solo el admin ajusta el stock.
// El kardex (GET /productos/:id/movimientos) se declara en productos.routes.js.

const { Router } = require('express');
const inventarioController = require('../controllers/inventario.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const verificarRol = require('../middlewares/rol.middleware');
const { validarAjuste } = require('../validators/inventario.validator');

const router = Router();

router.use(authMiddleware, verificarRol('admin'));

router.post('/ajustes', validarAjuste, inventarioController.ajustar);

module.exports = router;
