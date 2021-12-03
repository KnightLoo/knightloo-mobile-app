import React, { useState, useEffect, useRef, useContext, useLayoutEffect } from 'react';
import { StyleSheet, Text, View, Button, Easing } from 'react-native';
import { createStackNavigator, CardStyleInterpolators, TransitionSpecs } from '@react-navigation/stack';

import AccountScreen from './AccountScreen';

export default function AccountStack() {

    const Stack = createStackNavigator();

    return (
        <Stack.Navigator
            screenOptions={{ 
                headerStyle: {
                    // backgroundColor: '#202020',
                    // shadowOpacity: 0,
                    // borderBottomColor: '#404040',
                    // borderBottomWidth: 1,
                },
                headerTitleStyle: {
                    // color: 'white'
                },
                
            }}>
            <Stack.Screen 
                name="Account Screen" 
                component={AccountScreen} 
                options={{
                    title: "Account",
                    animationEnabled: true,
                }}
            />
        </Stack.Navigator>
    );
}
