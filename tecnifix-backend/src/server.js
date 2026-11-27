// Punto de entrada del backend: arranca el servidor HTTP.
// Mantenerlo separado de app.js permite importar `app` en los tests sin
// abrir un puerto real.

const app = require('./app');
const env = require('./config/env');

env.validar();

app.listen(env.port, () => {
  console.log(`API escuchando en http://localhost:${env.port}`);
});
