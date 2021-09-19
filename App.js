import 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import React, {useCallback, useState} from 'react';
import { StyleSheet, Button, Text, View } from 'react-native';
import LandmarkMapScreen from './screens/LandmarkMapScreen';
import { NavigationContainer, useNavigationContainerRef } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { AppProvider } from './contexts/AppContext';


export default function App() {

  const Tab = createBottomTabNavigator();
  
  return (
    <AppProvider>
      <NavigationContainer>
        <Tab.Navigator>
          <Tab.Screen 
              name="Search" 
              component={LandmarkMapScreen} 
              options={{
                headerShown: false
              }}
          />
          <Tab.Screen name="Saved Landmarks" component={TestStackScreen} />
        </Tab.Navigator>
        <StatusBar style="auto" />
      </NavigationContainer>
    </AppProvider>
  );
}

function TestStackScreen(){

  return (
    <View style={styles.container}>
     <Text>
        Second screen
      </Text> 
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
