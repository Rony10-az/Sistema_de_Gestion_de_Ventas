// Envío de correos con nodemailer. Un fallo aquí nunca interrumpe la operación
// que pidió el aviso: se anota y se devuelve false.

const env = require('../config/env');

const configurado = () => Boolean(env.correo.host && env.correo.admin);

async function enviarAlAdministrador({ asunto, texto }) {
  if (!configurado()) return false;

  try {
    // Se carga solo cuando se va a enviar: sin correo configurado no hace falta.
    const nodemailer = require('nodemailer');
    const { host, port, user, password, admin } = env.correo;
    const transporte = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: user ? { user, pass: password } : undefined,
    });
    await transporte.sendMail({ from: user || admin, to: admin, subject: asunto, text: texto });
    return true;
  } catch (error) {
    console.warn('No se pudo enviar el correo:', error.message);
    return false;
  }
}

function enviarAlertaStock({ sku, nombre, stock, stock_minimo }) {
  return enviarAlAdministrador({
    asunto: `Stock mínimo: ${nombre}`,
    texto: [
      'Un producto llegó a su stock mínimo.',
      '',
      `Producto: ${nombre} (${sku})`,
      `Stock actual: ${stock}`,
      `Stock mínimo: ${stock_minimo}`,
    ].join('\n'),
  });
}

module.exports = { enviarAlertaStock };
