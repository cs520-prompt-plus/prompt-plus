FROM node:lts-alpine3.17

WORKDIR /app

RUN npm install -g prisma

# Copy schema and env from prisma folder
COPY . .

# Set environment explicitly (optional but safe)
ENV DOTENV_CONFIG_PATH=.env

# Run generate and push
CMD ["sh", "-c", "prisma generate --schema=schema.prisma && prisma db push --schema=schema.prisma"]
