// Rutas del dominio "clientes". Solo admin y vendedor; eliminar, solo admin.
// El almacenero no accede.

const { Router } = require('express');
const clientesController = require('../controllers/clientes.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const verificarRol = require('../middlewares/rol.middleware');
const {
  validarCliente,
  validarId,
  validarConsulta,
} = require('../validators/clientes.validator');

const router = Router();

router.use(authMiddleware, verificarRol('admin', 'vendedor'));

router.get('/', validarConsulta, clientesController.listar);
router.get('/:id', validarId, clientesController.obtenerPorId);
router.get('/:id/ventas', validarId, validarConsulta, clientesController.listarVentas);
router.post('/', validarCliente, clientesController.crear);
router.put('/:id', validarId, validarCliente, clientesController.actualizar);
router.delete('/:id', verificarRol('admin'), validarId, clientesController.eliminar);

module.exports = router;
