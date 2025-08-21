import re
from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from django.core.validators import validate_email
from django.core.exceptions import ValidationError
from .models import User, UserFile

class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True, 
        required=True,
        validators=[validate_password],
        style={'input_type': 'password'}
    )
    password2 = serializers.CharField(
        write_only=True, 
        required=True,
        style={'input_type': 'password'}
    )
    
    class Meta:
        model = User
        fields = ('username', 'email', 'full_name', 'password', 'password2')
        extra_kwargs = {
            'full_name': {'required': True},
            'email': {'required': True},
        }
    
    def validate_username(self, value):
        if not re.match(r'^[a-zA-Z][a-zA-Z0-9]{3,19}$', value):
            raise serializers.ValidationError(
                "Логин должен быть 4-20 символов, начинаться с буквы и содержать только латинские буквы и цифры"
            )
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("Пользователь с таким именем уже существует")
        return value
    
    def validate_email(self, value):
        try:
            validate_email(value)
        except ValidationError:
            raise serializers.ValidationError("Некорректный email")
        
        if User.objects.filter(email=value.lower()).exists():
            raise serializers.ValidationError("Пользователь с таким email уже существует")
        return value.lower()
    
    def validate_password(self, value):
        if len(value) < 6:
            raise serializers.ValidationError("Пароль должен быть не менее 6 символов")
        if not re.search(r'[A-Z]', value):
            raise serializers.ValidationError("Пароль должен содержать хотя бы одну заглавную букву")
        if not re.search(r'[0-9]', value):
            raise serializers.ValidationError("Пароль должен содержать хотя бы одну цифру")
        if not re.search(r'[^A-Za-z0-9]', value):
            raise serializers.ValidationError("Пароль должен содержать хотя бы один специальный символ")
        return value
    
    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password2": "Пароли не совпадают"})
        return attrs
    
    def create(self, validated_data):
        user = User.objects.create(
            username=validated_data['username'],
            email=validated_data['email'],
            full_name=validated_data['full_name'],
            is_active=True
        )
        user.set_password(validated_data['password'])
        user.save()
        return user

class UserSerializer(serializers.ModelSerializer):
    file_count = serializers.IntegerField(read_only=True)
    total_size = serializers.IntegerField(read_only=True)
    
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'full_name', 'is_admin', 
                 'date_joined', 'file_count', 'total_size')

class UserFileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserFile
        fields = ('id', 'original_name', 'size', 'comment', 
                 'upload_date', 'last_download_date', 'download_link')
        
    def to_representation(self, instance):
        data = super().to_representation(instance)
        data['size'] = self.format_size(instance.size)
        return data
    
    def format_size(self, size):
        for unit in ['B', 'KB', 'MB', 'GB']:
            if size < 1024.0:
                return f"{size:.2f} {unit}"
            size /= 1024.0
        return f"{size:.2f} TB"

class FileUploadSerializer(serializers.Serializer):
    file = serializers.FileField(required=True)
    comment = serializers.CharField(required=False, allow_blank=True)