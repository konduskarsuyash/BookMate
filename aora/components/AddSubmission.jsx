import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Feather';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage'; // For storing the token

export default function AddSubmission({ navigation }) {
  const [formData, setFormData] = useState({
    coverImage: null,
    bookTitle: '',
    isbnNumber: '',
    authorName: '',
    bookDescription: '',
  });

  const handleImagePick = async () => {
    // Request permission to access media library
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      alert('Permission to access media library is required!');
      return;
    }

    // Launch image library
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setFormData((prev) => ({
        ...prev,
        coverImage: {
          uri: result.assets[0].uri,
          fileName: result.assets[0].fileName || 'selected-image.jpg',
        },
      }));
    }
  };

  const handleSubmit = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      console.log('submission token',token)
    if (!token) {
      Alert.alert('Error', 'Token not found, please log in again.');
    } else {
      Alert.alert('Token Found', `Token: ${token}`);
    }

      if (!token) {
        Alert.alert('Error', 'You need to be logged in to post a book.');
        return;
      }
      
      if (
        !formData.bookTitle ||
        !formData.isbnNumber ||
        !formData.authorName ||
        !formData.bookDescription
      ) {
        Alert.alert('Error', 'All fields are required.');
        return;
      }
  
      const formDataToSend = new FormData();
      formDataToSend.append('cover_image', {
        uri: formData.coverImage?.uri,
        type: 'image/jpg',
        name: formData.coverImage?.fileName,
      });
      formDataToSend.append('title', formData.bookTitle);
      formDataToSend.append('isbn_number', formData.isbnNumber);
      formDataToSend.append('author', formData.authorName);
      formDataToSend.append('description', formData.bookDescription);
      console.log('FormData:', Array.from(formDataToSend.entries())); // Debug FormData

  
      const response = await axios.post(
        'http://192.168.1.37:8000/api_review/books/',
        formDataToSend,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`, // Pass the token here
          },
        }
      );
  
      if (response.status === 201) {
        Alert.alert('Success', 'Book added successfully');
        setFormData({
          coverImage: null,
          bookTitle: '',
          isbnNumber: '',
          authorName: '',
          bookDescription: '',
        });
        navigation.navigate('Header');
      } else {
        Alert.alert('Error', 'Failed to post the book');
      }
    } catch (error) {
      console.error('Error posting book:',  error.response?.data || error.message);
      Alert.alert('Error', 'There was an issue submitting the book.');
    }
  };
  

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Submission</Text>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.cancelButton}>Cancel</Text>
        </TouchableOpacity>
      </View>

      {/* Form */}
      <View style={styles.form}>
        {/* Cover Image Picker */}
        <View style={styles.inputContainer}>
          <TouchableOpacity
            style={styles.imagePickerButton}
            onPress={handleImagePick}
          >
            <Icon name="image" size={24} color="#4F46E5" />
            <Text style={styles.imagePickerText}>
              {formData.coverImage ? 'Change Cover Image' : 'Upload Cover Image'}
            </Text>
          </TouchableOpacity>
          {formData.coverImage && (
            <Text style={styles.fileName}>
              Selected: {formData.coverImage.fileName}
            </Text>
          )}
        </View>

        {/* Book Title */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Book Title</Text>
          <TextInput
            style={styles.input}
            placeholder="Book Title"
            value={formData.bookTitle}
            onChangeText={(text) =>
              setFormData((prev) => ({ ...prev, bookTitle: text }))
            }
          />
        </View>

        {/* ISBN Number */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>ISBN Number</Text>
          <TextInput
            style={styles.input}
            placeholder="ISBN Number"
            value={formData.isbnNumber}
            onChangeText={(text) =>
              setFormData((prev) => ({ ...prev, isbnNumber: text }))
            }
            keyboardType="numeric"
          />
        </View>

        {/* Author Name */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Author Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Book Author"
            value={formData.authorName}
            onChangeText={(text) =>
              setFormData((prev) => ({ ...prev, authorName: text }))
            }
          />
        </View>

        {/* Book Description */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Book Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Book Description"
            value={formData.bookDescription}
            onChangeText={(text) =>
              setFormData((prev) => ({ ...prev, bookDescription: text }))
            }
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        {/* Submit Button */}
        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>Post Submission</Text>
        </TouchableOpacity>
      </View>
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
  cancelButton: {
    color: '#EF4444',
    fontSize: 16,
  },
  form: {
    padding: 16,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  imagePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
    borderRadius: 8,
    gap: 8,
  },
  imagePickerText: {
    color: '#4F46E5',
    fontSize: 16,
    fontWeight: '500',
  },
  fileName: {
    marginTop: 8,
    fontSize: 14,
    color: '#6B7280',
  },
  submitButton: {
    backgroundColor: '#4F46E5',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

