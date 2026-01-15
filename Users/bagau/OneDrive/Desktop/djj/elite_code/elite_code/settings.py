from pathlib import Path
import os
import dj_database_url # Import this for dynamic DB links

BASE_DIR = Path(__file__).resolve().parent.parent

# SECURITY: Use environment variables in production
SECRET_KEY = os.environ.get('DJANGO_SECRET_KEY', 'django-insecure-elite-key')
DEBUG = os.environ.get('DEBUG', 'True') == 'True'

ALLOWED_HOSTS = ['*']

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'courses', 
    'whitenoise.runserver_nostatic', # Add this
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware', # Add this directly under SecurityMiddleware
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

# ... Keep TEMPLATES and ROOT_URLCONF as you have them ...

# DATABASE: Automatically switch to PostgreSQL on Railway/Render if available
DATABASES = {
    'default': dj_database_url.config(
        default=f"sqlite:///{BASE_DIR / 'db.sqlite3'}",
        conn_max_age=600
    )
}

# STATIC FILES CONFIGURATION
STATIC_URL = 'static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# ELITE UI OVERRIDES
X_FRAME_OPTIONS = 'SAMEORIGIN' # Crucial for YouTube Embeds and Ace Editor
LOGIN_URL = 'login'
LOGIN_REDIRECT_URL = 'home'
LOGOUT_REDIRECT_URL = 'home'