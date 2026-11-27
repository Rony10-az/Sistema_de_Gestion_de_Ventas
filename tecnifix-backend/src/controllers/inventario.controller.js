// Controlador de "inventario": traduce HTTP <-> service.
// Los datos llegan ya validados en res.locals (ver inventario.validator.js).

const inventarioService = require('../services/inventario.service');

async function ajustar(req, res, next) {
  try {
    res.status(201).json(await inventarioService.ajustar(res.locals.body, req.usuario));
  } catch (error) {
    next(error);
  }
}

async function listarMovimientos(req, res, next) {
  try {
    const { id } = res.locals.params;
    res.json(await inventarioService.listarMovimientos(id, res.locals.query));
  } catch (error) {
    next(error);
  }
}

module.exports = { ajustar, listarMovimientos };
