FROM node:lts-alpine3.17

# install the Prisma CLI
RUN npm install -g prisma@5.17.0

WORKDIR /app

COPY prisma/schema.prisma ./
COPY prisma/.env          ./

ENTRYPOINT ["sh","-c"]
CMD ["prisma studio --schema=./schema.prisma --port=5555 --browser none"]
