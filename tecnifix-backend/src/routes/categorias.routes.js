// Rutas del dominio "categorias". Todas exigen sesión: cualquier rol puede
// listar; solo admin y almacenero crean y editan.

const { Router } = require('express');
const categoriasController = require('../controllers/categorias.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const {
  validarCategoria,
  validarId,
  validarConsulta,
} = require('../validators/categorias.validator');

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

router.get('/', validarConsulta, categoriasController.listar);
router.post('/', puedeEditar, validarCategoria, categoriasController.crear);
router.put('/:id', puedeEditar, validarId, validarCategoria, categoriasController.actualizar);

module.exports = router;
