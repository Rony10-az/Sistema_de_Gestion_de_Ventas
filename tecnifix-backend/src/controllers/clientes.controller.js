// Controlador de "clientes": traduce HTTP <-> service.
// Los datos llegan ya validados en res.locals (ver clientes.validator.js).

const clientesService = require('../services/clientes.service');

async function listar(req, res, next) {
  try {
    res.json(await clientesService.listar(res.locals.query));
  } catch (error) {
    next(error);
  }
}

async function obtenerPorId(req, res, next) {
  try {
    res.json(await clientesService.obtenerPorId(res.locals.params.id));
  } catch (error) {
    next(error);
  }
}

async function listarVentas(req, res, next) {
  try {
    res.json(
      await clientesService.listarVentas(res.locals.params.id, req.usuario, res.locals.query)
    );
  } catch (error) {
    next(error);
  }
}

async function crear(req, res, next) {
  try {
    res.status(201).json(await clientesService.crear(res.locals.body));
  } catch (error) {
    next(error);
  }
}

async function actualizar(req, res, next) {
  try {
    res.json(await clientesService.actualizar(res.locals.params.id, res.locals.body));
  } catch (error) {
    next(error);
  }
}

async function eliminar(req, res, next) {
  try {
    await clientesService.eliminar(res.locals.params.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

module.exports = { listar, obtenerPorId, listarVentas, crear, actualizar, eliminar };
