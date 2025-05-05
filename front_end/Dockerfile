# Stage 0: generate ONLY the JS client
FROM node:lts-alpine3.17 AS gen-js

RUN npm install -g prisma

WORKDIR /prisma
COPY prisma/schema.prisma ./
COPY prisma/.env          ./

RUN prisma generate --schema=schema.prisma --generator js

# Stage 1: build Next.js dev container
FROM node:lts-alpine3.17
WORKDIR /app

COPY --from=gen-js /prisma/node_modules/.prisma/client ./src/prisma

COPY front_end/package*.json ./
RUN npm install

COPY front_end/ ./

EXPOSE 3000
CMD ["npm","run","dev"]
