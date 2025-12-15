#file_storage/file_storage/production.py

"""
Production settings for MyCloud deployment on VPS
"""
import os
from pathlib import Path
from .settings import *  # Импортируем все базовые настройки

# Переопределяем настройки для продакшена
DEBUG = False
ALLOWED_HOSTS = ['89.104.65.228', 'localhost']

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'mycloud_db',
        'USER': 'mycloud_user',
        'PASSWORD': '',  # Будет из .env
        'HOST': 'localhost',
        'PORT': '5432',
    }
}

CORS_ALLOWED_ORIGINS = [
    "http://89.104.65.228",
    "http://localhost:3000",
]
CORS_ALLOW_CREDENTIALS = True
CSRF_TRUSTED_ORIGINS = CORS_ALLOWED_ORIGINS.copy()

SESSION_COOKIE_SECURE = False
CSRF_COOKIE_SECURE = False

STATIC_ROOT = '/var/www/mycloud/staticfiles'
MEDIA_ROOT = '/var/www/mycloud/media'