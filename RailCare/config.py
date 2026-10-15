import os

class Config:
    """Application configuration for RailCare."""
    SECRET_KEY = os.environ.get('SECRET_KEY', 'railcare-secret-key-ds-2026-secure')
    BASE_DIR = os.path.abspath(os.path.dirname(__file__))
    INSTANCE_DIR = os.path.join(BASE_DIR, 'instance')
    DATABASE = os.path.join(INSTANCE_DIR, 'railcare.db')
    
    # Predefined Administrator Credentials (can also be overridden via environment variables)
    ADMIN_EMAIL = os.environ.get('ADMIN_EMAIL', 'admin@railcare.gov.in')
    ADMIN_PASSWORD = os.environ.get('ADMIN_PASSWORD', 'Admin@1234')
    ADMIN_NAME = os.environ.get('ADMIN_NAME', 'Senior Divisional Officer (Admin)')

    # Allowed Complaint Categories (Set data structure)
    ALLOWED_CATEGORIES = {
        'Cleanliness',
        'Catering and Food Quality',
        'Electrical Issues',
        'Water Availability',
        'Staff Behaviour',
        'Ticketing Issues',
        'Train Delay',
        'Security and Safety',
        'Other'
    }

    # Supported Complaint Statuses
    VALID_STATUSES = {'Pending', 'In Progress', 'Resolved'}
