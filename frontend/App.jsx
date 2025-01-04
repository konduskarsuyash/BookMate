import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Auth from './components/Auth';
import Popup from './components/Popup';
import Header from './components/Header';
import AddSubmission from './components/AddSubmission';
import MySubmission from './components/MySubmission';
import BookReview from './components/BookReview';
import About from './components/About'
import SubmissionDetail from './components/SubmissionDetail';
import DeleteConfirmationModal from './components/DeleteConfirmationModal';

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Auth" component={Auth} />
        <Stack.Screen name="Popup" component={Popup} />
        <Stack.Screen name="Header" component={Header} />
        <Stack.Screen name="AddSubmission" component={AddSubmission} />
        <Stack.Screen name="MySubmission" component={MySubmission} />
        <Stack.Screen name="BookReview" component={BookReview} />
        <Stack.Screen name="About" component={About} />
        <Stack.Screen name="SubmissionDetail" component={SubmissionDetail} />
        <Stack.Screen name="DeleteConfirmationModal" component={DeleteConfirmationModal} />



      </Stack.Navigator>
    </NavigationContainer>
  );
}
