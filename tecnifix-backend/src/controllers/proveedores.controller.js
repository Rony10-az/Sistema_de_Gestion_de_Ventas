// Controlador de "proveedores": traduce HTTP <-> service.
// Los datos llegan ya validados en res.locals (ver proveedores.validator.js).

const proveedoresService = require('../services/proveedores.service');

async function listar(req, res, next) {
  try {
    res.json(await proveedoresService.listar(res.locals.query));
  } catch (error) {
    next(error);
  }
}

async function crear(req, res, next) {
  try {
    res.status(201).json(await proveedoresService.crear(res.locals.body));
  } catch (error) {
    next(error);
  }
}

async function actualizar(req, res, next) {
  try {
    res.json(await proveedoresService.actualizar(res.locals.params.id, res.locals.body));
  } catch (error) {
    next(error);
  }
}

module.exports = { listar, crear, actualizar };
