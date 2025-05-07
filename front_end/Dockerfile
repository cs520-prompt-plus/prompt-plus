# ───────────────────────────────────────────────
# Stage 0: Generate the JS Prisma Client only
# ───────────────────────────────────────────────
FROM node:20-slim AS gen-js

# (Needed for some Prisma binaries)
RUN apt-get update -y && apt-get install -y openssl

WORKDIR /prisma

# 1) Copy your schema and .env into /prisma
COPY prisma/schema.prisma ./
COPY .env                ./

# 2) Install Prisma CLI + runtime client
RUN npm install --quiet prisma@latest @prisma/client@latest

# 3) Run only the JS generator (skips Python)
RUN npx prisma generate \
      --schema=schema.prisma \
      --generator js

# ───────────────────────────────────────────────
# Stage 1: Build Next.js Dev Container
# ───────────────────────────────────────────────
FROM node:20-bullseye

RUN apt-get update -y && apt-get install -y openssl
WORKDIR /app

# 1) Copy & install your Next.js dependencies
COPY front_end/package*.json ./
RUN npm install

# 2) Copy your Next.js source files
COPY front_end/ ./

# 3) Pull in the pre-built JS Prisma client from stage 0
#    into the final node_modules layout so imports work.
COPY --from=gen-js /prisma/node_modules/.prisma/client ./node_modules/.prisma/client
COPY --from=gen-js /prisma/node_modules/@prisma/client ./node_modules/@prisma/client

EXPOSE 3000

# 4) Start the Next.js dev server
CMD ["npm", "run", "dev"]
