import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Feather';
import axios from 'axios';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage'; // For storing the token

export default function MySubmission({ navigation }) {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchBooks = async () => {
    try {
        const token = await AsyncStorage.getItem('authToken');
        console.log('submission token',token)
        if (!token) {
            Alert.alert('Error', 'You need to be logged in to post a book.');
            return;
        }      
        const response = await axios.get('http://192.168.1.37:8000/api_review/user/books/', {
        headers: {
          Authorization: `Bearer ${token}`, // Use the appropriate authentication header
        },
        
      });
      setSubmissions(response.data);
      console.log('submissions', submissions)

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#4F46E5" />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>Error: {error}</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Submission</Text>
        <TouchableOpacity onPress={() => navigation.navigate('AddSubmission')}>
          <Icon name="plus" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Suggest New Book Card */}
        <TouchableOpacity
          style={styles.suggestCard}
          onPress={() => navigation.navigate('AddSubmission')}
        >
          <View style={styles.suggestContent}>
            <Icon name="plus" size={32} color="#4F46E5" />
            <Text style={styles.suggestText}>Suggest a New Book</Text>
          </View>
        </TouchableOpacity>

        {/* Submissions List */}
        <View style={styles.submissionsList}>
          {submissions.map((submission) => (
            <TouchableOpacity
              key={submission.id}
              style={styles.submissionCard}
              onPress={() => navigation.navigate('SubmissionDetail', { book: submission })}
            >
              <View style={styles.bookInfo}>
                <Image
                  source={{ uri: `http://192.168.1.37:8000${submission.cover_image}` }}
                  style={styles.coverImage}
                  resizeMode="cover"
                />
                <View style={styles.bookDetails}>
                  <Text style={styles.bookTitle}>{submission.title}</Text>
                  <Text style={styles.bookAuthor}>{submission.author}</Text>
                  <Text style={styles.submissionDate}>
                    Created: {new Date(submission.created_at).toDateString()}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  suggestCard: {
    margin: 16,
    height: 200,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  suggestContent: {
    alignItems: 'center',
    gap: 8,
  },
  suggestText: {
    fontSize: 16,
    color: '#4F46E5',
    fontWeight: '500',
  },
  submissionsList: {
    padding: 16,
    paddingTop: 0,
  },
  submissionCard: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
  },
  bookInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  coverImage: {
    width: 80,
    height: 120,
    borderRadius: 4,
    marginRight: 12,
  },
  bookDetails: {
    flex: 1,
  },
  bookTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  bookAuthor: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  submissionDate: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  errorText: {
    color: '#DC2626',
    fontSize: 16,
    textAlign: 'center',
    margin: 16,
  },
});
