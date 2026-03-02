FROM ghcr.io/astral-sh/uv:python3.12-bookworm-slim

# Set environment variables
ENV UV_COMPILE_BYTECODE=1 \
    UV_LINK_MODE=copy \
    PYTHONPATH=/app/src

# Set working directory
WORKDIR /app

# Install dependencies first for better caching
RUN --mount=type=cache,target=/root/.cache/uv \
    --mount=type=bind,source=pyproject.toml,target=pyproject.toml \
    --mount=type=bind,source=uv.lock,target=uv.lock \
    uv sync --frozen --no-install-project --no-dev

# Copy the source code and backend files
COPY src /app/src
COPY backend /app/backend
COPY pyproject.toml uv.lock /app/

# Sync the project itself
RUN --mount=type=cache,target=/root/.cache/uv \
    uv sync --frozen --no-dev

# Expose port 8000
EXPOSE 8000

# Command to run the application (no reload in production)
CMD ["uv", "run", "uvicorn", "backend.api.main:app", "--host", "0.0.0.0", "--port", "8000"]
