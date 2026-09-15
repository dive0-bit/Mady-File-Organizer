from django.contrib import admin
from django.urls import path
from file_manager import views

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/organize/', views.organize_files),
    path('api/retrieve/', views.retrieve_file),
    path('api/restore/', views.restore_file), # <-- Ye add kiya
]