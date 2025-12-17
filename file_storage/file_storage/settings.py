#file_storage/file_storage/settings.py (Локально)
import os
from pathlib import Path
from dotenv import load_dotenv

# Загрузка переменных окружения
load_dotenv()

# Базовые настройки
BASE_DIR = Path(__file__).resolve().parent.parent
SECRET_KEY = os.getenv('SECRET_KEY', 'django-insecure-default-key-for-dev')
DEBUG = os.getenv('DEBUG', 'True') == 'True'
ALLOWED_HOSTS = os.getenv('ALLOWED_HOSTS', 'localhost,127.0.0.1').split(',')

# Настройки приложений
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    
    # Сторонние приложения
    'rest_framework',
    'corsheaders',
    
    # Локальные приложения
    'storage.apps.StorageConfig',
]

# Промежуточные слои
MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

# Настройки URL и шаблонов
ROOT_URLCONF = 'file_storage.urls'
TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]
WSGI_APPLICATION = 'file_storage.wsgi.application'

# Настройки базы данных
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}

# Валидация паролей
AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
        'OPTIONS': {
            'min_length': 8,
        }
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

# Интернационализация
LANGUAGE_CODE = 'ru-ru'
TIME_ZONE = 'Europe/Moscow'
USE_I18N = True
USE_L10N = True
USE_TZ = True

# Статические файлы
STATIC_URL = '/static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')
STATICFILES_DIRS = [
    os.path.join(BASE_DIR, 'static'),
    
]

# Медиа файлы
MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

# Модель пользователя
AUTH_USER_MODEL = 'storage.User'

# Настройки REST Framework
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework.authentication.SessionAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.AllowAny',
    ],
    'DEFAULT_RENDERER_CLASSES': [
        'rest_framework.renderers.JSONRenderer',
    ],
    'DEFAULT_PARSER_CLASSES': [
        'rest_framework.parsers.JSONParser',
        'rest_framework.parsers.FormParser',
        'rest_framework.parsers.MultiPartParser',
    ],
    'EXCEPTION_HANDLER': 'rest_framework.views.exception_handler',
    'DEFAULT_THROTTLE_RATES': {
        'anon': '100/day',
        'user': '1000/day',
    }
}

# Настройки CORS
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:8000",  # ДОБАВЬТЕ
    "http://127.0.0.1:8000",  # ДОБАВЬТЕ
]
CORS_ALLOW_CREDENTIALS = True
CORS_EXPOSE_HEADERS = ['Content-Type', 'X-CSRFToken']
CSRF_TRUSTED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:8000",  # ДОБАВЬТЕ
    "http://127.0.0.1:8000",  # ДОБАВЬТЕ
]

# Настройки сессии
SESSION_COOKIE_HTTPONLY = True
SESSION_COOKIE_SECURE = not DEBUG  # True в production
SESSION_COOKIE_SAMESITE = 'Lax'
SESSION_COOKIE_AGE = 1209600  # 2 недели
CSRF_COOKIE_SECURE = not DEBUG  # True в production
CSRF_COOKIE_SAMESITE = 'Lax'

# Максимальный размер загружаемых файлов (50MB)
DATA_UPLOAD_MAX_MEMORY_SIZE = 52428800
FILE_UPLOAD_MAX_MEMORY_SIZE = 52428800

# Логирование
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
        },
    },
    'root': {
        'handlers': ['console'],
        'level': 'INFO',
    },
}

# Дополнительные настройки
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'






# """
# Django settings for file_storage project. использовать для сервера 
# """
# import os
# from pathlib import Path
# from dotenv import load_dotenv

# # Загрузка переменных окружения
# load_dotenv()

# # Базовые настройки
# BASE_DIR = Path(__file__).resolve().parent.parent
# SECRET_KEY = os.getenv('SECRET_KEY', 'django-insecure-default-key-for-dev')
# DEBUG = os.getenv('DEBUG', 'True') == 'True'
# ALLOWED_HOSTS = os.getenv('ALLOWED_HOSTS', 'localhost,127.0.0.1,89.104.65.228').split(',')

# # Настройки приложений
# INSTALLED_APPS = [
#     'django.contrib.admin',
#     'django.contrib.auth',
#     'django.contrib.contenttypes',
#     'django.contrib.sessions',
#     'django.contrib.messages',
#     'django.contrib.staticfiles',
    
#     # Сторонние приложения
#     'rest_framework',
#     'corsheaders',
    
#     # Локальные приложения
#     'storage',
# ]

# # Промежуточные слои
# MIDDLEWARE = [
#     'storage.middleware.FixApiPathMiddleware',  # ← ВАЖНО: первый для исправления /api/api/
#     'corsheaders.middleware.CorsMiddleware',    # ← ВТОРОЙ
#     'django.middleware.security.SecurityMiddleware',
#     'django.contrib.sessions.middleware.SessionMiddleware',
#     'django.middleware.common.CommonMiddleware',
#     'django.middleware.csrf.CsrfViewMiddleware',
#     'django.contrib.auth.middleware.AuthenticationMiddleware',
#     'django.contrib.messages.middleware.MessageMiddleware',
#     'django.middleware.clickjacking.XFrameOptionsMiddleware',
# ]

# # Настройки URL и шаблонов
# ROOT_URLCONF = 'file_storage.urls'
# TEMPLATES = [
#     {
#         'BACKEND': 'django.template.backends.django.DjangoTemplates',
#         'DIRS': [os.path.join(BASE_DIR, 'templates')],
#         'APP_DIRS': True,
#         'OPTIONS': {
#             'context_processors': [
#                 'django.template.context_processors.debug',
#                 'django.template.context_processors.request',
#                 'django.contrib.auth.context_processors.auth',
#                 'django.contrib.messages.context_processors.messages',
#             ],
#         },
#     },
# ]
# WSGI_APPLICATION = 'file_storage.wsgi.application'

# # Настройки базы данных - ПОСТГРЕС!
# DATABASES = {
#     'default': {
#         'ENGINE': 'django.db.backends.postgresql',
#         'NAME': os.getenv('DB_NAME', 'mycloud_db'),
#         'USER': os.getenv('DB_USER', 'mycloud_user'),
#         'PASSWORD': os.getenv('DB_PASSWORD', 'MyCloud2025'),
#         'HOST': os.getenv('DB_HOST', 'localhost'),
#         'PORT': os.getenv('DB_PORT', '5432'),
#     }
# }

# # Валидация паролей
# AUTH_PASSWORD_VALIDATORS = [
#     {
#         'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
#     },
#     {
#         'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
#         'OPTIONS': {
#             'min_length': 8,
#         }
#     },
#     {
#         'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
#     },
#     {
#         'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
#     },
# ]

# # Интернационализация
# LANGUAGE_CODE = 'ru-ru'
# TIME_ZONE = 'Europe/Moscow'
# USE_I18N = True
# USE_L10N = True
# USE_TZ = True

# # Статические файлы
# STATIC_URL = '/static/'
# STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')
# STATICFILES_DIRS = [
#     os.path.join(BASE_DIR, 'static'),
# ]

# # Медиа файлы
# MEDIA_URL = '/media/'
# MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

# # Модель пользователя
# AUTH_USER_MODEL = 'storage.User'

# # Настройки REST Framework
# REST_FRAMEWORK = {
#     'DEFAULT_AUTHENTICATION_CLASSES': [
#         'rest_framework.authentication.SessionAuthentication',
#     ],
#     'DEFAULT_PERMISSION_CLASSES': [
#         'rest_framework.permissions.AllowAny',
#     ],
#     'DEFAULT_RENDERER_CLASSES': [
#         'rest_framework.renderers.JSONRenderer',
#     ],
#     'DEFAULT_PARSER_CLASSES': [
#         'rest_framework.parsers.JSONParser',
#         'rest_framework.parsers.FormParser',
#         'rest_framework.parsers.MultiPartParser',
#     ],
#     'EXCEPTION_HANDLER': 'rest_framework.views.exception_handler',
#     'DEFAULT_THROTTLE_RATES': {
#         'anon': '100/day',
#         'user': '1000/day',
#     }
# }

# # Настройки CORS
# CORS_ALLOWED_ORIGINS = [
#     "http://localhost:3000",
#     "http://127.0.0.1:3000",
#     "http://localhost:8000",
#     "http://127.0.0.1:8000",
#     "http://89.104.65.228",
# ]
# CORS_ALLOW_CREDENTIALS = True
# CORS_ALLOW_HEADERS = [
#     'content-type',
#     'authorization',
#     'x-csrftoken',
#     'accept',
# ]
# CORS_EXPOSE_HEADERS = ['Content-Type', 'X-CSRFToken']

# # Настройки CSRF
# CSRF_TRUSTED_ORIGINS = [
#     "http://localhost:3000",
#     "http://127.0.0.1:3000",
#     "http://localhost:8000",
#     "http://127.0.0.1:8000",
#     "http://89.104.65.228",
# ]
# CSRF_COOKIE_NAME = 'csrftoken'
# CSRF_COOKIE_HTTPONLY = False  # Должно быть False для доступа из JavaScript
# CSRF_USE_SESSIONS = False
# CSRF_COOKIE_SAMESITE = 'Lax'
# CSRF_COOKIE_SECURE = os.getenv('CSRF_COOKIE_SECURE', 'False') == 'True'

# # Настройки сессии
# SESSION_COOKIE_HTTPONLY = True
# SESSION_COOKIE_SECURE = os.getenv('SESSION_COOKIE_SECURE', 'False') == 'True'
# SESSION_COOKIE_SAMESITE = 'Lax'
# SESSION_COOKIE_AGE = 1209600  # 2 недели
# SESSION_ENGINE = 'django.contrib.sessions.backends.db'

# # Максимальный размер загружаемых файлов (50MB)
# MAX_UPLOAD_SIZE = int(os.getenv('MAX_UPLOAD_SIZE', '52428800'))  # 50MB по умолчанию
# DATA_UPLOAD_MAX_MEMORY_SIZE = MAX_UPLOAD_SIZE
# FILE_UPLOAD_MAX_MEMORY_SIZE = MAX_UPLOAD_SIZE

# # Логирование
# LOGGING = {
#     'version': 1,
#     'disable_existing_loggers': False,
#     'formatters': {
#         'verbose': {
#             'format': '{levelname} {asctime} {module} {message}',
#             'style': '{',
#         },
#     },
#     'handlers': {
#         'console': {
#             'class': 'logging.StreamHandler',
#             'formatter': 'verbose',
#         },
#         'file': {
#             'class': 'logging.FileHandler',
#             'filename': os.path.join(BASE_DIR, 'django.log'),
#             'formatter': 'verbose',
#         },
#     },
#     'root': {
#         'handlers': ['console', 'file'],
#         'level': 'INFO',
#     },
#     'loggers': {
#         'django': {
#             'handlers': ['console', 'file'],
#             'level': 'INFO',
#             'propagate': True,
#         },
#         'storage': {
#             'handlers': ['console', 'file'],
#             'level': 'DEBUG',
#             'propagate': True,
#         },
#     },
# }

# # Дополнительные настройки
# DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# # Кастомные настройки
# APPEND_SLASH = False

# # Настройки безопасности для production
# if not DEBUG:
#     SECURE_BROWSER_XSS_FILTER = True
#     SECURE_CONTENT_TYPE_NOSNIFF = True
#     X_FRAME_OPTIONS = 'DENY'
#     SECURE_HSTS_SECONDS = 31536000  # 1 год
#     SECURE_HSTS_INCLUDE_SUBDOMAINS = True
#     SECURE_HSTS_PRELOAD = True

