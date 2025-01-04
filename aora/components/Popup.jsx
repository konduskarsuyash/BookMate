import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native'; // Import useNavigation hook

export default function Popup() {
  const navigation = useNavigation(); // Get the navigation prop

  const handleGetStarted = () => {
    console.log("Let's Get Started pressed");
    navigation.navigate('Header'); // Navigate to the Header screen
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.mainContainer}>
        <Text style={styles.welcome}>Welcome</Text>
        <View style={styles.quoteContainer}>
          <Text style={styles.quote}>Challenge yourself</Text>
          <Text style={[styles.quote, styles.subText]}>to read more this year!</Text>
        </View>
        <TouchableOpacity style={styles.startButton} onPress={handleGetStarted}>
          <Text style={styles.buttonTxt}>Let's Get Started</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  mainContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    color: 'black',
    fontWeight: 'bold',
    opacity: 0.2,
    marginBottom: 20,
  },
  quoteContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  quote: {
    fontSize: 35,
    color: 'black',
    fontWeight: 'bold',
  },
  subText: {
    marginTop: 0,
  },
  startButton: {
    height: 56,
    width: 300,
    backgroundColor: '#495AF3',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  buttonTxt: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
