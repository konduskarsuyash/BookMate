from rest_framework import serializers
from .models import Book,Review
from django.utils.timesince import timesince
from datetime import timedelta
from django.utils.timezone import now
from django.shortcuts import get_object_or_404


class BookSerializer(serializers.ModelSerializer):
    class Meta:
        model = Book
        fields = ['id', 'title', 'author', 'description', 'cover_image', 'isbn_number', 'user', 'created_at', 'updated_at']
        read_only_fields = ['user']  # Prevent the user field from being set manually

    def create(self, validated_data):
        # Attach the user from the context
        user = self.context['request'].user
        validated_data['user'] = user
        return super().create(validated_data)




class ReviewSerializer(serializers.ModelSerializer):
    book = BookSerializer(read_only=True)  # To include book details in the response
    # user = serializers.PrimaryKeyRelatedField(read_only=True)  # Only return the user_id
    relative_time = serializers.SerializerMethodField()  # Add this field

    class Meta:
        model = Review
        fields = [
            'id', 'book_id','book', 'user', 'rating', 'comment', 'sentiment', 
            'created_at', 'updated_at','relative_time'
        ]
        read_only_fields = ['user', 'sentiment', 'created_at', 'updated_at']
        depth =1

    def create(self, validated_data):
        request = self.context['request']
        validated_data['user'] = request.user  # Attach the authenticated user
        
        # Get the Book instance using the book_id passed in the view
        book_id = self.context.get('book_id')
        book = get_object_or_404(Book, id=book_id)
        validated_data['book_id'] = book  # Assign the Book instance
        
        return super().create(validated_data)
    def get_relative_time(self, obj):
        current_time = now()
        time_difference = current_time - obj.created_at

        if time_difference < timedelta(days=1):  # Less than a day
            return timesince(obj.created_at) + " ago"
        elif time_difference < timedelta(days=2):  # Yesterday
            return "yesterday"
        else:  # Older than yesterday
            return obj.created_at.strftime("%d/%m/%y")  # Format as DD/MM/YY



