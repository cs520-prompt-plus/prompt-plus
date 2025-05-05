FROM node:lts-alpine3.17
RUN npm install -g prisma@5.17.0

WORKDIR /app
COPY schema.prisma ./
COPY .env          ./

ENTRYPOINT ["sh","-c"]
CMD ["prisma studio --schema=./schema.prisma --port=5555 --browser none"]
