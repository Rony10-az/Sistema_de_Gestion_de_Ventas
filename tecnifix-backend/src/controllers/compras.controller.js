// Controlador de "compras": traduce HTTP <-> service.
// Los datos llegan ya validados en res.locals (ver compras.validator.js).

const comprasService = require('../services/compras.service');

async function listar(req, res, next) {
  try {
    res.json(await comprasService.listar(res.locals.query));
  } catch (error) {
    next(error);
  }
}

async function obtenerPorId(req, res, next) {
  try {
    res.json(await comprasService.obtenerPorId(res.locals.params.id));
  } catch (error) {
    next(error);
  }
}

async function crear(req, res, next) {
  try {
    res.status(201).json(await comprasService.crear(res.locals.body, req.usuario));
  } catch (error) {
    // El error central todavía no envía "campos", así que se responde aquí.
    if (error.campos) {
      return res.status(error.status).json({ error: error.message, campos: error.campos });
    }
    next(error);
  }
}

module.exports = { listar, obtenerPorId, crear };
