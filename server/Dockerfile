FROM ghcr.io/astral-sh/uv:python3.12-bookworm-slim

# Set environment variables
ENV UV_COMPILE_BYTECODE=1 \
    UV_LINK_MODE=copy \
    PYTHONPATH=/app/src

# Set working directory
WORKDIR /app

# Copy essential files first (including metadata files referenced in pyproject.toml)
COPY pyproject.toml uv.lock README.md LICENSE /app/

# Install dependencies normally (no BuildKit mount)
RUN uv sync --frozen --no-install-project --no-dev

# Copy the rest of the source code
COPY src /app/src
COPY backend /app/backend

# Sync the project itself
RUN uv sync --frozen --no-dev

# Expose port 8000
EXPOSE 8000

# Command to run the application
CMD ["uv", "run", "uvicorn", "backend.api.main:app", "--host", "0.0.0.0", "--port", "8000"]
