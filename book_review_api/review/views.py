from rest_framework.response import Response
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from .models import Book,Review
from django.shortcuts import get_object_or_404
from .serializers import BookSerializer,ReviewSerializer
from django.db.models import Q
#redis
from django.core.cache.backends.base import DEFAULT_TIMEOUT
from django.views.decorators.cache import cache_page
from django.core.cache import cache


CACHE_TTL = getattr('settings', 'CACHE_TTL',DEFAULT_TIMEOUT)
class BookListCreateAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Get the query parameters for search
        query = request.query_params.get('query', '').strip().lower()

        # Generate a cache key based on query parameters
        cache_key = f"books_search_{query}"
        cached_books = cache.get(cache_key)

        if cached_books:
            # Return cached data if available
            print('Returning cached data')
            return Response(cached_books, status=status.HTTP_200_OK)

        # Filter books based on the query parameter
        if query:
            books = Book.objects.filter(
                Q(title__icontains=query) | Q(author__icontains=query)
            )
        else:
            books = Book.objects.all()

        # Serialize the data
        serializer = BookSerializer(books, many=True)
        serialized_data = serializer.data

        # Store the serialized data in the cache
        cache.set(cache_key, serialized_data, timeout=CACHE_TTL)

        # Return the serialized data
        return Response(serialized_data, status=status.HTTP_200_OK)

    def post(self, request):
        serializer = BookSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            book = serializer.save()
            
            # Invalidate the cache for the main book list
            cache.delete("books_search_")
            
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        try:
            book = Book.objects.get(pk=pk)
        except Book.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)
        
        book.delete()
        
        # Invalidate the cache for the main book list
        cache.delete("books_search_")
        
        return Response(status=status.HTTP_204_NO_CONTENT)


class BookDetailAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get_object(self, pk):
        try:
            return Book.objects.get(pk=pk)
        except Book.DoesNotExist:
            return None

    def get(self, request, pk=None):
        book = self.get_object(pk)
        if book is None:
            return Response({"error": "Book not found."}, status=status.HTTP_404_NOT_FOUND)
        serializer = BookSerializer(book)
        return Response(serializer.data)

    def put(self, request, pk):
        book = self.get_object(pk)
        if book is None:
            return Response({"error": "Book not found."}, status=status.HTTP_404_NOT_FOUND)
        serializer = BookSerializer(book, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        book = self.get_object(pk)
        if book is None:
            return Response({"error": "Book not found."}, status=status.HTTP_404_NOT_FOUND)
        book.delete()
        
        # Invalidate the cache for the main book list
        cache.delete("books_search_")
        
        # Invalidate cache for any search queries (optional, but thorough)
        cache.delete_pattern("books_search_*")
        
        return Response({"message": "Book deleted successfully."}, status=status.HTTP_204_NO_CONTENT)
    
class BookByBookId(APIView):
    """
    Handles GET requests to retrieve a specific book by ID.
    Only authenticated users can access this endpoint.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        """
        Retrieve a book by its ID.
        """
        book = get_object_or_404(Book, pk=pk)
        serializer = BookSerializer(book)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
class UserBooksAPIView(APIView):
    """
    Retrieve all books for the authenticated user.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Filter books for the authenticated user
        user_books = Book.objects.filter(user=request.user)
        serializer = BookSerializer(user_books, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    
class ReviewListCreateAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, book_id):
        reviews = Review.objects.filter(book_id=book_id)
        serializer = ReviewSerializer(reviews, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request, book_id):
        print('data on post', request.data)
        serializer = ReviewSerializer(
            data=request.data,
            context={'request': request, 'book_id': book_id}  # Pass book_id in context
        )
        if serializer.is_valid():
            serializer.save()  # `book_id` will be handled inside the serializer
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)



            
    
class ReviewDetailAPIView(APIView):
    """
    Handles GET (retrieve), PUT (update), and DELETE (delete) for a single review.
    """
    permission_classes = [IsAuthenticated]

    def get_object(self, pk, user):
        try:
            return Review.objects.get(pk=pk, user=user)
        except Review.DoesNotExist:
            return None

    def get(self, request, pk):
        review = self.get_object(pk, request.user)
        if review is None:
            return Response({"error": "Review not found"}, status=status.HTTP_404_NOT_FOUND)
        serializer = ReviewSerializer(review)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def put(self, request, pk):
        review = self.get_object(pk, request.user)
        if review is None:
            return Response({"error": "Review not found"}, status=status.HTTP_404_NOT_FOUND)
        
        # Pre-fill book_id in the data if it's not included in the request
        request_data = request.data.copy()
        if 'book_id' not in request_data:
            request_data['book_id'] = review.book_id.id

        serializer = ReviewSerializer(review, data=request_data, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


    def delete(self, request, pk):
        review = self.get_object(pk, request.user)
        if review is None:
            return Response({"error": "Review not found"}, status=status.HTTP_404_NOT_FOUND)
        review.delete()
        return Response({"message": "Review deleted successfully"}, status=status.HTTP_204_NO_CONTENT)
    
