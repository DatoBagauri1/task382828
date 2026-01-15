from django.shortcuts import render, redirect, get_object_or_404
from .models import Course
from django.contrib.auth.decorators import login_required
from django.contrib.auth.forms import UserCreationForm
from django.contrib import messages
import re

def course_list(request):
    """
    Renders the main dashboard.
    Fetches all courses ordered by creation date (newest first).
    """
    courses = Course.objects.all().order_by('-created_at')
    
    # Optional: Basic search logic if you add a search bar later
    query = request.GET.get('q')
    if query:
        courses = courses.filter(title__icontains=query)
        
    return render(request, 'platform/home.html', {
        'courses': courses,
        'page_title': 'Dashboard'
    })

@login_required
def classroom(request, course_id):
    """
    Renders the classroom interface.
    Includes logic to ensure video ID is clean before rendering.
    """
    course = get_object_or_404(Course, id=course_id)
    
    # Redundant safety check for Video ID (just in case model save failed)
    # This ensures the iframe never breaks even with bad data
    if "youtube.com" in course.video_id or "youtu.be" in course.video_id:
        pattern = r"(?:v=|\/|be\/|embed\/|si=)([0-9A-Za-z_-]{11})"
        match = re.search(pattern, course.video_id)
        if match:
            course.video_id = match.group(1)
            
    return render(request, 'platform/classroom.html', {
        'course': course
    })

def signup(request):
    """
    Handles user registration.
    Redirects to login upon success with a flash message.
    """
    if request.method == 'POST':
        form = UserCreationForm(request.POST)
        if form.is_valid():
            user = form.save()
            # Add a success message to be displayed in base.html
            messages.success(request, f'UNIT_INITIALIZED: Welcome, {user.username}.')
            return redirect('login')
        else:
            messages.error(request, 'INITIALIZATION_FAILED: Check credentials.')
    else:
        form = UserCreationForm()
        
    return render(request, 'platform/login.html', {'form': form})