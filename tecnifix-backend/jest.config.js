// Dos proyectos: "unit" no necesita base de datos; "integration" usa una base
// de pruebas aparte para no ensuciar la de desarrollo.

module.exports = {
  collectCoverageFrom: ['src/**/*.js', '!src/server.js', '!src/database/cli.js'],
  projects: [
    {
      displayName: 'unit',
      testEnvironment: 'node',
      testMatch: ['<rootDir>/tests/unit/**/*.test.js'],
      setupFiles: ['<rootDir>/tests/helpers/env-unit.js'],
      clearMocks: true,
    },
    {
      displayName: 'integration',
      testEnvironment: 'node',
      testMatch: ['<rootDir>/tests/integration/**/*.test.js'],
      setupFiles: ['<rootDir>/tests/helpers/env-integration.js'],
      globalSetup: '<rootDir>/tests/helpers/preparar-base.js',
    },
  ],
};
