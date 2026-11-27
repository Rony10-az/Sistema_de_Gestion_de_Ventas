const { firmarToken } = require('../../src/utils/jwt.util');

// Cabecera de autorización para probar rutas protegidas sin pasar por el login.
const autorizacion = (datos = {}) => `Bearer ${firmarToken({ id: 1, rol: 'admin', ...datos })}`;

module.exports = { autorizacion };
