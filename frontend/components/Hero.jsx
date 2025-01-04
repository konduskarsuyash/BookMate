import React, { useEffect, useState, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  FlatList,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import axios from 'axios';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useFocusEffect } from '@react-navigation/native';

const Hero = () => {
  const [books, setBooks] = useState([]);
  const [visibleBooks, setVisibleBooks] = useState(2);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const navigation = useNavigation();

  const fetchBooks = useCallback(async () => {
    const token = await AsyncStorage.getItem('authToken');
    console.log('submission token', token);

    if (!token) {
      Alert.alert('Error', 'You need to be logged in to view books.');
      return;
    }

    try {
      const response = await axios.get('http://192.168.1.37:8000/api_review/books/', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log('response', response.data);
      setBooks(response.data);
      setLoading(false);
      setRefreshing(false);
    } catch (err) {
      console.log(err);
      setError(err.message);
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  useFocusEffect(
    useCallback(() => {
      fetchBooks();
    }, [fetchBooks])
  );

  const handleLoadMore = () => {
    setVisibleBooks(prevVisible => prevVisible + 3);
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchBooks();
  }, [fetchBooks]);

  const renderBook = useCallback(({ item }) => (
    <TouchableOpacity
      style={styles.container}
      onPress={() => navigation.navigate('BookReview', { bookId: item.id })}
    >
      <Image
        source={{ uri: `http://192.168.1.37:8000${item.cover_image}` }}
        style={styles.coverImage}
      />
      <View style={styles.container2}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.author}>{item.author}</Text>
      </View>
    </TouchableOpacity>
  ), [navigation]);

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ActivityIndicator size="large" color="#4F46E5" />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Text>{`Error: ${error}`}</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <FlatList
        data={books.slice(0, visibleBooks)}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderBook}
        contentContainerStyle={styles.listContent}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
      {visibleBooks < books.length && (
        <View style={styles.loadBtnContainer}>
          <TouchableOpacity style={styles.loadMoreButton} onPress={handleLoadMore}>
            <Text style={styles.loadMoreText}>Load More</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  listContent: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  container: {
    marginBottom: 25,
    alignItems: 'center',
    backgroundColor: '#F7F7F7',
    padding: 15,
    width: 300,
    height: 300,
  },
  coverImage: {
    width: 150,
    height: 200,
    marginBottom: 10,
  },
  container2: {
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  author: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
  loadBtnContainer: {
    marginRight: 30,
  },
  loadMoreButton: {
    backgroundColor: '#EBEBEB',
    paddingVertical: 25,
    paddingHorizontal: 110,
    alignSelf: 'center',
    marginVertical: 20,
  },
  loadMoreText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default Hero;

