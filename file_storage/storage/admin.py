from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, UserFile
from .serializers import UserFileSerializer  # Исправленный импорт

class CustomUserAdmin(UserAdmin):
    list_display = ('username', 'email', 'full_name', 'is_active', 'is_staff', 'is_admin', 'date_joined')
    list_filter = ('is_active', 'is_staff', 'is_admin', 'date_joined')
    search_fields = ('username', 'email', 'full_name')
    ordering = ('-date_joined',)
    readonly_fields = ('date_joined', 'last_login')
    
    fieldsets = (
        (None, {'fields': ('username', 'password')}),
        ('Personal info', {'fields': ('full_name', 'email')}),
        ('Permissions', {
            'fields': ('is_active', 'is_staff', 'is_admin', 'groups', 'user_permissions'),
        }),
        ('Important dates', {'fields': ('last_login', 'date_joined')}),
    )
    
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('username', 'email', 'full_name', 'password1', 'password2', 'is_active', 'is_staff'),
        }),
    )

class UserFileAdmin(admin.ModelAdmin):
    list_display = ('original_name', 'user', 'formatted_size', 'upload_date', 'last_download_date')
    list_filter = ('user',)
    search_fields = ('original_name', 'user__username')
    readonly_fields = ('file_name', 'size', 'upload_date', 'last_download_date', 'download_link')
    
    def formatted_size(self, obj):
        return UserFileSerializer().format_size(obj.size)
    formatted_size.short_description = 'Size'
    formatted_size.admin_order_field = 'size'

admin.site.register(User, CustomUserAdmin)
admin.site.register(UserFile, UserFileAdmin)