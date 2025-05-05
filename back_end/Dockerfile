# ── Stage 0: generate & vendor Python Prisma client ─────────────────
FROM node:lts-alpine3.17 AS gen-python

RUN apk add --no-cache python3 py3-pip build-base libffi-dev openssl-dev \
 && pip3 install prisma

WORKDIR /prisma
COPY prisma/schema.prisma ./
COPY prisma/.env          ./

# only runs the python generator (which also vendors the engine)
RUN python3 -m prisma generate --schema=schema.prisma

# ── Stage 1: build FastAPI image with that client ─────────────────
FROM ghcr.io/owl-corp/python-poetry-base:3.11-slim
WORKDIR /app

# install your Python deps
COPY back_end/pyproject.toml back_end/poetry.lock ./
RUN poetry install --no-root

# pull in the generated Python client (with engine) as /app/prisma-client-py
COPY --from=gen-python /prisma/prisma-client-py ./prisma-client-py

# copy your FastAPI code
COPY back_end/app ./app

# so `from prisma import Prisma` works
ENV PYTHONPATH=/app/prisma-client-py

EXPOSE 80
ENTRYPOINT ["bash","-c"]
CMD ["poetry run uvicorn app.main:app --host 0.0.0.0 --port 80 --reload"]
