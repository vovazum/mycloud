"""
URL configuration for file_storage project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path
from storage import views

from django.contrib import admin
from django.urls import path
from storage import views  # Это должен быть правильный импорт

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # Аутентификация
    path('api/register/', views.register, name='register'),
    path('api/login/', views.user_login, name='login'),
    path('api/logout/', views.user_logout, name='logout'),
    path('api/profile/', views.user_profile, name='profile'),
    
    # Управление пользователями (только для админов)
    path('api/users/', views.user_list, name='user-list'),
    path('api/csrf/', views.get_csrf_token, name='get-csrf'),
    path('api/profile/', views.user_profile, name='user-profile'),
    
    # Работа с файлами
    path('api/files/', views.file_list, name='file-list'),
    path('api/files/<uuid:file_id>/', views.file_detail, name='file-detail'),
    path('api/files/upload/', views.file_upload, name='file-upload'),
    
    # Скачивание по ссылке
    path('api/download/<uuid:link>/', views.download_via_link, name='download-via-link'),

    # Админские endpoints - УБЕДИТЕСЬ ЧТО ЭТИ ФУНКЦИИ ЕСТЬ В views.py
    path('api/admin/users/', views.admin_user_list, name='admin-user-list'),
    path('api/admin/users/<int:user_id>/', views.admin_user_detail, name='admin-user-detail'),
    path('api/admin/users/<int:user_id>/files/', views.admin_user_files, name='admin-user-files'),
    path('api/admin/files/<uuid:file_id>/download/', views.admin_download_file, name='admin-download-file'),

    path('api/files/<uuid:file_id>/', views.file_detail, name='file-detail'), 
    path('api/admin/files/<uuid:file_id>/', views.admin_file_detail, name='admin-file-detail'),
]