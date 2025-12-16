#docker/frontend/Dockerfile
FROM node:18-alpine as build

# Аргументы сборки
ARG REACT_APP_API_URL
ARG REACT_APP_BACKEND_URL
ENV REACT_APP_API_URL=$REACT_APP_API_URL
ENV REACT_APP_BACKEND_URL=$REACT_APP_BACKEND_URL
ENV NODE_OPTIONS="--max-old-space-size=4096"

WORKDIR /app

# Копируем зависимости и устанавливаем их
COPY package*.json ./
RUN npm ci --silent

# Копируем исходный код и собираем проект
COPY . .
RUN npm run build

# Финальный образ с nginx
FROM nginx:alpine

# Копируем собранное приложение
COPY --from=build /app/build /usr/share/nginx/html

# Копируем конфигурацию nginx для SPA
RUN echo 'server { \
    listen 80; \
    server_name _; \
    root /usr/share/nginx/html; \
    index index.html; \
    \
    # Заголовки безопасности \
    add_header X-Frame-Options "SAMEORIGIN" always; \
    add_header X-Content-Type-Options "nosniff" always; \
    add_header X-XSS-Protection "1; mode=block" always; \
    \
    # Gzip сжатие \
    gzip on; \
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript; \
    \
    # React Router поддержка \
    location / { \
        try_files $uri $uri/ /index.html; \
        expires -1; \
        add_header Cache-Control "no-store, no-cache, must-revalidate"; \
    } \
    \
    # Статические файлы React \
    location /static/ { \
        expires 1y; \
        add_header Cache-Control "public, immutable"; \
    } \
    \
    # Запрещаем доступ к скрытым файлам \
    location ~ /\. { \
        deny all; \
        access_log off; \
        log_not_found off; \
    } \
    }' > /etc/nginx/conf.d/default.conf

# Открываем порт
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]