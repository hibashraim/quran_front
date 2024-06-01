import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import React from 'react';

import HomeScreen from './src/screens/home.screen';
import DetailScreen from './src/screens/detail.screen';
import ModeSelectionScreen from './src/screens/ModeSelectionScreen ';


type RootStackParamList = {
  ModeSelection: undefined; 
  Home: undefined;
  Detail: { surahNumber: number; surahName: string; mode: string };
};

const Stack = createStackNavigator<RootStackParamList>();

const App: React.FC = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="ModeSelection" component={ModeSelectionScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Detail" component={DetailScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
