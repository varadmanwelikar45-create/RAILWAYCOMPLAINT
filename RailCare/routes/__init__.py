"""
RailCare Blueprint Package Initialization.
"""
from .auth import auth_bp
from .user import user_bp
from .complaints import complaints_bp
from .admin import admin_bp

__all__ = ['auth_bp', 'user_bp', 'complaints_bp', 'admin_bp']
