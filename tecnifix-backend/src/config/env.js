// Carga y centraliza las variables de entorno (.env) en un solo objeto.
// Cualquier otro archivo que necesite una variable de entorno la pide aquí,
// nunca lee process.env directamente fuera de este archivo.

require('dotenv').config();

const env = {
  port: process.env.PORT || 4000,
  nodeEnv: process.env.NODE_ENV || 'development',
  // Uno o varios orígenes separados por coma.
  corsOrigin: (process.env.CORS_ORIGIN || 'http://localhost:3000')
    .split(',')
    .map((origen) => origen.trim()),
  db: {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '1d',
  },
  // Opcional: sin estos datos la API funciona, pero no envía correos.
  correo: {
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    user: process.env.SMTP_USER,
    password: process.env.SMTP_PASSWORD,
    admin: process.env.CORREO_ADMIN,
  },
};

// Detiene el arranque si falta algo indispensable. La llama server.js (no se
// ejecuta al importar, para que las pruebas unitarias no necesiten .env).
env.validar = () => {
  const requeridas = ['JWT_SECRET', 'DB_HOST', 'DB_NAME', 'DB_USER'];

  const faltan = requeridas.filter((nombre) => !process.env[nombre]);
  if (faltan.length) {
    throw new Error(`Faltan variables de entorno: ${faltan.join(', ')}. Revisa tu .env`);
  }
};

module.exports = env;
