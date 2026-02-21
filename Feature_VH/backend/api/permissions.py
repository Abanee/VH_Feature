"""
Custom permissions for the Virtual Hospital API.
"""
from rest_framework import permissions


class IsDoctor(permissions.BasePermission):
    """Allow access only to users with role 'doctor'."""
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role == 'doctor'


class IsPatient(permissions.BasePermission):
    """Allow access only to users with role 'patient'."""
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role == 'patient'


class IsAdmin(permissions.BasePermission):
    """Allow access only to users with role 'admin' or superusers."""
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and (
            request.user.role == 'admin' or request.user.is_superuser
        )


class IsOwnerOrAdmin(permissions.BasePermission):
    """Allow access to the object owner or admin."""
    def has_object_permission(self, request, view, obj):
        if request.user.role == 'admin' or request.user.is_superuser:
            return True
        if hasattr(obj, 'user'):
            return obj.user == request.user
        if hasattr(obj, 'patient'):
            return obj.patient == request.user
        if hasattr(obj, 'doctor'):
            return obj.doctor.user == request.user
        return False
