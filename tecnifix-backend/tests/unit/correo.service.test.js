// nodemailer se simula: ninguna prueba envía correos reales.

jest.mock('nodemailer', () => ({ createTransport: jest.fn() }), { virtual: true });
const nodemailer = require('nodemailer');
const env = require('../../src/config/env');
const { enviarAlertaStock } = require('../../src/services/correo.service');

const producto = { sku: 'MIC-1', nombre: 'Mica', stock: 2, stock_minimo: 3 };

describe('correo.service', () => {
  const sendMail = jest.fn();

  beforeEach(() => {
    jest.resetAllMocks();
    nodemailer.createTransport.mockReturnValue({ sendMail });
    Object.assign(env.correo, {
      host: 'smtp.example.com',
      port: 587,
      user: 'tienda@example.com',
      password: 'clave-de-prueba',
      admin: 'admin@example.com',
    });
  });

  test('envía la alerta al administrador', async () => {
    await expect(enviarAlertaStock(producto)).resolves.toBe(true);

    expect(sendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'admin@example.com',
        subject: 'Stock mínimo: Mica',
        text: expect.stringContaining('Stock actual: 2'),
      })
    );
  });

  test.each(['host', 'admin'])('sin %s no intenta enviar', async (dato) => {
    env.correo[dato] = '';

    await expect(enviarAlertaStock(producto)).resolves.toBe(false);
    expect(nodemailer.createTransport).not.toHaveBeenCalled();
  });

  test('si el envío falla devuelve false sin lanzar', async () => {
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    sendMail.mockRejectedValue(new Error('servidor caído'));

    await expect(enviarAlertaStock(producto)).resolves.toBe(false);
  });
});
