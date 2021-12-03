import React from 'react';
import { createStackNavigator, CardStyleInterpolators, TransitionSpecs } from '@react-navigation/stack';
import {HeaderBackButton} from '@react-navigation/elements';
import BookmarkedLandmarkDetailScreen from './BookmarkedLandmarkDetailScreen';
import BookmarksScreen from './BookmarksScreen';


export default function BookmarksTab({navigation}) {

    const Stack = createStackNavigator();


    return (
        <Stack.Navigator>
            <Stack.Screen 
                name="BookmarksScreen" 
                component={BookmarksScreen}
                options={{
                    title: "Saved Bathrooms",
                    headerBackTitle: "Back",
                    headerBackTitleStyle: {color: "#007bff"},
                }}
            />

            <Stack.Screen 
                name="Bookmarked Details View" 
                component={BookmarkedLandmarkDetailScreen}
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
