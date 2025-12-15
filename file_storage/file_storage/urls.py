"""
URL configuration for file_storage project.
"""
from django.contrib import admin
from django.urls import path, re_path
from storage import views

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # Аутентификация
    path('api/register/', views.register, name='register'),
    path('api/login/', views.user_login, name='login'),
    path('api/logout/', views.user_logout, name='logout'),
    path('api/profile/', views.user_profile, name='profile'),
    path('api/csrf/', views.get_csrf_token, name='get-csrf'),
    
    # Управление пользователями (только для админов)
    path('api/users/', views.user_list, name='user-list'),
    
    # Работа с файлами
    path('api/files/', views.file_list, name='file-list'),
    path('api/files/<uuid:file_id>/', views.file_detail, name='file-detail'),
    path('api/files/upload/', views.file_upload, name='file-upload'),
    
    # Скачивание по ссылке
    path('api/download/<uuid:link>/', views.download_via_link, name='download-via-link'),

    # Админские endpoints
    path('api/admin/users/', views.admin_user_list, name='admin-user-list'),
    path('api/admin/users/<int:user_id>/', views.admin_user_detail, name='admin-user-detail'),
    path('api/admin/users/<int:user_id>/files/', views.admin_user_files, name='admin-user-files'),
    path('api/admin/files/<uuid:file_id>/download/', views.admin_download_file, name='admin-download-file'),
    path('api/admin/files/<uuid:file_id>/', views.admin_file_detail, name='admin-file-detail'),

    # React app catch-all
    re_path(r'^.*$', views.react_app_view, name='react-app'),
]