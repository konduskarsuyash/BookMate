import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Image, TextInput, TouchableOpacity, ScrollView, Alert, Share } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Feather';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';

export default function BookReview({ route }) {
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [reviews, setReviews] = useState([]);
  const [bookDetails, setBookDetails] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingReview, setEditingReview] = useState(null);

  const { bookId } = route.params;
  const navigation = useNavigation();

  // Separate useEffect for fetching book details
  useEffect(() => {
    const fetchBookDetails = async () => {
      try {
        const token = await AsyncStorage.getItem('authToken');
        if (!token) {
          Alert.alert('Error', 'You need to be logged in to view book details.');
          return;
        }

        // console.log('Fetching book details for bookId:', bookId);
        // console.log('Using token:', token);

        const response = await axios.get(
          `http://192.168.1.37:8000/api_review/book_by_book_id/${bookId}/`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        // console.log('Book details response:', response);
        setBookDetails(response.data);
        // console.log('Book details set:', response.data);
      } catch (error) {
        console.error('Error fetching book details:', error.response || error);
        Alert.alert('Error', `Failed to fetch book details. ${error.response?.status === 404 ? 'Book not found.' : 'Please try again.'}`);
      }
    };

    fetchBookDetails();
  }, [bookId]);

  // Separate useEffect for fetching reviews
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const token = await AsyncStorage.getItem('authToken');
        if (!token) {
          Alert.alert('Error', 'You need to be logged in to view reviews.');
          return;
        }

        const response = await axios.get(
          `http://192.168.1.37:8000/api_review/books/${bookId}/reviews/`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (Array.isArray(response.data)) {
          setReviews(response.data);
        } else {
          console.error('No reviews found or data is not an array:', response.data);
          setReviews([]);
        }
      } catch (error) {
        console.error('Error fetching reviews:', error);
        Alert.alert('Error', 'Failed to fetch reviews. Please try again.');
      }
    };

    fetchReviews();
  }, [bookId]);

  const handleSubmitReview = async () => {
    if (rating === 0) {
      Alert.alert('Error', 'Please select a rating before submitting.');
      return;
    }
    if (review.trim() === '') {
      Alert.alert('Error', 'Please write a review before submitting.');
      return;
    }

    setIsSubmitting(true);
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        Alert.alert('Error', 'You need to be logged in to post a review.');
        return;
      }

      let response;
      if (editingReview) {
        response = await axios.put(
          `http://192.168.1.37:8000/api_review/reviews/${editingReview.id}/`,
          {
            rating: rating,
            comment: review,
          },
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
          }
        );
      } else {
        response = await axios.post(
          `http://192.168.1.37:8000/api_review/books/${bookId}/reviews/`,
          {
            rating: rating,
            comment: review,
          },
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
          }
        );
      }

      const updatedReview = response.data;
      if (editingReview) {
        setReviews(reviews.map(r => r.id === updatedReview.id ? updatedReview : r));
      } else {
        setReviews([updatedReview, ...reviews]);
      }
      setReview('');
      setRating(0);
      setEditingReview(null);
      Alert.alert('Success', `Your review has been ${editingReview ? 'updated' : 'submitted'} successfully!`);
    } catch (error) {
      console.error('Error submitting review:', error);
      Alert.alert('Error', `Failed to ${editingReview ? 'update' : 'submit'} review. Please try again.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLongPressReview = async (reviewId) => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        Alert.alert('Error', 'You need to be logged in to manage reviews.');
        return;
      }

      const response = await axios.get(
        `http://192.168.1.37:8000/api_review/reviews/${reviewId}/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const reviewData = response.data;
      Alert.alert(
        'Manage Review',
        'What would you like to do?',
        [
          {
            text: 'Edit',
            onPress: () => {
              setEditingReview(reviewData);
              setRating(reviewData.rating);
              setReview(reviewData.comment);
            },
          },
          {
            text: 'Delete',
            onPress: () => handleDeleteReview(reviewId),
            style: 'destructive',
          },
          {
            text: 'Cancel',
            style: 'cancel',
          },
        ]
      );
    } catch (error) {
      console.error('Error fetching review details:', error);
      Alert.alert('Error', 'Failed to fetch review details. Please try again.');
    }
  };

  const handleDeleteReview = async (reviewId) => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        Alert.alert('Error', 'You need to be logged in to delete a review.');
        return;
      }

      await axios.delete(
        `http://192.168.1.37:8000/api_review/reviews/${reviewId}/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setReviews(reviews.filter(r => r.id !== reviewId));
      Alert.alert('Success', 'Your review has been deleted successfully!');
      navigation.goBack();

    } catch (error) {
      console.error('Error deleting review:', error);
      Alert.alert('Error', 'Failed to delete review. Please try again.');
    }
  };

  const renderStars = (count, filled) => {
    return [...Array(5)].map((_, index) => (
      <TouchableOpacity key={index} onPress={() => setRating(index + 1)}>
        <Icon 
          name={index < filled ? "star" : "star"} 
          size={24} 
          color={index < filled ? '#FF4B6E' : '#E5E7EB'} 
        />
      </TouchableOpacity>
    ));
  };

  const handleShare = async () => {
    try {
      const result = await Share.share({
        message: `Check out this book: ${bookDetails.title} by ${bookDetails.author}. ${bookDetails.description}`,
      });

      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          console.log('Shared with activity type: ' + result.activityType);
        } else {
          console.log('Shared successfully');
        }
      } else if (result.action === Share.dismissedAction) {
        console.log('Share dismissed');
      }
    } catch (error) {
      console.error('Error sharing', error);
    }
  };

  const renderSentimentEmoji = (sentiment) => {
    switch (sentiment) {
      case 'positive':
        return '😊';
      case 'negative':
        return '😞';
      case 'neutral':
        return '😐';
      default:
        return '';
    }
  };

  const formatDate = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));
    const diffMinutes = Math.ceil(diffTime / (1000 * 60));

    if (diffDays === 0) {
      if (diffHours === 0) {
        return `${diffMinutes} mins ago`;
      }
      return `${diffHours} hours ago`;
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays === 2) {
      return '2 days ago';
    } else {
      return `${diffDays} days ago`;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.container}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={28} color="#000" />
        </TouchableOpacity>
        <Text style={styles.bookDetailTxt}>Book Detail</Text>
        <TouchableOpacity onPress={handleShare}>
          <Icon name="share-2" size={28} color="#000" />
        </TouchableOpacity>
        <Icon name="bookmark" size={28} color="#000" />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollViewContent} showsVerticalScrollIndicator={false}>
        {bookDetails ? (
          <View style={styles.container2}>
            <Image
              source={{ uri: `http://192.168.1.37:8000${bookDetails.cover_image}` }}
              style={styles.coverImage}
            />
            <View style={styles.container3}>
              <Text style={styles.title}>{bookDetails.title}</Text>
              <Text style={styles.author}>{bookDetails.author}</Text>
              <Text style={styles.ISBN}>ISBN: {bookDetails.isbn_number}</Text>
              <Text style={styles.description}>{bookDetails.description}</Text>
            </View>
          </View>
        ) : (
          <Text>Loading book details...</Text>
        )}

        <View style={styles.reviewSection}>
          <View style={styles.addReviewCard}>
            <Text style={styles.reviewHeader}>
              {editingReview ? 'Edit your review' : 'Add your rating and review!'}
            </Text>
            <View style={styles.starsContainer}>
              {renderStars(5, rating)}
            </View>
            <TextInput
              style={styles.reviewInput}
              placeholder="Write your review"
              value={review}
              onChangeText={setReview}
              multiline
            />
            <TouchableOpacity 
              style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]} 
              onPress={handleSubmitReview}
              disabled={isSubmitting}
            >
              <Text style={styles.submitButtonText}>
                {isSubmitting ? 'Submitting...' : (editingReview ? 'Update Review' : 'Submit Review')}
              </Text>
            </TouchableOpacity>
            {editingReview && (
              <TouchableOpacity 
                style={styles.cancelButton} 
                onPress={() => {
                  setEditingReview(null);
                  setRating(0);
                  setReview('');
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel Edit</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.reviewsList}>
            <View style={styles.reviewsHeader}>
              <Text style={styles.reviewsTitle}>Reviews</Text>
              <View style={styles.reviewCount}>
                <Text style={styles.reviewCountText}>{reviews.length}</Text>
              </View>
            </View>

            {Array.isArray(reviews) && reviews.length > 0 ? (
              reviews.map((review) => (
                <TouchableOpacity 
                  key={review.id} 
                  style={styles.reviewCard}
                  onLongPress={() => handleLongPressReview(review.id)}
                >
                  <View style={styles.reviewHeader}>
                    <View style={styles.starsContainer}>
                      {renderStars(5, parseFloat(review.rating))}
                    </View>
                    <Text style={styles.sentimentEmoji}>{renderSentimentEmoji(review.sentiment)}</Text>
                  </View>
                  <Text style={styles.reviewerName}>@{review.user.username}</Text>
                  <Text style={styles.reviewText}>{review.comment}</Text>
                  <Text style={styles.reviewTime}>{review.relative_time}</Text>
                </TouchableOpacity>
              ))
            ) : (
              <Text>No reviews yet.</Text>
            )}

            <TouchableOpacity style={styles.loadMoreButton}>
              <Text style={styles.loadMoreText}>Load More</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    paddingBottom: 16,
  },
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: '#fff',
    marginTop: 5,
    zIndex: 1,
  },
  bookDetailTxt: {
    fontSize: 20,
    paddingLeft: 35,
    fontWeight: 'bold',
  },
  container2: {
    marginTop: 20,
    marginBottom: 25,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
  },
  container3: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  coverImage: {
    width: 200,
    height: 300,
    resizeMode: 'cover',
    borderRadius: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    paddingTop: 25,
  },
  ISBN: {
    fontSize: 16,
    color: '#808080',
    marginTop: 5,
    marginBottom: 20,
  },
  description: {
    fontSize: 16,
    color: '#808080',
    textAlign: 'center',
  },
  author: {
    fontSize: 18,
    color: 'black',
    marginBottom: 2,
  },
  reviewSection: {
    padding: 16,
  },
  addReviewCard: {
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  reviewHeader: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 16,
  },
  reviewInput: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    height: 100,
    textAlignVertical: 'top',
    marginBottom: 16,
  },
  submitButton: {
    backgroundColor: '#4F46E5',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  reviewsList: {
    gap: 16,
  },
  reviewsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  reviewsTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  reviewCount: {
    backgroundColor: '#FFE4E8',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  reviewCountText: {
    color: '#FF4B6E',
    fontSize: 14,
    fontWeight: '600',
  },
  reviewCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 16,
  },
  reviewerName: {
    fontSize: 16,
    color: '#6B7280',
    marginVertical: 8,
  },
  reviewText: {
    fontSize: 16,
    color: '#111827',
    marginBottom: 8,
  },
  reviewTime: {
    fontSize: 14,
    color: '#6B7280',
  },
  loadMoreButton: {
    padding: 16,
    alignItems: 'center',
    backgroundColor: '#EBEBEB',
  },
  loadMoreText: {
    fontSize: 16,
    color: '#4B5563',
    fontWeight: '500',
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sentimentEmoji: {
    fontSize: 24,
    marginLeft: 8,
  },
  cancelButton: {
    marginTop: 8,
    padding: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#4F46E5',
    fontSize: 14,
    fontWeight: '600',
  },
});

