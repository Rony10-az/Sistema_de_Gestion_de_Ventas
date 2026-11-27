// Carga el .env y apunta a la base de pruebas.
require('dotenv').config();

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'secreto-solo-para-pruebas';
process.env.DB_NAME = process.env.DB_NAME_TEST || 'tecnifix_test';
