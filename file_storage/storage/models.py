from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.validators import RegexValidator
import os
import uuid
from django.utils import timezone

class User(AbstractUser):
    username = models.CharField(
        max_length=20,
        unique=True,
        validators=[
            RegexValidator(
                regex='^[a-zA-Z][a-zA-Z0-9]{3,19}$',
                message='Логин должен начинаться с буквы, содержать только латинские буквы и цифры, и быть длиной от 4 до 20 символов'
            )
        ]
    )
    email = models.EmailField(unique=True)
    full_name = models.CharField(max_length=100)
    is_admin = models.BooleanField(default=False)
    
    groups = models.ManyToManyField(
        'auth.Group',
        verbose_name='groups',
        blank=True,
        help_text='The groups this user belongs to.',
        related_name="storage_user_groups",
        related_query_name="user",
    )
    user_permissions = models.ManyToManyField(
        'auth.Permission',
        verbose_name='user permissions',
        blank=True,
        help_text='Specific permissions for this user.',
        related_name="storage_user_permissions",
        related_query_name="user",
    )
    
    def __str__(self):
        return self.username

class UserFile(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='files')
    original_name = models.CharField(max_length=255)
    file_name = models.CharField(max_length=255)
    size = models.BigIntegerField()
    comment = models.TextField(blank=True)
    upload_date = models.DateTimeField(default=timezone.now)
    last_download_date = models.DateTimeField(null=True, blank=True)
    download_link = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    
    def __str__(self):
        return self.original_name
    
    def get_file_path(self):
        return os.path.join('user_files', str(self.user.id), self.file_name)