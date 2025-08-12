FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for better caching
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Create resources directories if they don't exist
RUN mkdir -p resources/txt resources/vtt

# Set environment variables
ENV PYTHONUNBUFFERED=1
ENV APP_PORT=8082

# Expose the application port
EXPOSE 8082

# Run the application
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8082"]