#file_storage/storage/views.py

import logging
from django.views.decorators.csrf import ensure_csrf_cookie, csrf_exempt
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, IsAdminUser, AllowAny
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import authenticate, login, logout

from rest_framework.permissions import IsAdminUser


from django.db.models import Count, Sum
from django.db.models.functions import Coalesce
from .models import User, UserFile
from .serializers import UserSerializer, UserFileSerializer

import logging
from django.http import FileResponse, JsonResponse
from django.middleware.csrf import get_token

from .serializers import (
    UserRegistrationSerializer,
    UserSerializer,
    UserFileSerializer,
    FileUploadSerializer
)
import os
from django.conf import settings
import uuid
from django.utils import timezone

logger = logging.getLogger(__name__)

from django.http import HttpResponse
from django.conf import settings
import os
from django.http import HttpResponse, Http404
def react_app_view(request):
    """View для обслуживания React приложения"""
    
    # Исключаем API, админку, статику и медиа
    if (request.path.startswith('/api/') or 
        request.path.startswith('/admin/') or 
        request.path.startswith('/static/') or
        request.path.startswith('/media/')):
        raise Http404()
    
    # Пытаемся отдать index.html React
    try:
        # Правильный путь к React файлам
        react_index_path = os.path.join(settings.BASE_DIR, 'static', 'react', 'index.html')
        with open(react_index_path, 'r', encoding='utf-8') as file:
            return HttpResponse(file.read())
    except FileNotFoundError:
        # Если файл не найден, показываем информационную страницу
        return HttpResponse("""
        <!DOCTYPE html>
        <html>
        <head>
            <title>CloudVault - Setup Required</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 40px; }
                h1 { color: #d32f2f; }
                code { background: #f5f5f5; padding: 10px; display: block; }
            </style>
        </head>
        <body>
            <h1>⚠️ React Build Not Found</h1>
            <p>Please build your React app and copy files to:</p>
            <code>file_storage/static/react/</code>
            <p>Steps:</p>
            <ol>
                <li>cd frontend</li>
                <li>npm run build</li>
                <li>Copy all files from build/ to file_storage/static/react/</li>
            </ol>
        </body>
        </html>
        """, status=503)

@api_view(['GET'])
@permission_classes([AllowAny])
@ensure_csrf_cookie
def get_csrf_token(request):
    return JsonResponse({'csrfToken': get_token(request)})

@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    serializer = UserRegistrationSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        return Response({
            'message': 'Пользователь успешно зарегистрирован',
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'full_name': user.full_name
            }
        }, status=status.HTTP_201_CREATED)
    return Response({
        'errors': serializer.errors,
        'message': 'Ошибка регистрации'
    }, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([AllowAny])
@csrf_exempt
def user_login(request):
    username = request.data.get('username')
    password = request.data.get('password')
    
    if not username or not password:
        return Response(
            {'error': 'Требуется имя пользователя и пароль'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    user = authenticate(request, username=username, password=password)
    if user is not None:
        login(request, user)
        serializer = UserSerializer(user)
        return Response({
            'message': 'Успешный вход',
            'user': serializer.data
        }, status=status.HTTP_200_OK)
    return Response(
        {'error': 'Неверные учетные данные'},
        status=status.HTTP_401_UNAUTHORIZED
    )

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def user_logout(request):
    logout(request)
    return Response({'message': 'Успешный выход'}, status=status.HTTP_200_OK)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_profile(request):
    serializer = UserSerializer(request.user)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAdminUser])
def user_list(request):
    users = User.objects.all()
    serializer = UserSerializer(users, many=True)
    return Response(serializer.data)

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def file_list(request):
    if request.method == 'GET':
        files = UserFile.objects.filter(user=request.user)
        serializer = UserFileSerializer(files, many=True)
        return Response({
            'files': serializer.data,
            'total_size': sum(f.size for f in files)
        })
    
    elif request.method == 'POST':
        serializer = FileUploadSerializer(data=request.data)
        if serializer.is_valid():
            uploaded_file = serializer.validated_data['file']
            comment = serializer.validated_data.get('comment', '')
            
            max_size = 50 * 1024 * 1024
            if uploaded_file.size > max_size:
                return Response(
                    {'error': 'Файл слишком большой. Максимальный размер: 50MB'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            user_dir = os.path.join(settings.MEDIA_ROOT, 'user_files', str(request.user.id))
            os.makedirs(user_dir, exist_ok=True)
            
            file_ext = os.path.splitext(uploaded_file.name)[1]
            file_name = f'{uuid.uuid4()}{file_ext}'
            file_path = os.path.join(user_dir, file_name)
            
            with open(file_path, 'wb+') as destination:
                for chunk in uploaded_file.chunks():
                    destination.write(chunk)
            
            user_file = UserFile.objects.create(
                user=request.user,
                original_name=uploaded_file.name,
                file_name=file_name,
                size=uploaded_file.size,
                comment=comment
            )
            
            return Response(
                UserFileSerializer(user_file).data, 
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PUT', 'PATCH', 'DELETE'])
@permission_classes([IsAuthenticated])
def file_detail(request, file_id):
    try:
        user_file = UserFile.objects.get(id=file_id, user=request.user)
    except UserFile.DoesNotExist:
        return Response(
            {'error': 'Файл не найден или у вас нет к нему доступа'}, 
            status=status.HTTP_404_NOT_FOUND
        )
    
    file_path = os.path.join(
        settings.MEDIA_ROOT, 
        'user_files', 
        str(request.user.id), 
        user_file.file_name
    )
    
    if not os.path.exists(file_path):
        return Response(
            {'error': 'Файл не найден на сервере'},
            status=status.HTTP_404_NOT_FOUND
        )

    if request.method == 'GET':
        preview_mode = request.query_params.get('preview', '0') == '1'
        
        if not preview_mode:
            user_file.last_download_date = timezone.now()
            user_file.save()
        
        content_type = 'application/octet-stream'
        file_ext = os.path.splitext(user_file.file_name)[1].lower()
        
        if file_ext in ['.jpg', '.jpeg']:
            content_type = 'image/jpeg'
        elif file_ext == '.png':
            content_type = 'image/png'
        elif file_ext == '.pdf':
            content_type = 'application/pdf'
        elif file_ext == '.txt':
            content_type = 'text/plain'
        elif file_ext in ['.doc', '.docx']:
            content_type = 'application/msword'
        
        response = FileResponse(
            open(file_path, 'rb'),
            as_attachment=not preview_mode,
            filename=user_file.original_name if not preview_mode else None,
            content_type=content_type
        )
        
        response['Access-Control-Expose-Headers'] = 'Content-Disposition'
        return response
    
    elif request.method == 'PATCH':
        try:
            new_comment = request.data.get('comment')
            new_name = request.data.get('original_name')
            
            updated = False
            
            if new_comment is not None:
                user_file.comment = new_comment
                updated = True
                
            if new_name is not None and new_name.strip():
                # Проверяем, что новое имя не пустое и не состоит только из пробелов
                user_file.original_name = new_name.strip()
                updated = True
            
            if updated:
                user_file.save()
                
                return Response({
                    'id': user_file.id,
                    'original_name': user_file.original_name,
                    'comment': user_file.comment,
                    'size': user_file.size,
                    'upload_date': user_file.upload_date,
                    'last_download_date': user_file.last_download_date,
                    'download_link': user_file.download_link
                }, status=status.HTTP_200_OK)
            
            return Response(
                {'error': 'Не указаны данные для обновления (comment или original_name)'},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        except Exception as e:
            logger.error(f'Ошибка при обновлении файла {file_id}: {str(e)}')
            return Response(
                {'error': 'Ошибка сервера при обновлении файла'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    elif request.method == 'DELETE':
        try:
            if os.path.exists(file_path):
                os.remove(file_path)
            
            user_file.delete()
            
            return Response(
                {'message': 'Файл успешно удален'},
                status=status.HTTP_204_NO_CONTENT
            )
        except Exception as e:
            logger.error(f'Ошибка при удалении файла {file_id}: {str(e)}')
            return Response(
                {'error': 'Ошибка сервера при удалении файла'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    elif request.method == 'PUT':
        return Response(
            {'error': 'Метод PUT не поддерживается. Используйте PATCH для обновления'},
            status=status.HTTP_405_METHOD_NOT_ALLOWED
        )

@api_view(['GET'])
@permission_classes([AllowAny])
def download_via_link(request, link):
    try:
        user_file = UserFile.objects.get(download_link=link)
        file_path = os.path.join(settings.MEDIA_ROOT, 'user_files', str(user_file.user.id), user_file.file_name)
        if not os.path.exists(file_path):
            return Response(
                {'error': 'Файл не найден на сервере'},
                status=status.HTTP_404_NOT_FOUND
            )
            
        user_file.last_download_date = timezone.now()
        user_file.save()
        return FileResponse(
            open(file_path, 'rb'), 
            as_attachment=True, 
            filename=user_file.original_name
        )
    except UserFile.DoesNotExist:
        return Response(
            {'error': 'Файл не найден или ссылка недействительна'}, 
            status=status.HTTP_404_NOT_FOUND
        )

@api_view(['POST'])
@permission_classes([IsAuthenticated])
@csrf_exempt
def file_upload(request):
    if not request.user.is_authenticated:
        return Response(
            {'error': 'Требуется аутентификация'},
            status=status.HTTP_401_UNAUTHORIZED
        )
    
    if not request.META.get('HTTP_X_CSRFTOKEN'):
        return Response(
            {'error': 'CSRF токен отсутствует'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    serializer = FileUploadSerializer(data=request.data)
    if serializer.is_valid():
        uploaded_file = serializer.validated_data['file']
        comment = serializer.validated_data.get('comment', '')
        
        max_size = 50 * 1024 * 1024
        if uploaded_file.size > max_size:
            return Response(
                {'error': 'Файл слишком большой. Максимальный размер: 50MB'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        user_dir = os.path.join(settings.MEDIA_ROOT, 'user_files', str(request.user.id))
        os.makedirs(user_dir, exist_ok=True)
        
        file_ext = os.path.splitext(uploaded_file.name)[1]
        file_name = f'{uuid.uuid4()}{file_ext}'
        file_path = os.path.join(user_dir, file_name)
        
        try:
            with open(file_path, 'wb+') as destination:
                for chunk in uploaded_file.chunks():
                    destination.write(chunk)
            
            user_file = UserFile.objects.create(
                user=request.user,
                original_name=uploaded_file.name,
                file_name=file_name,
                size=uploaded_file.size,
                comment=comment,
                upload_date=timezone.now()
            )
            
            return Response(
                UserFileSerializer(user_file).data,
                status=status.HTTP_201_CREATED
            )
        except Exception as e:
            if os.path.exists(file_path):
                os.remove(file_path)
            return Response(
                {'error': f'Ошибка сервера: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)



@api_view(['GET']) 
@permission_classes([IsAdminUser])
def admin_user_list(request):
    """Список всех пользователей для админки"""
    print(f"Запрос от пользователя: {request.user}, is_admin: {request.user.is_admin}")
    
    users = User.objects.annotate(
        file_count=Count('files', distinct=True),
        total_size=Coalesce(Sum('files__size'), 0)
    ).all().order_by('-date_joined')
    
    serializer = UserSerializer(users, many=True)
    return Response(serializer.data)

@api_view(['PATCH', 'DELETE'])
@permission_classes([IsAdminUser])
def admin_user_detail(request, user_id):
    """Управление конкретным пользователем"""
    print(f"Запрос от: {request.user}, is_admin: {request.user.is_admin}")
    print(f"Метод: {request.method}, user_id: {user_id}")
    
    try:
        user = User.objects.get(id=user_id)
        print(f"Найден пользователь: {user.username}, is_admin: {user.is_admin}")
    except User.DoesNotExist:
        return Response(
            {'error': 'Пользователь не найден'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    if request.method == 'PATCH':
        is_admin = request.data.get('is_admin')
        print(f"PATCH данные: {request.data}")
        
        if is_admin is not None:
            # Запрещаем снимать права администратора с самого себя
            if user.id == request.user.id and not is_admin:
                return Response(
                    {'error': 'Вы не можете снять права администратора с самого себя'},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            user.is_admin = is_admin
            user.save()
            
            # Обновляем данные для ответа
            user_with_stats = User.objects.annotate(
                file_count=Count('files', distinct=True),
                total_size=Coalesce(Sum('files__size'), 0)
            ).get(id=user_id)
            
            return Response(
                UserSerializer(user_with_stats).data,
                status=status.HTTP_200_OK
            )
        
        return Response(
            {'error': 'Не указано поле is_admin'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    elif request.method == 'DELETE':
        print(f"Попытка удаления пользователя {user_id}")
        
        if user.id == request.user.id:
            print("Ошибка: попытка удалить самого себя")
            return Response(
                {'error': 'Вы не можете удалить себя'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        
        if user.is_admin:
            print("Ошибка: попытка удалить администратора")
            return Response(
                {'error': 'Нельзя удалять других администраторов'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        user.delete()
        print("Пользователь успешно удален")
        return Response(
            {'message': 'Пользователь удален'},
            status=status.HTTP_204_NO_CONTENT
        )

@api_view(['GET'])
@permission_classes([IsAdminUser])
def admin_user_files(request, user_id):
    """Просмотр файлов конкретного пользователя"""
    print(f"Запрос файлов от: {request.user}")
    
    try:
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return Response(
            {'error': 'Пользователь не найден'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    files = UserFile.objects.filter(user=user).order_by('-upload_date')
    total_size = files.aggregate(total=Sum('size'))['total'] or 0
    
    serializer = UserFileSerializer(files, many=True)
    return Response({
        'user': {
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'full_name': user.full_name
        },
        'files': serializer.data,
        'total_count': files.count(),
        'total_size': total_size
    })


@api_view(['GET'])
@permission_classes([IsAdminUser])
def admin_user_files(request, user_id):
    """Просмотр файлов конкретного пользователя"""
    try:
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return Response(
            {'error': 'Пользователь не найден'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    files = UserFile.objects.filter(user=user).order_by('-upload_date')
    total_size = files.aggregate(total=Sum('size'))['total'] or 0
    
    # Сериализуем файлы с дополнительной информацией
    file_data = []
    for file in files:
        file_data.append({
            'id': file.id,
            'original_name': file.original_name,
            'size': file.size,
            'comment': file.comment,
            'upload_date': file.upload_date,
            'last_download_date': file.last_download_date,
            'download_link': file.download_link
        })
    
    return Response({
        'user': {
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'full_name': user.full_name,
            'is_admin': user.is_admin
        },
        'files': file_data,
        'total_count': files.count(),
        'total_size': total_size
    })

@api_view(['GET'])
@permission_classes([IsAdminUser])
def admin_download_file(request, file_id):
    """Административное скачивание файла"""
    try:
        user_file = UserFile.objects.get(id=file_id)
        file_path = os.path.join(
            settings.MEDIA_ROOT, 
            'user_files', 
            str(user_file.user.id), 
            user_file.file_name
        )
        
        if not os.path.exists(file_path):
            return Response(
                {'error': 'Файл не найден на сервере'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Обновляем дату последнего скачивания
        user_file.last_download_date = timezone.now()
        user_file.save()
        
        response = FileResponse(
            open(file_path, 'rb'),
            as_attachment=True,
            filename=user_file.original_name
        )
        
        return response
        
    except UserFile.DoesNotExist:
        return Response(
            {'error': 'Файл не найден'},
            status=status.HTTP_404_NOT_FOUND
        )
    

# storage/views.py
@api_view(['GET', 'DELETE'])
@permission_classes([IsAdminUser])
def admin_file_detail(request, file_id):
    """Административный доступ к файлам (просмотр, удаление)"""
    try:
        user_file = UserFile.objects.get(id=file_id)
    except UserFile.DoesNotExist:
        return Response(
            {'error': 'Файл не найден'}, 
            status=status.HTTP_404_NOT_FOUND
        )
    
    file_path = os.path.join(
        settings.MEDIA_ROOT, 
        'user_files', 
        str(user_file.user.id), 
        user_file.file_name
    )
    
    if not os.path.exists(file_path):
        return Response(
            {'error': 'Файл не найден на сервере'},
            status=status.HTTP_404_NOT_FOUND
        )

    if request.method == 'GET':
        preview_mode = request.query_params.get('preview', '0') == '1'
        
        if not preview_mode:
            user_file.last_download_date = timezone.now()
            user_file.save()
        
        content_type = 'application/octet-stream'
        file_ext = os.path.splitext(user_file.file_name)[1].lower()
        
        if file_ext in ['.jpg', '.jpeg']:
            content_type = 'image/jpeg'
        elif file_ext == '.png':
            content_type = 'image/png'
        elif file_ext == '.pdf':
            content_type = 'application/pdf'
        elif file_ext == '.txt':
            content_type = 'text/plain'
        elif file_ext in ['.doc', '.docx']:
            content_type = 'application/msword'
        
        response = FileResponse(
            open(file_path, 'rb'),
            as_attachment=not preview_mode,
            filename=user_file.original_name if not preview_mode else None,
            content_type=content_type
        )
        
        response['Access-Control-Expose-Headers'] = 'Content-Disposition'
        return response
    
    elif request.method == 'DELETE':
        try:
            if os.path.exists(file_path):
                os.remove(file_path)
            
            user_file.delete()
            
            return Response(
                {'message': 'Файл успешно удален'},
                status=status.HTTP_204_NO_CONTENT
            )
        except Exception as e:
            logger.error(f'Ошибка при удалении файла {file_id}: {str(e)}')
            return Response(
                {'error': 'Ошибка сервера при удалении файла'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        


@api_view(['GET', 'PATCH', 'DELETE'])
@permission_classes([IsAuthenticated])
def user_profile(request):
    """Управление профилем пользователя"""
    if request.method == 'GET':
        serializer = UserSerializer(request.user)
        return Response(serializer.data)
    
    elif request.method == 'PATCH':
        serializer = UserSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            # Проверка пароля если он меняется
            current_password = request.data.get('current_password')
            new_password = request.data.get('new_password')
            
            if new_password:
                if not current_password:
                    return Response(
                        {'error': 'Требуется текущий пароль'},
                        status=status.HTTP_400_BAD_REQUEST
                    )
                
                if not request.user.check_password(current_password):
                    return Response(
                        {'error': 'Неверный текущий пароль'},
                        status=status.HTTP_400_BAD_REQUEST
                    )
                
                if len(new_password) < 6:
                    return Response(
                        {'error': 'Пароль должен содержать минимум 6 символов'},
                        status=status.HTTP_400_BAD_REQUEST
                    )
                
                request.user.set_password(new_password)
            
            serializer.save()
            return Response(serializer.data)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    elif request.method == 'DELETE':
        # Удаление аккаунта пользователя
        try:
            # Удаляем все файлы пользователя
            user_files = UserFile.objects.filter(user=request.user)
            for user_file in user_files:
                file_path = os.path.join(
                    settings.MEDIA_ROOT, 
                    'user_files', 
                    str(request.user.id), 
                    user_file.file_name
                )
                if os.path.exists(file_path):
                    os.remove(file_path)
                user_file.delete()
            
            # Удаляем директорию пользователя
            user_dir = os.path.join(settings.MEDIA_ROOT, 'user_files', str(request.user.id))
            if os.path.exists(user_dir):
                os.rmdir(user_dir)
            
            # Удаляем пользователя
            request.user.delete()
            
            logout(request)
            return Response(
                {'message': 'Аккаунт успешно удален'},
                status=status.HTTP_204_NO_CONTENT
            )
            
        except Exception as e:
            logger.error(f'Ошибка при удалении пользователя {request.user.id}: {str(e)}')
            return Response(
                {'error': 'Ошибка при удалении аккаунта'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        

