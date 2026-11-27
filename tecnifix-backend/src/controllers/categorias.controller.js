// Controlador de "categorias": traduce HTTP <-> service.
// Los datos llegan ya validados en res.locals (ver categorias.validator.js).

const categoriasService = require('../services/categorias.service');

async function listar(req, res, next) {
  try {
    res.json(await categoriasService.listar(res.locals.query));
  } catch (error) {
    next(error);
  }
}

async function crear(req, res, next) {
  try {
    res.status(201).json(await categoriasService.crear(res.locals.body));
  } catch (error) {
    next(error);
  }
}

async function actualizar(req, res, next) {
  try {
    res.json(await categoriasService.actualizar(res.locals.params.id, res.locals.body));
  } catch (error) {
    next(error);
  }
}

module.exports = { listar, crear, actualizar };
