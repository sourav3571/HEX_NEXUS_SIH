# Stage 1: Use a specific, stable Python base image. 'slim-bullseye' is a good balance of size and compatibility.
FROM python:3.11-slim-bullseye

# Set the working directory inside the container to /app
# All subsequent commands will run from this directory.
WORKDIR /app

# Prevent Python from writing .pyc files and ensure output is sent directly to the logs
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Stage 2: Install system-level dependencies.
# This is a critical step for OpenCV to function correctly.
# - 'apt-get update' refreshes the package list.
# - 'apt-get install -y --no-install-recommends' installs packages without optional extras to keep the image small.
# - 'libgl1-mesa-glx' and 'libglib2.0-0' are required by OpenCV's GUI components, even in headless mode.
# - The cleanup command removes the apt cache, significantly reducing the final image size.
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
    libgl1-mesa-glx \
    libglib2.0-0 \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Stage 3: Install Python dependencies.
# - Copying requirements.txt first allows Docker to use its layer cache. If requirements.txt doesn't change,
#   this slow step won't be re-run on subsequent builds, speeding up development.
COPY requirements.txt .

# - Upgrade pip and install packages using --no-cache-dir to further reduce image size.
RUN pip install --no-cache-dir --upgrade pip
RUN pip install --no-cache-dir -r requirements.txt

# Stage 4: Copy your application code into the container.
# - 'COPY . .' copies everything from your project's root directory (the context) into the container's /app directory.
COPY . .

# Stage 5: Expose the port.
# This informs Docker that the container listens on port 8080.
# Fly.io will automatically map its external port 443 (for HTTPS) to this internal port.
EXPOSE 8080

# Stage 6: Define the command to run the application.
# - We use Gunicorn as a production-grade process manager.
# - '-w 4' specifies 4 worker processes. This is a good starting point for a small app.
# - '-k uvicorn.workers.UvicornWorker' tells Gunicorn to use Uvicorn's high-performance worker class.
# - 'src.api.main:app' is the path to your FastAPI application instance.
# - '--bind 0.0.0.0:8080' tells Gunicorn to listen on all network interfaces on the specified port.
CMD ["gunicorn", "-w", "4", "-k", "uvicorn.workers.UvicornWorker", "src.api.main:app", "--bind", "0.0.0.0:8080"]