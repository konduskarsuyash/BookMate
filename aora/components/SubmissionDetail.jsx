import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SubmissionDetail = ({ route }) => {
  const navigation = useNavigation();
  const { book } = route.params;
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(book.title);
  const [isbn, setIsbn] = useState(book.isbn_number);
  const [author, setAuthor] = useState(book.author);
  const [description, setDescription] = useState(book.description);
  console.log("book from add submission to detail submission", book);

  const handleUpdate = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        Alert.alert('Error', 'You need to be logged in to update a book.');
        return;
      }

      const response = await axios.put(
        `http://192.168.1.37:8000/api_review/books/${book.id}/`,
        {
          title,
          isbn_number: isbn,
          author,
          description,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        Alert.alert('Success', 'Book updated successfully!');
        setIsEditing(false);
        // Update the book object with new data
        book.title = title;
        book.isbn_number = isbn;
        book.author = author;
        book.description = description;
      }
    } catch (error) {
      console.error('Error updating book:', error.response?.data || error.message);
      Alert.alert('Error', 'Failed to update book. Please try again.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Submission Detail</Text>
        <View style={styles.headerButtons}>
          {isEditing ? (
            <TouchableOpacity onPress={handleUpdate} style={styles.headerButton}>
              <Icon name="check" size={24} color="#4F46E5" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={() => setIsEditing(true)} style={styles.headerButton}>
              <Icon name="edit" size={24} color="#4F46E5" />
            </TouchableOpacity>
          )}
          <TouchableOpacity 
            onPress={() => navigation.navigate('DeleteConfirmationModal', { book })}
            style={styles.headerButton}
          >
            <Icon name="trash-2" size={24} color="#FF4B6E" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.coverContainer}>
          <Image
            source={{ uri: `http://192.168.1.37:8000${book?.cover_image}` || '/placeholder.svg' }}
            style={styles.coverImage}
          />
          <Text style={styles.coverLabel}>Book Cover</Text>
        </View>

        <View style={styles.formSection}>
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Title</Text>
            {isEditing ? (
              <TextInput
                style={styles.input}
                value={title}
                onChangeText={setTitle}
                placeholder="Enter book title"
              />
            ) : (
              <View style={styles.valueContainer}>
                <Text style={styles.value}>{title}</Text>
              </View>
            )}
          </View>

          <View style={styles.fieldContainer}>
            <Text style={styles.label}>ISBN</Text>
            {isEditing ? (
              <TextInput
                style={styles.input}
                value={isbn}
                onChangeText={setIsbn}
                placeholder="Enter ISBN"
              />
            ) : (
              <View style={styles.valueContainer}>
                <Text style={styles.value}>{book.isbn_number}</Text>
              </View>
            )}
          </View>

          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Author</Text>
            {isEditing ? (
              <TextInput
                style={styles.input}
                value={author}
                onChangeText={setAuthor}
                placeholder="Enter author name"
              />
            ) : (
              <View style={styles.valueContainer}>
                <Text style={styles.value}>{author}</Text>
              </View>
            )}
          </View>

          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Description</Text>
            {isEditing ? (
              <TextInput
                style={[styles.input, styles.descriptionInput]}
                value={description}
                onChangeText={setDescription}
                placeholder="Enter book description"
                multiline
              />
            ) : (
              <View style={[styles.valueContainer, styles.descriptionContainer]}>
                <Text style={styles.value}>{description}</Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
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
    color: '#111827',
  },
  headerButtons: {
    flexDirection: 'row',
  },
  headerButton: {
    marginLeft: 16,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  coverContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  coverImage: {
    width: 150,
    height: 225,
    borderRadius: 8,
    marginBottom: 8,
  },
  coverLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  formSection: {
    gap: 16,
  },
  fieldContainer: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  valueContainer: {
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  value: {
    fontSize: 16,
    color: '#111827',
  },
  descriptionContainer: {
    minHeight: 100,
  },
  input: {
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    fontSize: 16,
    color: '#111827',
  },
  descriptionInput: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
});

export default SubmissionDetail;

