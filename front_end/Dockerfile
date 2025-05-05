# ── Stage 0: generate ONLY the JS Prisma client ───────────────────
FROM node:lts-alpine3.17 AS gen-js

RUN npm install -g prisma

WORKDIR /prisma
COPY prisma/schema.prisma ./
COPY prisma/.env          ./

# only runs the JS generator
RUN prisma generate --schema=schema.prisma --generator js

# ── Stage 1: build the Next.js dev image ─────────────────────────
FROM node:lts-alpine3.17
WORKDIR /app

# bring in the generated JS client
COPY --from=gen-js /prisma/node_modules/.prisma/client ./src/prisma

# install your frontend deps
COPY front_end/package*.json ./
RUN npm install

# copy your Next.js code
COPY front_end/ ./

EXPOSE 3000
CMD ["npm","run","dev"]
