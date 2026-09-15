from django.db import models

class FileIndex(models.Model):
    name = models.CharField(max_length=255, unique=True)
    original_path = models.CharField(max_length=1024)  # Kahan se uthayi thi
    current_path = models.CharField(max_length=1024)   # Ab kahan hai
    category = models.CharField(max_length=50)

    def __str__(self):
        return self.name