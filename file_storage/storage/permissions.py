from rest_framework import permissions
import logging

logger = logging.getLogger(__name__)

class IsAdminUser(permissions.BasePermission):
    """
    Custom permission to only allow users with is_admin=True.
    """
    def has_permission(self, request, view):
        logger.info(f"Permission check for user: {request.user}")
        logger.info(f"User authenticated: {request.user.is_authenticated}")
        logger.info(f"User is_admin: {getattr(request.user, 'is_admin', 'Unknown')}")
        logger.info(f"User is_staff: {getattr(request.user, 'is_staff', 'Unknown')}")
        logger.info(f"User is_superuser: {getattr(request.user, 'is_superuser', 'Unknown')}")
        
        result = bool(request.user and request.user.is_authenticated and request.user.is_admin)
        logger.info(f"Permission result: {result}")
        return result