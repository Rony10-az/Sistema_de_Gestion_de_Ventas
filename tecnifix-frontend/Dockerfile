FROM node:22-alpine
WORKDIR /app

# Con package-lock.json instala las versiones exactas.
COPY package*.json ./
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi

COPY . .

# Next.js fija las variables NEXT_PUBLIC_* al compilar.
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_USE_MOCKS=false
ENV NEXT_PUBLIC_USE_MOCKS=$NEXT_PUBLIC_USE_MOCKS
RUN npm run build && chown -R node:node .next

ENV NODE_ENV=production
USER node
EXPOSE 3000
CMD ["npm", "start"]
