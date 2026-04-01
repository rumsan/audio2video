# syntax=docker/dockerfile:1

################################
# Stage 1 — Build React frontend
################################
FROM node:20-alpine AS frontend-builder
WORKDIR /frontend
COPY frontend/package.json frontend/package-lock.json ./
RUN --mount=type=cache,target=/root/.npm \
    npm ci --prefer-offline
COPY frontend/ ./
RUN npm run build

################################
# Stage 2 — Python API server
################################
FROM python:3.12-slim

# Install ffmpeg
RUN apt-get update && apt-get install -y --no-install-recommends ffmpeg \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt .
RUN --mount=type=cache,target=/root/.cache/pip \
    pip install -r requirements.txt

COPY app/ ./app/

# Copy built frontend assets
COPY --from=frontend-builder /frontend-dist ./frontend-dist

# Create cache and output directories
RUN mkdir -p cache output

ENV CACHE_DIR=cache
ENV OUTPUT_DIR=output

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]

# Build and Push
# docker buildx create --driver docker-container --use
# docker buildx build --platform linux/amd64 -t rumsan/audio2video:latest --push .

# Push Only
# docker push rumsan/audio2video:latest