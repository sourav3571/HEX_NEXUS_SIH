# --- THIS IS THE CORRECTED AND FINAL VERSION ---

# --- STAGE 1: Builder ---
# Use ARGs to make versions easily updatable
ARG PYTHON_VERSION=3.11
ARG DEBIAN_VERSION=bullseye
FROM python:${PYTHON_VERSION}-slim-${DEBIAN_VERSION} as builder

# Set environment variables for consistency and best practices
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1
ENV PIP_NO_CACHE_DIR=off
ENV PIP_DISABLE_PIP_VERSION_CHECK=on

WORKDIR /app

# Install build-time dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    git \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Create and activate a virtual environment
RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Upgrade pip and install dependencies, leveraging layer caching
RUN pip install --upgrade pip
COPY requirements.txt .
RUN pip install -r requirements.txt


# --- STAGE 2: Final Production Image ---
FROM python:${PYTHON_VERSION}-slim-${DEBIAN_VERSION}

# Set default port. The deployment service will override this.
ENV PORT=8080

# Use ARGs for user/group IDs for better security and flexibility
ARG UID=1001
ARG GID=1001

# Set the same environment variables as in the builder
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Create a non-root user and group for security
RUN groupadd --system --gid ${GID} appgroup && \
    useradd --system --uid ${UID} --gid appgroup --home-dir /home/appuser --create-home appuser

# Install only RUNTIME dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    libgl1-mesa-glx \
    libglib2.0-0 \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy the pre-built virtual environment from the builder stage
COPY --from=builder /opt/venv /opt/venv

# Copy application code into the container (adjust 'src/' if needed)
COPY --chown=appuser:appgroup src/ ./src

# Activate the virtual environment
ENV PATH="/opt/venv/bin:$PATH"

# Switch to the non-root user
USER appuser

# Expose the port defined by the environment variable
EXPOSE ${PORT}

# [THIS IS THE FIX] Run the application using a shell to expand the $PORT variable.
CMD ["sh", "-c", "gunicorn -w 4 -k uvicorn.workers.UvicornWorker src.api.main:app --bind 0.0.0.0:$PORT"]