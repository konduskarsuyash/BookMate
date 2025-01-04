import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  Modal,
  TouchableOpacity,
  Pressable,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const DeleteConfirmationModal = ({ route }) => {
  const { book, onDeleteSuccess } = route.params;
  const navigation = useNavigation();

  const handleDelete = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        Alert.alert('Error', 'You need to be logged in to delete a book.');
        return;
      }

      const response = await axios.delete(`http://192.168.1.37:8000/api_review/books/${book.id}/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        timeout: 10000, // 10 seconds timeout
      });

      console.log('Delete response:', response);

      // Call the onDeleteSuccess callback
      if (onDeleteSuccess) {
        onDeleteSuccess();
      }

      Alert.alert('Success', 'Book deleted successfully', [
        { text: 'OK', onPress: () => navigation.navigate('Header') }
      ]);
    } catch (error) {
      console.error('Error deleting book:', error);
      let errorMessage = 'Failed to delete the book. Please try again.';
      if (error.response) {
        console.error('Error response:', error.response);
        errorMessage = `Server error: ${error.response.status}`;
      } else if (error.request) {
        console.error('Error request:', error.request);
        errorMessage = 'No response received from server';
      } else {
        console.error('Error message:', error.message);
        errorMessage = error.message;
      }
      Alert.alert('Error', errorMessage, [
        { text: 'OK', onPress: () => navigation.navigate('Header') }
      ]);
    }
  };

  return (
    <Modal
      visible={true}
      transparent={true}
      animationType="fade"
      onRequestClose={() => navigation.goBack()}
    >
      <Pressable style={styles.overlay} onPress={() => navigation.goBack()}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.title}>Delete Submission</Text>

            <View style={styles.messageContainer}>
              <Text style={styles.question}>Are you sure?</Text>
              <Text style={styles.warning}>
                This operation cannot be undone.
              </Text>
            </View>

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => navigation.goBack()}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.deleteButton}
                onPress={handleDelete}
              >
                <Text style={styles.deleteButtonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    maxWidth: 400,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 24,
  },
  modalContent: {
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 24,
  },
  messageContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  question: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 8,
  },
  warning: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#4F46E5',
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  deleteButton: {
    flex: 1,
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#EF4444',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default DeleteConfirmationModal;

