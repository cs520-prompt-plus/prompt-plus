FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy Prisma schema (if needed at runtime)
COPY ../prisma ./prisma

# Install Prisma CLI and generate client (only if not generated already)
RUN npm install prisma @prisma/client
RUN npx prisma generate --schema=./prisma/schema.prisma

# Install dev tools if needed
RUN npm install --save-dev typescript

EXPOSE 3000

CMD ["npm", "run", "dev"]
