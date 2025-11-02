from django.contrib import admin
from django.urls import path
from . import views

urlpatterns = [
    path('', views.HOME,name='saxli'),
    path('f/', views.FILMS,name='films'),

]