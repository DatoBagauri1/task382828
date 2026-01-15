from django.urls import path
from . import views

urlpatterns = [
    # The 'name' here MUST match the {% url '...' %} in your HTML
    path('', views.course_list, name='home'), 
    path('course/<int:course_id>/', views.classroom, name='classroom'),
    
    # Auth Routes (Ensure these match your base.html)
    path('signup/', views.signup, name='signup'),
]