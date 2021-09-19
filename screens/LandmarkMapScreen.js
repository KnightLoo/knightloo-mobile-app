import React, { useState, useEffect, useRef, useContext } from 'react';
import { StyleSheet, Text, View, Button } from 'react-native';
import * as Location from 'expo-location';
import MapView from '../components/MapView';
import { createStackNavigator } from '@react-navigation/stack';
import { LandmarkMapProvider } from '../contexts/LandmarkMapContext';

const landmarks = [
    {
        name: "landmark 1",
        longitude: -81.21222699490872 - 0.002,
        latitude: 28.584756320548234 - 0.002
    },
    {
        name: "landmark 2",
        longitude: -81.21222699490872 + 0.002,
        latitude: 28.584756320548234 + 0.002
    }
];


export default function LandmarkMapScreen({navigation}) {

    const Stack = createStackNavigator();

    const [location, setLocation] = useState(null);
    const [errorMsg, setErrorMsg] = useState(null);
    const [region, setRegion] = useState(null);

    const backRef = useRef();

    useEffect(() => {
        (async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                setErrorMsg('Permission to access location was denied');
                return;
            }

            let location = await Location.getCurrentPositionAsync({});

            let region = {
                latitude: location.coords.latitude || 37.78825,
                longitude: location.coords.longitude || -122.4324,
                latitudeDelta: 0.015684156756595513,
                longitudeDelta: 0.008579808767251507,
            };

            setLocation(location);
            setRegion(region);
        })();
    }, []);

    let text = 'Waiting..';
    if (errorMsg) {
        text = errorMsg;
    } else if (location) {
        text = JSON.stringify(location);
    }

    return (

        <>
            {region ?
                <LandmarkMapProvider value={{region, landmarks}}>
                    <Stack.Navigator>
                        <Stack.Screen 
                            name="Map View" 
                            component={MapView} 
                            options={{
                                animationEnabled: false,
                                headerLeft: () => (
                                    <Button
                                        onPress={() => navigation.navigate("List View")}
                                        title={"Map"}
                                        color="#007bff"
                                    />
                                ), 
                                headerLeftContainerStyle: {paddingLeft: 5},
                                headerRight: () => (
                                <Button
                                    onPress={() => navigation.navigate("Filter View")}
                                    title="Filter"
                                    color="#007bff"
                                />
                                ), 
                                headerRightContainerStyle: {paddingRight: 5}
                            }}
                        />
                        <Stack.Screen 
                            name="List View" 
                            component={ListView}
                            options={{
                                animationEnabled: false,
                                headerLeft: () => (
                                    <Button
                                        onPress={() => navigation.navigate("Map View")}
                                        title={"List"}
                                        color="#007bff"
                                    />
                                ), 
                                headerLeftContainerStyle: {paddingLeft: 5},
                                headerRight: () => (
                                <Button
                                    onPress={() => navigation.navigate("Filter View")}
                                    title="Filter"
                                    color="#007bff"
                                />
                                ), 
                                headerRightContainerStyle: {paddingRight: 5}
                            }}
                        />
                        <Stack.Screen 
                            name="Filter View" 
                            component={FilterView}
                            ref={backRef}
                            options={{
                                headerBackTitle: "Back",
                                headerBackTitleStyle: {color: "#007bff"},
                                headerLeftContainerStyle: {paddingLeft: 5},
                                headerRight: () => (
                                    <Button
                                        onPress={() => alert("Reset button pressed!")}
                                        title="Reset"
                                        color="#007bff"
                                    />
                                ), 
                                headerRightContainerStyle: {paddingRight: 5}
                            }}
                        />
                    </Stack.Navigator>
                </LandmarkMapProvider>
               
                : <View><Text style={styles.paragraph}>{text}</Text></View>
            }
        </>
    );
}


function ListView(){
    return(
        <View style={styles.screen}>
            <Text>
                List View
            </Text>
        </View>
    );
}

function FilterView(){
    return(
        <View style={styles.screen}>
            <Text>
                Filter View
            </Text>
        </View>

    );
}

const styles = StyleSheet.create({

    screen: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    }
});