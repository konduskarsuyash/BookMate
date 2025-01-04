import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Animated,
  Dimensions,
  SafeAreaView,
  TextInput,
  FlatList,
  Keyboard,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import Hero from './Hero';
import { useNavigation } from '@react-navigation/native';
import { ScrollView } from 'react-native-virtualized-view';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Header = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [slideAnim] = useState(new Animated.Value(0));
  const screenWidth = Dimensions.get('window').width;
  const drawerWidth = screenWidth * 0.8;
  const navigation = useNavigation();
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSuggestBook = () => {
    console.log("Let's Get Started pressed");
    navigation.navigate('MySubmission');
  };

  const toggleDrawer = () => {
    const toValue = isDrawerOpen ? 0 : 1;
    Animated.timing(slideAnim, {
      toValue,
      duration: 300,
      useNativeDriver: true,
    }).start();
    setIsDrawerOpen(!isDrawerOpen);
  };

  const translateX = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-drawerWidth, 0],
  });

  const handleSearch = useCallback(async () => {
    if (searchQuery.trim() === '') {
      setSearchResults([]);
      return;
    }
    setIsLoading(true);

    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        console.error('No auth token found');
        return;
      }

      const response = await axios.get(
        `http://192.168.1.37:8000/api_review/books/?query=${searchQuery}`,        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log('Search Results:', response.data);
      setSearchResults(response.data);
    } catch (error) {
      console.error('Error searching books:', error);
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchQuery.trim()) {
        handleSearch();
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, handleSearch]);

  const renderSearchItem = ({ item }) => (
    <TouchableOpacity
      style={styles.searchResultItem}
      onPress={() => {
        setIsSearching(false);
        setSearchQuery('');
        navigation.navigate('BookReview', { bookId: item.id });
      }}
    >
      <Text style={styles.searchResultTitle}>{item.title}</Text>
      <Text style={styles.searchResultAuthor}>{item.author}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={toggleDrawer} style={styles.menuButton}>
          <Icon name="menu" size={24} color="#000" />
          <Text style={styles.headerTitle}>BookMate</Text>
        </TouchableOpacity>
        <View style={styles.headerRight}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => {
              setIsSearching(!isSearching);
              if (isSearching) {
                setSearchQuery('');
                setSearchResults([]);
                Keyboard.dismiss();
              }
            }}
          >
            <Icon name={isSearching ? "x" : "search"} size={24} color="#000" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <Icon name="bell" size={24} color="#000" />
            <View style={styles.notificationDot} />
          </TouchableOpacity>
        </View>
      </View>

      {isSearching ? (
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search by title or author"
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus
            keyboardType="default"
            returnKeyType="search"
            onSubmitEditing={handleSearch}
          />
          {isLoading && <Text style={styles.loadingText}>Loading...</Text>}
          <FlatList
            data={searchResults}
            renderItem={renderSearchItem}
            keyExtractor={(item) => item.id.toString()}
            style={styles.searchResults}
            keyboardShouldPersistTaps="handled"
          />
        </View>
      ) : (
        <ScrollView keyboardShouldPersistTaps="handled">
          <View style={styles.tabContainer}>
            <TouchableOpacity style={styles.tabActive}>
              <Text style={styles.tabTextActive}>Discover</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.ScrollView}>
            <Hero />
          </View>
        </ScrollView>
      )}

      {/* Drawer */}
      <Animated.View
        style={[
          styles.drawer,
          {
            transform: [{ translateX }],
            width: drawerWidth,
          },
        ]}
      >
        <View style={styles.drawerHeader}>
          <TouchableOpacity onPress={toggleDrawer}>
            <Icon name="x" size={24} color="#000" />
          </TouchableOpacity>
        </View>

        <View style={styles.profile}>
          <Image
            source={{ uri: 'https://via.placeholder.com/48' }}
            style={styles.avatar}
          />
          <View style={styles.profileInfo}>
            <Text style={styles.name}>Melody Davison</Text>
            <Text style={styles.handle}>@melodydavison</Text>
          </View>
        </View>

        <View style={styles.menu}>
          <TouchableOpacity 
            style={styles.menuItem} 
            onPress={() => navigation.navigate('Header')}
          >
            <Icon name="home" size={24} color="#4B5563" />
            <Text style={styles.menuText}>Home</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.menuItem} 
            onPress={() => navigation.navigate('About')}
          >
            <Icon name="info" size={24} color="#4B5563" />
            <Text style={styles.menuText}>About</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.suggestButton} onPress={handleSuggestBook}>
          <Text style={styles.suggestButtonText}>Suggest a New Book</Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>BookMate</Text>
          <Text style={styles.versionText}>Book Review App v1.0</Text>
        </View>
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    marginTop: 39
  },
  ScrollView:{
    marginLeft: 30,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding:15,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  menuButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  iconButton: {
    padding: 4,
    position: 'relative',
  },
  notificationDot: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4F46E5',
  },
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
  },
  tabActive: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: '#4F46E5',
  },
  tabText: {
    fontSize: 16,
    color: '#6B7280',
  },
  tabTextActive: {
    fontSize: 16,
    color: '#4F46E5',
    fontWeight: '600',
  },
  drawer: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    backgroundColor: '#fff',
    zIndex: 1000,
  },
  drawerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerIcons: {
    flexDirection: 'row',
    gap: 16,
  },
  profile: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F3F4F6',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  profileInfo: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  handle: {
    fontSize: 14,
    color: '#6B7280',
  },
  menu: {
    padding: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 12,
  },
  menuText: {
    fontSize: 16,
    color: '#4B5563',
    flex: 1,
  },
  flag: {
    width: 24,
    height: 16,
  },
  suggestButton: {
    backgroundColor: '#4F46E5',
    margin: 16,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  suggestButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 16,
    color: '#111827',
    fontWeight: '500',
  },
  versionText: {
    fontSize: 14,
    color: '#6B7280',
  },
  searchContainer: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  searchInput: {
    backgroundColor: '#FFFFFF',
    padding: 10,
    margin: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  searchResults: {
    flex: 1,
  },
  searchResultItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  searchResultTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  searchResultAuthor: {
    fontSize: 14,
    color: '#6B7280',
  },
  loadingText: {
    textAlign: 'center',
    marginTop: 8,
    color: '#4B5563',
  },
});

export default Header;

