# back_end/Dockerfile

FROM ghcr.io/owl-corp/python-poetry-base:3.11-slim

# 1) Install dependencies into a temporary build directory
WORKDIR /build
COPY pyproject.toml poetry.lock ./
RUN poetry install --no-root

# 2) Copy your FastAPI application code
WORKDIR /app
COPY app ./app

# 3) Expose the port Uvicorn will listen on
EXPOSE 80

# 4) Pass through any uvicorn extras at runtime
ARG uvicorn_extras=""
ENV uvicorn_extras=$uvicorn_extras

# 5) Ensure your app package can be imported
ENV PYTHONPATH=/app

# 6) Launch Uvicorn pointing at the `app.main:app` factory
ENTRYPOINT ["/bin/bash", "-c"]
CMD ["cd /build && poetry run uvicorn app.main:app --host 0.0.0.0 --port 80 $uvicorn_extras"]
