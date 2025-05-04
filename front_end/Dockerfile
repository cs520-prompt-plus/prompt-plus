FROM node:18-alpine

WORKDIR /app

# 1) Install deps
COPY package*.json ./
RUN npm install

# → NO `COPY ../prisma ./prisma` here

# 2) Dev already has prisma via volume
#    so you can skip prisma generate in build
#    (or keep it if you really want a generated copy baked in)

EXPOSE 3000
CMD ["npm", "run", "dev"]
