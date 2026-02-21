"""
Django settings for Virtual Hospital Platform.
"""
import os
import dj_database_url
from pathlib import Path
from datetime import timedelta

BASE_DIR = Path(__file__).resolve().parent.parent

# ---------- Security & Core ----------
# Pull secret key from environment variables (Render), fallback for local dev
SECRET_KEY = os.environ.get('SECRET_KEY', 'django-insecure-vh-platform-dev-key-change-in-production-2026')

# DEBUG should be False in production for security
DEBUG = os.environ.get('DEBUG', 'False').lower() == 'true'

# Allow your Vercel VITE app and your Render backend domain
# Example Render ENV: ALLOWED_HOSTS=your-app.onrender.com,localhost,127.0.0.1
ALLOWED_HOSTS = os.environ.get('ALLOWED_HOSTS', 'localhost,127.0.0.1').split(',')

# ---------- Apps ----------
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'whitenoise.runserver_nostatic', # Added for WhiteNoise development
    'django.contrib.staticfiles',
    # Third-party
    'rest_framework',
    'rest_framework_simplejwt',
    'corsheaders',
    'django_filters',
    # Local
    'api',
]

# ---------- Middleware ----------
MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware', # Added for serving static files on Render
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'config.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'config.wsgi.application'

# ---------- Database (TiDB via URL) ----------
# Uses DATABASE_URL from Render environment variables to connect to TiDB
# Format: mysql://user:password@host:port/dbname
DATABASES = {
    'default': dj_database_url.config(
        default=os.environ.get('DATABASE_URL', 'mysql://root:2580@localhost:3306/virtual_hospital_db'),
        conn_max_age=600,
        conn_health_checks=True,
    )
}

# Add charset and strict mode options specific to MySQL/TiDB
DATABASES['default']['OPTIONS'] = {
    'charset': 'utf8mb4',
    'init_command': "SET sql_mode='STRICT_TRANS_TABLES'",
}

# ---------- Auth ----------
AUTH_USER_MODEL = 'api.User'

AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
]

# ---------- REST Framework ----------
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticated',
    ),
    'DEFAULT_FILTER_BACKENDS': (
        'django_filters.rest_framework.DjangoFilterBackend',
        'rest_framework.filters.SearchFilter',
        'rest_framework.filters.OrderingFilter',
    ),
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 50,
}

# ---------- JWT ----------
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(days=7),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=30),
    'AUTH_HEADER_TYPES': ('Bearer',),
}

# ---------- CORS ----------
# Secured for production: Only Vercel frontend and local dev can access the API
CORS_ALLOW_ALL_ORIGINS = False
CORS_ALLOWED_ORIGINS = [
    "https://vh-feature-7y1k6atfc-abiabanee-6940s-projects.vercel.app", # Your specific deployment URL
    "https://vh-feature.vercel.app",                                    # Your main Vercel domain
    "http://localhost:3000",                                            # Your local Vite Dev Server
]
CORS_ALLOW_CREDENTIALS = True

# ---------- Static & Media ----------
STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'

# WhiteNoise configuration for static file compression and caching on Render
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

# ---------- File Upload Limits ----------
DATA_UPLOAD_MAX_MEMORY_SIZE = 52428800   # 50 MB
FILE_UPLOAD_MAX_MEMORY_SIZE = 52428800   # 50 MB

# ---------- Internationalization ----------
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'Asia/Kolkata'
USE_I18N = True
USE_TZ = True

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'