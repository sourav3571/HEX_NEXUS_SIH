# --- STAGE 1: Builder ---
# Use a specific version for reproducibility.
# 'builder' alias is for the first stage.
FROM python:3.11-slim-bullseye as builder

# Set the working directory
WORKDIR /app

# [IMPROVEMENT] Install only build-time system dependencies.
# 'build-essential' is for compiling C extensions if any python packages need it.
# 'git' is for installing packages directly from git repos if needed.
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    git \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Create a virtual environment to isolate python packages
RUN python -m venv /opt/venv

# Set the venv's bin directory to be on the PATH
# This ensures that 'pip' and other executables are run from the venv
ENV PATH="/opt/venv/bin:$PATH"

# Install python dependencies
# First, upgrade pip
RUN pip install --no-cache-dir --upgrade pip

# Copy only the requirements file to leverage Docker layer caching.
# This layer is only invalidated if requirements.txt changes.
COPY requirements.txt .

# Install the dependencies from requirements.txt
RUN pip install --no-cache-dir -r requirements.txt


# --- STAGE 2: Final Production Image ---
# Use the same slim base image for the final stage
FROM python:3.11-slim-bullseye

# [IMPROVEMENT] Create a dedicated non-root user and group for security
RUN groupadd --system --gid 1001 appgroup && \
    useradd --system --uid 1001 --gid appgroup appuser

# [IMPROVEMENT] Install only RUNTIME system dependencies.
# We no longer need 'git' or 'build-essential' in the final image.
# We only install the shared libraries your application actually needs to run.
RUN apt-get update && apt-get install -y --no-install-recommends \
    libgl1-mesa-glx \
    libglib2.0-0 \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Set the working directory
WORKDIR /app

# [IMPROVEMENT] Copy the virtual environment from the builder stage.
# The owner of these files will be root by default.
COPY --from=builder /opt/venv /opt/venv

# [IMPROVEMENT] Copy the application code and set ownership to the new non-root user.
# Using --chown is more efficient than a separate RUN chown command.
COPY --chown=appuser:appgroup . .

# Activate the virtual environment for subsequent commands
ENV PATH="/opt/venv/bin:$PATH"

# [IMPROVEMENT] Switch to the non-root user
USER appuser

# [BEST PRACTICE] Expose the port the application will run on.
# This is documentation and helps with networking.
EXPOSE 8080

# Set the command to run the application
# Using exec form (JSON array) is the preferred syntax.
CMD ["gunicorn", "-w", "4", "-k", "uvicorn.workers.UvicornWorker", "src.api.main:app", "--bind", "0.0.0.0:8080"]