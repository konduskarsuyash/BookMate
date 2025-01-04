import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ImageBackground, TextInput, Alert } from 'react-native';
import axios from 'axios';
import { Book } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage'; // For storing the token



export default function Auth({ onSignIn }) {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  // Inside your Auth component
  const navigation = useNavigation();
  

  const handleAuth = async () => {
    const url = isLogin
      ? 'http://192.168.1.37:8000/auth/signin/'
      : 'http://192.168.1.37:8000/auth/signup/';
  
    const payload = isLogin
      ? { username, password }
      : { username, email, password };
  
    try {

  
      const response = await axios.post(url, payload);
  
      if (response.status === 200 || response.status === 201) {
        if (!isLogin) {
          setIsLogin(true);
          Alert.alert('Success', 'Account created! Please sign in.');
        } else {
          // Store only the access token in SecureStore
          await AsyncStorage.setItem('authToken', response.data.data.access);  // Set the token
  
          navigation.navigate('Popup'); // Navigate to the Popup screen
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Something went wrong. Please try again.');
    }
  };
  

  return (
    <ImageBackground style={styles.background} resizeMode="cover">
      <View style={styles.container}>
        <View style={styles.headerContainer}>
          <Book size={40} color="#4A5568" />
          <Text style={styles.headerText}>BookMate</Text>
        </View>
        <Text style={styles.subHeaderText}>Your Personal Book Review Companion</Text>
        <View style={styles.formContainer}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Username</Text>
            <TextInput
              style={styles.input}
              onChangeText={setUsername}
              value={username}
              placeholder="username"
              autoCapitalize="none"
            />
          </View>
          {!isLogin && (
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                onChangeText={setEmail}
                value={email}
                placeholder="email@address.com"
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>
          )}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              onChangeText={setPassword}
              value={password}
              secureTextEntry={true}
              placeholder="Password"
              autoCapitalize="none"
            />
          </View>
          <TouchableOpacity style={styles.authButton} onPress={handleAuth}>
            <Text style={styles.authButtonText}>{isLogin ? 'Sign In' : 'Sign Up'}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setIsLogin(!isLogin)}>
            <Text style={styles.toggleText}>
              {isLogin ? 'Need an account? Sign Up' : 'Already have an account? Sign In'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: '#F7FAFC',
  },
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  headerText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2D3748',
    marginLeft: 10,
  },
  subHeaderText: {
    fontSize: 16,
    color: '#4A5568',
    textAlign: 'center',
    marginBottom: 20,
  },
  formContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  inputContainer: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    color: '#4A5568',
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
  },
  authButton: {
    backgroundColor: '#4A5568',
    borderRadius: 5,
    padding: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  authButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  toggleText: {
    color: '#4A5568',
    textAlign: 'center',
    marginTop: 20,
  },
});
