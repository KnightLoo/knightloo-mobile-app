import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { StyleSheet, Button } from 'react-native';
import LandmarkMapScreen from './screens/LandmarkMapScreen';

import { createDrawerNavigator } from '@react-navigation/drawer';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

export default function App() {

  // const Drawer = createDrawerNavigator();
  const Tab = createBottomTabNavigator();

  return (
    // <NavigationContainer>
    //   <Drawer.Navigator initialRouteName="LandmarkMapScreen">
    //     <Drawer.Screen name="LandmarkMapScreen" component={LandmarkMapScreen} />
    //   </Drawer.Navigator>
    //   <StatusBar style="auto" />
    // </NavigationContainer>

    <NavigationContainer>
      <Tab.Navigator>
        <Tab.Screen 
            name="Search" 
            component={LandmarkMapScreen} 
            options={{headerLeft: () => (
                    <Button
                      onPress={() => alert('This is a button!')}
                      title="List"
                      color="blue"
                    />
              ), 
              headerLeftContainerStyle: {paddingLeft: 20},
              headerRight: () => (
                <Button
                  onPress={() => alert('This is a button!')}
                  title="Filter"
                  color="blue"
                />
          ), 
          headerRightContainerStyle: {paddingRight: 20}
            }}
        />
        <Tab.Screen name="Saved Landmarks" component={LandmarkMapScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#fff',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
// });
