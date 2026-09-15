from django.contrib import admin
from django.urls import path
from file_manager import views
from file_manager.views import organize_and_zip 

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/organize/', views.organize_files),
    path('api/retrieve/', views.retrieve_file),
    path('api/restore/', views.restore_file), 
    path('api/organize-zip/', organize_and_zip, name='organize_zip'),
]