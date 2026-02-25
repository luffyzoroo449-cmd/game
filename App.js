import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet } from 'react-native';

import SplashScreen from './src/screens/SplashScreen';
import MainMenuScreen from './src/screens/MainMenuScreen';
import WorldMapScreen from './src/screens/WorldMapScreen';
import GameScreen from './src/screens/GameScreen';
import LevelCompleteScreen from './src/screens/LevelCompleteScreen';
import GameOverScreen from './src/screens/GameOverScreen';
import ShopScreen from './src/screens/ShopScreen';
import SettingsScreen from './src/screens/SettingsScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <GestureHandlerRootView style={styles.root}>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Splash"
          screenOptions={{ headerShown: false, animation: 'fade', gestureEnabled: false }}
        >
          <Stack.Screen name="Splash" component={SplashScreen} />
          <Stack.Screen name="MainMenu" component={MainMenuScreen} />
          <Stack.Screen name="WorldMap" component={WorldMapScreen} />
          <Stack.Screen name="Game" component={GameScreen} />
          <Stack.Screen name="LevelComplete" component={LevelCompleteScreen} />
          <Stack.Screen name="GameOver" component={GameOverScreen} />
          <Stack.Screen name="Shop" component={ShopScreen} />
          <Stack.Screen name="Settings" component={SettingsScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
