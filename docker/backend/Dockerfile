#docker/backend/Dockerfile
FROM python:3.11-slim

WORKDIR /app

# Устанавливаем системные зависимости
RUN apt-get update && apt-get install -y \
    gcc \
    postgresql-client \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Копируем зависимости
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Копируем проект
COPY file_storage/ .

# Создаем wait_for_db команду
RUN echo '#!/bin/bash\n\
until pg_isready -h postgres -p 5432; do\n\
  echo "Waiting for PostgreSQL..."\n\
  sleep 2\n\
done\n\
echo "PostgreSQL is ready"' > /usr/local/bin/wait_for_db && \
    chmod +x /usr/local/bin/wait_for_db

# Создаем пользователя
RUN useradd -m -u 1000 appuser && \
    chown -R appuser:appuser /app && \
    mkdir -p /app/staticfiles /app/media && \
    chown -R appuser:appuser /app/staticfiles /app/media

USER appuser

EXPOSE 8000

CMD ["gunicorn", "file_storage.wsgi:application", "--bind", "0.0.0.0:8000"]