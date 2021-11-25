import React, { useState, useEffect, useRef, useContext, useLayoutEffect } from 'react';
import { StyleSheet, Text, View, Button, Easing } from 'react-native';
import * as Location from 'expo-location';
import MapView from '../components/MapView';
import ListView from '../components/ListView';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';
import { createStackNavigator, CardStyleInterpolators, TransitionSpecs } from '@react-navigation/stack';
import {HeaderBackButton} from '@react-navigation/elements';
import { LandmarkMapProvider } from '../contexts/LandmarkMapContext';
// import LandmarkDetailScreen from './DetailScreen';
import BookmarkedLandmarkDetailScreen from './BookmarkedLandmarkDetailScreen';
import BookmarksScreen from './BookmarksScreen';

import AppContext from '../contexts/AppContext';

import SignInToContinueBottomSheet from '../components/SignInToContinueBottomSheet';



export default function BookmarksTab({navigation}) {

    const Stack = createStackNavigator();


    return (
        <Stack.Navigator>
            <Stack.Screen 
                name="BookmarksScreen" 
                component={BookmarksScreen}
                // ref={backRef}
                options={{
                    title: "Saved Bathrooms",
                    headerBackTitle: "Back",
                    headerBackTitleStyle: {color: "#007bff"},
                    // headerLeftContainerStyle: {paddingLeft: 5},
                    // headerLeft: (props) => (
                    //     <HeaderBackButton
                    //         {...props}
                    //         onPress={() => {
                    //             navigation.setOptions({
                    //             cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS, 
                    //             transitionSpec: {
                    //                 open: TransitionSpecs.TransitionIOSSpec,
                    //                 close: TransitionSpecs.TransitionIOSSpec,
                    //             }
                    //             });

                    //             setTimeout(() => {
                    //                 navigation.goBack();
                    //             }, 10);
                    //         }}
                    //     />
                    // )
                }}
            />

            <Stack.Screen 
                name="Bookmarked Details View" 
                component={BookmarkedLandmarkDetailScreen}
                // ref={backRef}
                options={({ navigation }) => ({
                    title: "Details View",
                    headerBackTitle: "Back",
                    headerBackTitleStyle: {color: "#007bff"},
                    headerLeftContainerStyle: {paddingLeft: 5},
                    headerLeft: (props) => (
                        <HeaderBackButton
                            {...props}
                            onPress={() => {
                                navigation.setOptions({
                                    cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS, 
                                    transitionSpec: {
                                        open: TransitionSpecs.TransitionIOSSpec,
                                        close: TransitionSpecs.TransitionIOSSpec,
                                    }
                                });

                                setTimeout(() => {
                                    navigation.goBack();
                                }, 10);
                            }}
                        />
                    )
                })}
            />
        </Stack.Navigator>
    );
}
