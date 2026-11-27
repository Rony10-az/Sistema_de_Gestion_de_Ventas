// Controlador de "productos": traduce HTTP <-> service.
// Los datos llegan ya validados en res.locals (ver productos.validator.js).

const productosService = require('../services/productos.service');

// El error central todavía no envía "campos", así que se responde aquí.
function fallar(error, res, next) {
  if (error.campos) {
    return res.status(error.status).json({ error: error.message, campos: error.campos });
  }
  return next(error);
}

async function listar(req, res, next) {
  try {
    res.json(await productosService.listar(res.locals.query, req.usuario));
  } catch (error) {
    next(error);
  }
}

async function obtenerPorId(req, res, next) {
  try {
    res.json(await productosService.obtenerPorId(res.locals.params.id, req.usuario));
  } catch (error) {
    next(error);
  }
}

async function crear(req, res, next) {
  try {
    res.status(201).json(await productosService.crear(res.locals.body, req.usuario));
  } catch (error) {
    fallar(error, res, next);
  }
}

async function actualizar(req, res, next) {
  try {
    const { id } = res.locals.params;
    res.json(await productosService.actualizar(id, res.locals.body, req.usuario));
  } catch (error) {
    fallar(error, res, next);
  }
}

async function desactivar(req, res, next) {
  try {
    await productosService.desactivar(res.locals.params.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

module.exports = { listar, obtenerPorId, crear, actualizar, desactivar };
