# prisma/Dockerfile
FROM node:lts-alpine3.17

# 1) Install Python + build tools for the Python generator
RUN apk add --no-cache python3 python3-dev py3-pip build-base libffi-dev openssl-dev

# 2) Install Prisma CLI v5.17.0 and Python plugin
RUN npm install -g prisma@5.17.0 \
 && pip3 install prisma

WORKDIR /app

# Copy your schema + .env
COPY schema.prisma ./
COPY .env          ./

# Default entrypoint does nothing; actual work happens via override in compose
CMD ["echo", "Ready to generate clients"]
