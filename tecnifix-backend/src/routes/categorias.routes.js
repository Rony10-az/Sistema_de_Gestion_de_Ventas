// Rutas del dominio "categorias". Todas exigen sesión: cualquier rol puede
// listar; solo admin y almacenero crean y editan.

const { Router } = require('express');
const categoriasController = require('../controllers/categorias.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const verificarRol = require('../middlewares/rol.middleware');
const {
  validarCategoria,
  validarId,
  validarConsulta,
} = require('../validators/categorias.validator');

const puedeEditar = verificarRol('admin', 'almacenero');

const router = Router();

router.use(authMiddleware);

router.get('/', validarConsulta, categoriasController.listar);
router.post('/', puedeEditar, validarCategoria, categoriasController.crear);
router.put('/:id', puedeEditar, validarId, validarCategoria, categoriasController.actualizar);

module.exports = router;
