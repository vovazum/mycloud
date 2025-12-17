# 🚀 File Storage Cloud - Руководство по развертыванию

![Django](https://img.shields.io/badge/Django-092E20?style=for-the-badge&logo=django&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![Nginx](https://img.shields.io/badge/Nginx-009639?style=for-the-badge&logo=nginx&logoColor=white)

**Полнофункциональное веб-приложение для хранения файлов** с использованием современного стека технологий. Приложение развернуто по адресу: [http://89.104.65.228/](http://89.104.65.228/)

## 📋 Оглавление

- [✨ Основные функции](#-основные-функции)
- [⚙️ Требования к системе](#️-требования-к-системе)
- [🚀 Быстрый старт](#-быстрый-старт)
- [📚 Пошаговая инструкция](#-пошаговая-инструкция)
- [🔧 Конфигурация](#-конфигурация)
- [📡 API Endpoints](#-api-endpoints)
- [🔍 Устранение неполадок](#-устранение-неполадок)
- [🔒 Безопасность](#-безопасность)
- [🗂️ Структура проекта](#️-структура-проекта)

## ✨ Основные функции

| Функция | Статус | Описание |
|---------|--------|----------|
| 👤 Регистрация и аутентификация | ✅ | Полная система пользователей |
| 📁 Загрузка файлов | ✅ | Поддержка файлов до 50 МБ |
| 🔄 Управление файлами | ✅ | Редактирование, удаление, скачивание |
| 👑 Административная панель | ✅ | Управление пользователями и контентом |
| 🛡️ Защита CSRF/CORS | ✅ | Безопасная конфигурация |
| 🔗 Прямые ссылки | ✅ | Прямое скачивание файлов |

## ⚙️ Требования к системе

- **ОС**: Ubuntu 20.04+ или аналогичный Linux дистрибутив
- **Python**: 3.10+
- **PostgreSQL**: 14+
- **Nginx**: последняя стабильная версия
- **Память**: минимум 2 ГБ RAM
- **Диск**: минимум 10 ГБ свободного места

## 🚀 Быстрый старт

Для быстрого развертывания выполните:

```bash
# Клонируйте репозиторий
git clone <repository-url>
cd mycloud

# Запустите скрипт установки
chmod +x deploy.sh
sudo ./deploy.sh
📚 Пошаговая инструкция
1. Подготовка сервера
bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y python3 python3-pip python3-venv nginx postgresql postgresql-contrib git
2. Настройка базы данных PostgreSQL
bash
sudo -u postgres psql << EOF
CREATE DATABASE mycloud_db;
CREATE USER mycloud_user WITH PASSWORD 'MyCloud2025';
ALTER ROLE mycloud_user SET client_encoding TO 'utf8';
ALTER ROLE mycloud_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE mycloud_user SET timezone TO 'UTC';
GRANT ALL PRIVILEGES ON DATABASE mycloud_db TO mycloud_user;
\q
EOF
3. Копирование проекта
bash
# Создание директории проекта
sudo mkdir -p /opt/mycloud
sudo chown -R $USER:$USER /opt/mycloud

# Копирование файлов проекта
cp -r . /opt/mycloud/
cd /opt/mycloud
4. Настройка виртуального окружения
bash
python3 -m venv venv
source venv/bin/activate
pip install --upgrade pip
pip install django djangorestframework django-cors-headers psycopg2-binary python-dotenv gunicorn
🔧 Конфигурация
Файл окружения (.env)
Создайте файл /opt/mycloud/.env со следующим содержимым:

env
# Django Settings
DEBUG=False
SECRET_KEY=ваш_сгенерированный_ключ_минимум_50_символов
ALLOWED_HOSTS=ваш_домен_или_ip,localhost,127.0.0.1

# Database
DB_NAME=mycloud_db
DB_USER=mycloud_user
DB_PASSWORD=MyCloud2025
DB_HOST=localhost
DB_PORT=5432

# Security
CORS_ALLOWED_ORIGINS=http://ваш_домен_или_ip,http://localhost,http://127.0.0.1
CSRF_TRUSTED_ORIGINS=http://ваш_домен_или_ip,http://localhost,http://127.0.0.1

# File upload settings
MAX_UPLOAD_SIZE=52428800  # 50MB in bytes
Применение миграций
bash
cd /opt/mycloud/file_storage

# Миграции базы данных
python manage.py migrate

# Создание суперпользователя
python manage.py createsuperuser

# Сборка статических файлов
python manage.py collectstatic --noinput
Конфигурация Nginx
Создайте файл /etc/nginx/sites-available/mycloud:

nginx
server {
    listen 80;
    server_name ваш_домен_или_ip;
    client_max_body_size 50M;

    # React frontend
    location / {
        root /opt/mycloud/frontend/build;
        try_files $uri $uri/ /index.html;
        index index.html;
    }

    # Django API
    location /api/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Static files
    location /static/ {
        alias /opt/mycloud/file_storage/staticfiles/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # Media files
    location /media/ {
        alias /opt/mycloud/file_storage/media/;
        expires 30d;
        add_header Cache-Control "public";
    }

    # Admin panel
    location /admin/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
Активация конфигурации:

bash
sudo ln -sf /etc/nginx/sites-available/mycloud /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
Systemd служба для Django
Создайте файл /etc/systemd/system/django.service:

ini
[Unit]
Description=Django File Storage Application
After=network.target postgresql.service
Wants=postgresql.service

[Service]
Type=simple
User=www-data
Group=www-data
WorkingDirectory=/opt/mycloud/file_storage
EnvironmentFile=/opt/mycloud/.env
Environment="PATH=/opt/mycloud/venv/bin"
ExecStart=/opt/mycloud/venv/bin/gunicorn \
    --workers 3 \
    --bind 127.0.0.1:8000 \
    file_storage.wsgi:application
Restart=always
RestartSec=3

StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
Запуск службы:

bash
sudo systemctl daemon-reload
sudo systemctl start django
sudo systemctl enable django
📡 API Endpoints
Метод	Endpoint	Описание
GET	/api/csrf/	Получение CSRF токена
POST	/api/register/	Регистрация пользователя
POST	/api/login/	Вход в систему
GET	/api/files/	Список файлов пользователя
POST	/api/files/upload/	Загрузка файла
GET	/api/files/{id}/	Информация о файле
PATCH	/api/files/{id}/	Обновление файла
DELETE	/api/files/{id}/	Удаление файла
🔍 Устранение неполадок
1. Ошибка "502 Bad Gateway"
bash
# Проверка статуса служб
sudo systemctl status django
sudo systemctl status nginx

# Просмотр логов
sudo journalctl -u django --since "10 minutes ago" -f
sudo tail -f /var/log/nginx/error.log
2. Проблемы с PostgreSQL
bash
# Проверка подключения
sudo -u postgres psql -d mycloud_db -c "SELECT version();"

# Проверка пользователя
sudo -u postgres psql -c "\du"
3. Статические файлы не загружаются
bash
# Проверка прав доступа
sudo chown -R www-data:www-data /opt/mycloud/file_storage/staticfiles/
sudo chmod -R 755 /opt/mycloud/file_storage/staticfiles/

# Перезагрузка Nginx
sudo systemctl reload nginx
🔒 Безопасность
Для production среды рекомендуем:

HTTPS/SSL (Let's Encrypt):

bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d ваш_домен
Брандмауэр:

bash
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
Регулярные обновления:

bash
# Автоматические обновления безопасности
sudo apt install unattended-upgrades
sudo dpkg-reconfigure unattended-upgrades
Бэкапы базы данных (добавьте в crontab):

bash
0 2 * * * pg_dump -U mycloud_user mycloud_db > /backup/mycloud_$(date +\%Y\%m\%d).sql
🗂️ Структура проекта
text
/opt/mycloud/
├── 📁 file_storage/          # Django проект
│   ├── 📁 storage/           # Основное приложение
│   ├── 📁 file_storage/      # Настройки проекта
│   ├── 📁 media/             # Загруженные файлы
│   └── 📁 staticfiles/       # Статические файлы Django
├── 📁 frontend/              # React приложение
│   └── 📁 build/             # Production сборка
├── 📁 venv/                  # Виртуальное окружение
├── 📄 .env                   # Конфигурация
├── 📄 requirements.txt       # Зависимости Python
└── 📄 deploy.sh              # Скрипт развертывания
👥 Использование приложения
Для пользователей:
Регистрация: Нажмите "Зарегистрироваться" в правом верхнем углу

Вход: Используйте email и пароль

Загрузка: Перетащите файлы или используйте кнопку "Загрузить"

Управление: Просмотр, скачивание, переименование, удаление файлов

Для администраторов:
Вход: Учетные данные суперпользователя

Панель: Доступна по адресу http://ваш_домен/admin/

Управление: Пользователи, файлы, системные настройки