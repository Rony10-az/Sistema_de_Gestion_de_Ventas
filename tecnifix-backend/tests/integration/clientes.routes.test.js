// Clientes contra la base de pruebas. Monta solo su router para no depender
// del orden de registro en routes/index.js.

const express = require('express');
const request = require('supertest');
const pool = require('../../src/config/database');
const router = require('../../src/routes/clientes.routes');
const errorMiddleware = require('../../src/middlewares/error.middleware');
const { autorizacion } = require('../helpers/token');

const app = express();
app.use(express.json());
app.use('/clientes', router);
app.use(errorMiddleware);

// Cierra las conexiones para que Jest pueda terminar.
afterAll(() => pool.end());

describe('clientes contra la base', () => {
  const marca = Date.now();
  // Documento de 8 dígitos único por ejecución.
  const documento = String(marca).slice(-8);
  const auth = autorizacion({ rol: 'admin' });
  const datos = {
    tipo_documento: 'DNI',
    documento,
    nombre: `Cliente ${marca}`,
    telefono: '900000000',
    email: 'c@example.com',
    direccion: 'Calle 1',
  };
  let id;

  const crear = (cuerpo, cabecera = auth) =>
    request(app).post('/clientes').set('Authorization', cabecera).send(cuerpo);

  afterAll(async () => {
    if (id) {
      await pool.query('DELETE FROM ventas WHERE cliente_id = $1', [id]);
      await pool.query('DELETE FROM clientes WHERE id = $1', [id]);
    }
  });

  test('GET /clientes exige sesión', async () => {
    const res = await request(app).get('/clientes');
    expect(res.status).toBe(401);
  });

  test('crea un cliente con tipo de documento y dirección, y lo encuentra al buscar', async () => {
    const res = await crear(datos);

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject(datos);
    id = res.body.id;

    const lista = await request(app)
      .get('/clientes')
      .query({ buscar: documento })
      .set('Authorization', auth);
    expect(lista.body).toEqual({ data: [{ id, ...datos }], total: 1, pagina: 1, limite: 10 });

    const porNombre = await request(app)
      .get('/clientes')
      .query({ buscar: `cliente ${marca}` })
      .set('Authorization', auth);
    expect(porNombre.body.total).toBe(1);
  });

  test('consulta por id', async () => {
    const res = await request(app).get(`/clientes/${id}`).set('Authorization', auth);

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ id, tipo_documento: 'DNI', direccion: 'Calle 1' });
  });

  test('no repite el documento', async () => {
    const res = await crear({ ...datos, nombre: 'Otro cliente' });

    expect(res.status).toBe(409);
  });

  test('actualiza, conservando su propio documento', async () => {
    const res = await request(app)
      .put(`/clientes/${id}`)
      .set('Authorization', auth)
      .send({ ...datos, telefono: '911111111' });

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ id, telefono: '911111111' });
  });

  test('rechaza editar con el documento de otro cliente', async () => {
    const otroDoc = String(marca + 1).slice(-8);
    const otro = await crear({ ...datos, documento: otroDoc, nombre: `Otro ${marca}` });
    expect(otro.status).toBe(201);

    const res = await request(app)
      .put(`/clientes/${otro.body.id}`)
      .set('Authorization', auth)
      .send({ ...datos, documento });
    expect(res.status).toBe(409);

    await request(app).delete(`/clientes/${otro.body.id}`).set('Authorization', auth);
  });

  test('responde 404 si no existe', async () => {
    const res = await request(app).get('/clientes/2147483647').set('Authorization', auth);

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: 'Cliente no encontrado' });
  });

  test('busca los comodines como texto normal', async () => {
    const res = await request(app)
      .get('/clientes')
      .query({ buscar: `%${marca}` })
      .set('Authorization', auth);

    expect(res.body.total).toBe(0);
  });

  describe('historial de ventas', () => {
    let vendedores;

    beforeAll(async () => {
      const { rows } = await pool.query('SELECT id FROM usuarios ORDER BY id LIMIT 2');
      vendedores = rows.map((fila) => fila.id);
      const insertar = (vendedorId, serie, total, fecha) =>
        pool.query(
          `INSERT INTO ventas (cliente_id, vendedor_id, serie_numero, tipo_comprobante, total, fecha)
           VALUES ($1, $2, $3, 'boleta', $4, $5)`,
          [id, vendedorId, `T${marca}-${serie}`, total, fecha]
        );
      await insertar(vendedores[0], 1, 10.5, '2026-01-01T10:00:00');
      await insertar(vendedores[1], 2, 20, '2026-02-01T10:00:00');
    });

    test('el admin ve todas, de la más reciente a la más antigua', async () => {
      const res = await request(app).get(`/clientes/${id}/ventas`).set('Authorization', auth);

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({ total: 2, pagina: 1, limite: 10 });
      expect(res.body.data.map((venta) => venta.serie_numero)).toEqual([
        `T${marca}-2`,
        `T${marca}-1`,
      ]);
      expect(res.body.data[1]).toEqual({
        id: expect.any(Number),
        serie_numero: `T${marca}-1`,
        tipo_comprobante: 'boleta',
        total: 10.5,
        estado: 'pagada',
        fecha: expect.any(String),
      });
    });

    test('el vendedor solo ve las suyas', async () => {
      const res = await request(app)
        .get(`/clientes/${id}/ventas`)
        .set('Authorization', autorizacion({ rol: 'vendedor', id: vendedores[0] }));

      expect(res.body.total).toBe(1);
      expect(res.body.data[0].serie_numero).toBe(`T${marca}-1`);
    });

    test('pagina el historial', async () => {
      const res = await request(app)
        .get(`/clientes/${id}/ventas`)
        .query({ pagina: 2, limite: 1 })
        .set('Authorization', auth);

      expect(res.body).toMatchObject({ total: 2, pagina: 2, limite: 1 });
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].serie_numero).toBe(`T${marca}-1`);
    });

    test('no deja borrar un cliente con ventas', async () => {
      const res = await request(app).delete(`/clientes/${id}`).set('Authorization', auth);

      expect(res.status).toBe(409);
    });
  });

  test('solo el admin borra', async () => {
    const vendedor = autorizacion({ rol: 'vendedor' });
    const nuevo = await crear({ ...datos, documento: String(marca + 2).slice(-8) }, vendedor);
    expect(nuevo.status).toBe(201);

    const prohibido = await request(app)
      .delete(`/clientes/${nuevo.body.id}`)
      .set('Authorization', vendedor);
    expect(prohibido.status).toBe(403);

    const borrado = await request(app)
      .delete(`/clientes/${nuevo.body.id}`)
      .set('Authorization', auth);
    expect(borrado.status).toBe(204);
  });
});
