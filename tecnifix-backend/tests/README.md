# Tests del backend

| Comando | Qué ejecuta | ¿Necesita base de datos? |
|---|---|---|
| `npm run test:unit` | Services y middlewares, con repositorios simulados | No |
| `npm run test:integration` | Rutas HTTP con Supertest | Sí |
| `npm test` | Todo | Sí |
| `npm run test:coverage` | Todo, con reporte de cobertura | Sí |
| `npm run test:watch` | Unitarias, repitiéndose al guardar | No |

Las de integración usan la base `tecnifix_test` (o `DB_NAME_TEST`), que se crea, migra
y carga sola. La conexión sale de tu `.env`, así que tu base de desarrollo no se toca.

Los `test.todo` son comportamientos del plan que aún no están programados.

Para probar a mano la API, ver la colección de Bruno en `../bruno/`.
