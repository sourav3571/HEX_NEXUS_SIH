# --- STAGE 1: Builder ---
FROM python:3.11-slim-bullseye as builder

WORKDIR /app

# [IMPORTANT] Install 'git' and 'build-essential' HERE.
# 'git' is needed to clone the CLIP repository during 'pip install'.
# 'build-essential' is for compiling any C/C++ extensions if needed.
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    git \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Create and activate a virtual environment
RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Install python dependencies (will use the corrected requirements.txt)
RUN pip install --no-cache-dir --upgrade pip
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt


# --- STAGE 2: Final Production Image ---
FROM python:3.11-slim-bullseye

# Create a non-root user for security
RUN groupadd --system --gid 1001 appgroup && \
    useradd --system --uid 1001 --gid appgroup appuser

# [IMPORTANT] Install only RUNTIME dependencies.
# We DO NOT need 'git' or build tools in the final, secure image.
RUN apt-get update && apt-get install -y --no-install-recommends \
    libgl1-mesa-glx \
    libglib2.0-0 \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy the pre-built virtual environment from the builder stage
COPY --from=builder /opt/venv /opt/venv

# Copy application code and set ownership
COPY --chown=appuser:appgroup . .

# Activate the virtual environment
ENV PATH="/opt/venv/bin:$PATH"

# Switch to the non-root user
USER appuser

EXPOSE 8080

CMD ["gunicorn", "-w", "4", "-k", "uvicorn.workers.UvicornWorker", "src.api.main:app", "--bind", "0.0.0.0:8080"]