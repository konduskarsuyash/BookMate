from django.urls import path
from .views import BookListCreateAPIView, BookDetailAPIView,ReviewListCreateAPIView,ReviewDetailAPIView,UserBooksAPIView,BookByBookId
from django.conf import settings
from django.conf.urls.static import static


urlpatterns = [
    
    path('books/', BookListCreateAPIView.as_view(), name='book-list-create'),
    path('books/<int:pk>/', BookDetailAPIView.as_view(), name='book-detail'),
    path('book_by_book_id/<int:pk>/',BookByBookId.as_view(), name='book-by-book_id'),
    path('user/books/', UserBooksAPIView.as_view(), name='user-books'),

        # Reviews for a specific book
    path('books/<int:book_id>/reviews/', ReviewListCreateAPIView.as_view(), name='review-list-create'),
    # Detail for a specific review
    path('reviews/<int:pk>/', ReviewDetailAPIView.as_view(), name='review-detail'),
]

urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
