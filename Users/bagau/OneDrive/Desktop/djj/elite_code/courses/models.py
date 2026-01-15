import re
from django.db import models

class Course(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    video_id = models.CharField(max_length=500, verbose_name="YouTube Link or ID")
    
    LANGUAGE_CHOICES = [
        ('python', 'Python'),
        ('javascript', 'JavaScript'),
        ('go', 'Go'),
        ('cpp', 'C++'),
        ('java', 'Java'),
    ]
    language = models.CharField(max_length=50, choices=LANGUAGE_CHOICES, default='python')
    initial_code = models.TextField(default='print("Hello World!")')
    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        # Extracts 11-char ID from any link (youtu.be, ?v=, or ?si=)
        pattern = r"(?:v=|\/|be\/|embed\/|si=)([0-9A-Za-z_-]{11})"
        match = re.search(pattern, self.video_id)
        if match:
            self.video_id = match.group(1)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.title