from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MinValueValidator, MaxValueValidator
from .nlp_utils import analyze_sentiment

# Create your models here.
class Book(models.Model):
    title = models.CharField(max_length=255)  # Book title
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    author = models.CharField(max_length=255)  # Author name
    description = models.TextField()  # Description of the book
    cover_image = models.ImageField(upload_to='book_covers/', blank=True, null=True)  # Cover image photo
    isbn_number = models.CharField(max_length=13, unique=True)  # ISBN number (13 characters)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title
    
class Review(models.Model):
    book_id = models.ForeignKey(Book, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    rating = models.DecimalField(max_digits=3, decimal_places=1, validators=[MinValueValidator(1), MaxValueValidator(5)])
    comment = models.TextField()
    sentiment = models.CharField(max_length=10, blank=True)  
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def save(self, *args, **kwargs):
        # Analyze the sentiment of the comment
        self.sentiment = analyze_sentiment(self.comment)
        super(Review, self).save(*args, **kwargs)
    
    def __str__(self):
        return f"{self.user.username} - {self.rating}"