Руководство по развертыванию
Краткое описание
Полнофункциональное веб-приложение для хранения файлов с использованием Django (бэкенд), PostgreSQL (база данных), React (фронтенд) и Nginx. Приложение развернуто по адресу: http://89.104.65.228/

Основные функции
✅ Регистрация и аутентификация пользователей

✅ Загрузка, хранение и скачивание файлов (до 50 МБ)

✅ Управление файлами (редактирование, удаление)

✅ Административная панель для управления пользователями

✅ Защита CSRF и настройка CORS

✅ Прямые ссылки для скачивания файлов

Требования к системе
Ubuntu 20.04+ или аналогичный Linux дистрибутив

Python 3.10+

PostgreSQL 14+

Nginx

Пошаговая инструкция развертывания
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
3. Копирование и настройка проекта
bash
# Создание директории проекта
mkdir -p /opt/mycloud
cd /opt/mycloud

# Предполагается, что файлы проекта уже скопированы в эту директорию
# Структура должна содержать:
# /opt/mycloud/file_storage/  - Django проект
# /opt/mycloud/frontend/build - React сборка
4. Настройка виртуального окружения
bash
python3 -m venv venv
source venv/bin/activate
pip install django djangorestframework django-cors-headers psycopg2-binary python-dotenv
5. Конфигурация приложения
Создайте файл .env в директории /opt/mycloud/:

env
DEBUG=False
ALLOWED_HOSTS=ваш_домен_или_ip,localhost,127.0.0.1
DB_NAME=mycloud_db
DB_USER=mycloud_user
DB_PASSWORD=MyCloud2025
DB_HOST=localhost
DB_PORT=5432
SECRET_KEY=сгенерируйте_уникальный_ключ_минимум_50_символов
CORS_ALLOWED_ORIGINS=http://ваш_домен_или_ip,http://localhost,http://127.0.0.1
CSRF_TRUSTED_ORIGINS=http://ваш_домен_или_ip,http://localhost,http://127.0.0.1
6. Применение миграций базы данных
bash
cd /opt/mycloud/file_storage
python manage.py migrate
python manage.py createsuperuser  # Следуйте инструкциям для создания администратора
python manage.py collectstatic --noinput
7. Настройка Nginx
Создайте файл /etc/nginx/sites-available/mycloud:

nginx
server {
    listen 80;
    server_name ваш_домен_или_ip;
    
    location / {
        root /opt/mycloud/frontend/build;
        try_files $uri $uri/ /index.html;
        index index.html;
    }
    
    location /api/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    location /static/ {
        alias /opt/mycloud/file_storage/staticfiles/;
        expires 30d;
    }
    
    location /media/ {
        alias /opt/mycloud/file_storage/media/;
        expires 30d;
    }
}
Активируйте конфигурацию:

bash
sudo ln -s /etc/nginx/sites-available/mycloud /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
8. Настройка systemd службы для Django
Создайте файл /etc/systemd/system/django.service:

ini
[Unit]
Description=Django File Storage
After=network.target postgresql.service

[Service]
User=root
Group=root
WorkingDirectory=/opt/mycloud/file_storage
EnvironmentFile=/opt/mycloud/.env
Environment="PATH=/opt/mycloud/venv/bin"
ExecStart=/opt/mycloud/venv/bin/python manage.py runserver 0.0.0.0:8000
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
Запустите службу:

bash
sudo systemctl daemon-reload
sudo systemctl start django
sudo systemctl enable django
9. Проверка установки
bash
# Проверка статуса служб
sudo systemctl status django
sudo systemctl status nginx
sudo systemctl status postgresql

# Проверка API
curl http://localhost:8000/api/csrf/
Использование приложения
Для пользователя:
Регистрация: Нажмите "Зарегистрироваться" в правом верхнем углу

Вход: Используйте email и пароль

Загрузка файлов: Кнопка "Загрузить файл" (максимум 50 МБ)

Управление файлами: Просмотр, скачивание, редактирование, удаление

Для администратора:
Вход с учетными данными суперпользователя

Доступ к админке: http://ваш_домен/admin/

Управление пользователями: Просмотр и управление всеми пользователями

API Endpoints
GET /api/csrf/ - Получение CSRF токена

POST /api/register/ - Регистрация пользователя

POST /api/login/ - Вход в систему

GET /api/files/ - Список файлов пользователя

POST /api/files/upload/ - Загрузка файла

GET /api/files/{id}/ - Информация о файле

DELETE /api/files/{id}/ - Удаление файла

Устранение распространенных проблем
1. Ошибка "502 Bad Gateway"
bash
# Проверьте запущен ли Django
sudo systemctl status django

# Проверьте логи
sudo journalctl -u django -n 20
2. Ошибка подключения к PostgreSQL
bash
# Проверьте запущен ли PostgreSQL
sudo systemctl status postgresql

# Проверьте подключение
sudo -u postgres psql -d mycloud_db -c "SELECT 1;"
3. Статические файлы не загружаются
bash
# Проверьте права
sudo chmod -R 755 /opt/mycloud/file_storage/staticfiles/

# Перезапустите Nginx
sudo systemctl restart nginx
Безопасность
Для production использования рекомендуется:

Настроить HTTPS через Let's Encrypt

Настроить брандмауэр (UFW)

Регулярно обновлять систему и зависимости

Настроить бэкапы базы данных

Структура проекта
text
/opt/mycloud/
├── file_storage/          # Django проект
│   ├── storage/          # Основное приложение
│   ├── file_storage/     # Настройки проекта
│   ├── media/           # Загруженные файлы пользователей
│   └── staticfiles/     # Статические файлы Django
├── frontend/build/       # React сборка
├── venv/                # Виртуальное окружение Python
└── .env                 # Конфигурационные переменные
Примечания
Приложение настроено для работы на стандартных портах (80 для Nginx, 8000 для Django)

Все пароли и секретные ключи должны быть изменены в production среде

Для доступа к административной панели необходимо создать суперпользователя командой python manage.py createsuperuser

Приложение готово к использованию. Все обязательные функции реализованы и протестированы.

Проект разработан в рамках учебной программы. Развернутая версия доступна по адресу: http://89.104.65.228/