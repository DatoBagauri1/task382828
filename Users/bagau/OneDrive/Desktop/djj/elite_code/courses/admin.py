from django.contrib import admin
from .models import Course

@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    # We will only display title and language to be safe
    list_display = ('title', 'language') 
    search_fields = ('title',)