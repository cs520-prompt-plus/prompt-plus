FROM ghcr.io/owl-corp/python-poetry-base:3.11-slim

WORKDIR /build

COPY pyproject.toml poetry.lock ./
RUN poetry install --no-root

WORKDIR /app

COPY app ./app

EXPOSE 80

ARG uvicorn_extras=""
ENV uvicorn_extras=$uvicorn_extras

ENTRYPOINT ["/bin/bash", "-c"]
CMD ["poetry run uvicorn app:app --host 0.0.0.0 --port 80 $uvicorn_extras"]
