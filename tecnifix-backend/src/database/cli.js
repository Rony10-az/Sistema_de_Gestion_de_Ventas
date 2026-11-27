// Herramienta de base de datos. Se usa con los scripts de package.json:
//   npm run env:init    crea .env desde .env.example
//   npm run db:check    prueba la conexión
//   npm run db:create   crea la base local si no existe
//   npm run db:migrate  aplica las migraciones pendientes
//   npm run db:seed     carga los datos de prueba pendientes

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

const RAIZ = path.join(__dirname, '..', '..');

function envInit() {
  const destino = path.join(RAIZ, '.env');
  if (fs.existsSync(destino)) {
    console.log('.env ya existe, no se modifica.');
    return;
  }
  const contenido = fs
    .readFileSync(path.join(RAIZ, '.env.example'), 'utf8')
    .replace(/^JWT_SECRET=.*$/m, `JWT_SECRET=${crypto.randomBytes(32).toString('hex')}`);
  fs.writeFileSync(destino, contenido);
  console.log('.env creado. Revisa DB_PASSWORD antes de continuar.');
}

async function check() {
  const pool = require('../config/database');
  try {
    const { rows } = await pool.query('SELECT current_database() AS base, version() AS version');
    console.log(`Conexión correcta a "${rows[0].base}" (${rows[0].version.split(',')[0]})`);
  } finally {
    await pool.end();
  }
}

async function create() {
  const env = require('../config/env');
  // Se conecta a la base "postgres", que siempre existe, para crear la nuestra.
  const { host, port, user, password, database } = env.db;
  const client = new Client({ host, port, user, password, database: 'postgres' });
  await client.connect();
  try {
    const { rowCount } = await client.query('SELECT 1 FROM pg_database WHERE datname = $1', [database]);
    if (rowCount) {
      console.log(`La base "${database}" ya existe.`);
    } else {
      await client.query(`CREATE DATABASE ${client.escapeIdentifier(database)}`);
      console.log(`Base "${database}" creada.`);
    }
  } finally {
    await client.end();
  }
}

// Ejecuta en orden los .sql de una carpeta que aún no estén registrados.
// Cada archivo corre en su propia transacción: se aplica completo o nada.
async function aplicar(carpeta) {
  const pool = require('../config/database');
  const client = await pool.connect().catch(async (error) => {
    await pool.end();
    throw error;
  });
  try {
    await client.query(`CREATE TABLE IF NOT EXISTS schema_migrations (
      nombre TEXT PRIMARY KEY,
      aplicado_en TIMESTAMP NOT NULL DEFAULT NOW()
    )`);
    const { rows } = await client.query('SELECT nombre FROM schema_migrations');
    const hechos = new Set(rows.map((fila) => fila.nombre));
    const directorio = path.join(__dirname, carpeta);
    const pendientes = fs
      .readdirSync(directorio)
      .filter((archivo) => archivo.endsWith('.sql') && !hechos.has(`${carpeta}/${archivo}`))
      .sort();

    if (!pendientes.length) console.log(`${carpeta}: nada pendiente.`);

    for (const archivo of pendientes) {
      try {
        await client.query('BEGIN');
        await client.query(fs.readFileSync(path.join(directorio, archivo), 'utf8'));
        await client.query('INSERT INTO schema_migrations (nombre) VALUES ($1)', [`${carpeta}/${archivo}`]);
        await client.query('COMMIT');
        console.log(`${carpeta}: aplicado ${archivo}`);
      } catch (error) {
        await client.query('ROLLBACK');
        throw new Error(`${archivo}: ${error.message}`);
      }
    }
  } finally {
    client.release();
    await pool.end();
  }
}

const comandos = {
  'env-init': envInit,
  check,
  create,
  migrate: () => aplicar('migrations'),
  seed: () => aplicar('seeds'),
};

async function main() {
  const comando = comandos[process.argv[2]];
  if (!comando) throw new Error(`Usa uno de: ${Object.keys(comandos).join(', ')}`);
  await comando();
}

main().catch((error) => {
  console.error('Error:', error.message || error.code);
  process.exitCode = 1;
});
