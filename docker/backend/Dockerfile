FROM python:3.11-slim

WORKDIR /app

# Устанавливаем системные зависимости
RUN apt-get update && apt-get install -y \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Копируем зависимости
COPY requirements.txt .
RUN pip install --no-cache-dir psycopg2-binary
RUN pip install --no-cache-dir -r requirements.txt

# Копируем проект
COPY file_storage/ .

# Создаем пользователя
RUN useradd -m -u 1000 appuser && chown -R appuser:appuser /app
USER appuser

EXPOSE 8000

CMD ["gunicorn", "file_storage.wsgi:application", "--bind", "0.0.0.0:8000"]