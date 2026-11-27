FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY src ./src

USER node
EXPOSE 4000

# Aplica migraciones y datos de prueba pendientes antes de arrancar la API.
CMD ["sh", "-c", "node src/database/cli.js migrate && node src/database/cli.js seed && node src/server.js"]
