// Pool de conexiones a PostgreSQL. Todos los repositorios importan este pool
// para ejecutar queries; ningún otro archivo debe crear su propia conexión.

const { Pool } = require('pg');
const env = require('./env');

const pool = new Pool({
  host: env.db.host,
  port: env.db.port,
  database: env.db.database,
  user: env.db.user,
  password: env.db.password,
});

// Sin este manejador, un corte en una conexión inactiva tumba el proceso.
pool.on('error', (error) => console.error('Error en PostgreSQL:', error.message));

module.exports = pool;
