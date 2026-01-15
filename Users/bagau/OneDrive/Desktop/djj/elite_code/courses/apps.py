from django.apps import AppConfig

class PlatformConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'courses'  # <--- CHANGED FROM 'platform' TO 'courses'