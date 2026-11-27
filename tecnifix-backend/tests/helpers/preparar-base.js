// Antes de las pruebas de integración: crea, migra y carga la base de pruebas.
// Solo aplica lo pendiente, así que las siguientes ejecuciones son rápidas.

const { execFileSync } = require('child_process');
const path = require('path');

module.exports = async () => {
  require('./env-integration');
  const cli = path.join(__dirname, '..', '..', 'src', 'database', 'cli.js');
  for (const comando of ['create', 'migrate', 'seed']) {
    execFileSync(process.execPath, [cli, comando], { stdio: 'pipe', env: process.env });
  }
};
