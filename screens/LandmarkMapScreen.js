import React, { useState, useEffect, useRef, useContext } from 'react';
import { StyleSheet, Text, View, Pressable } from 'react-native';
import MapView from '../components/MapView';
import ListView from '../components/ListView';
import { createStackNavigator, CardStyleInterpolators, TransitionSpecs } from '@react-navigation/stack';
import { HeaderBackButton } from '@react-navigation/elements';
import { LandmarkMapProvider } from '../contexts/LandmarkMapContext';
import LandmarkDetailScreen from './LandmarkDetailScreen';
import AppContext from '../contexts/AppContext';
import createBathroomQuery from '../utils/createBathroomQuery';
import filterBathroomResults from '../utils/filterBathroomResults';

export default function LandmarkMapScreen({navigation, route}) {

    const Stack = createStackNavigator();

    const mapRef = useRef(null);

    const {filterQuery, region, location, setSelectedLandmark} = useContext(AppContext);

    const [landmarks, setLandmarks] = useState(null);
    const [isFetchingBathrooms, setIsFetchingBathrooms] = useState(false);
    const [curMapRegion, setCurMapRegion] = useState(region);

    const backRef = useRef();
 
    useEffect(() => {

        async function getBathroomsFromDb(){

            const filQuery = filterQuery;

            const {query, postFetchFilter} = createBathroomQuery(filQuery);

            if(query != null){
                
                setIsFetchingBathrooms(true);
               
                try {
                    
                    const querySnapshot = await query.get();

                    if(querySnapshot.empty){
                        console.log("no documents found");
                        setSelectedLandmark(null);
                        setLandmarks(null);
                    } else {
                     
                        const bathrooms = querySnapshot.docs.map(doc => doc.data());
                        const testUserLoc = [28.606680, -81.198185];
    
                        const filteredBathrooms = filterBathroomResults(bathrooms, postFetchFilter == "floors" ? filQuery.floors : null, filQuery.showOpenBathroomsOnly, filQuery.maxRadiusInFeet, [location.coords.latitude, location.coords.longitude]);
                        setSelectedLandmark(null);
    
                        if(filteredBathrooms && filteredBathrooms.length == 0){
                            setLandmarks(null);
                        } else {
                            setLandmarks(filteredBathrooms);
                        }
                    }
    
                    setIsFetchingBathrooms(false);

                } catch (error){
                    console.log("error fetching bathrooms: ", error);
                    setIsFetchingBathrooms(false);
                }
            }
        }

        if(Object.keys(filterQuery).length > 0){
            getBathroomsFromDb();
        }

    }, [filterQuery]);


    const handleSheetPress = () => {
        console.log('about to navigate');
        navigation.navigate("Details View");
    };



    return (

        <>
            {region ?
                <LandmarkMapProvider value={{region, landmarks, handleSheetPress, mapRef, isFetchingBathrooms, curMapRegion, setCurMapRegion}}>
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
                            name="Map View" 
                            component={MapView} 
                            options={({navigation}) => ({
                                title: "Search",
                                headerTitleAlign: 'center',
                                animationEnabled: true,
                                headerLeft: () => (
                                    <Pressable
                                        onPress={() => navigation.replace("List View", {prevScreen: "Map"})}

                                    >
                                        {({ pressed }) => (
                                            <Text style={{opacity: pressed  ? 0.25 : 1, elevation: 3, color: "#007bff", fontSize: 17}}>
                                                List
                                            </Text>
                                        )}
                                                    
                                    </Pressable>
                                ),
                                headerRight: () => (
                                    <Pressable
                                        onPress={() => navigation.navigate("Filter Screen")}
                                    >
                                        {({ pressed }) => (
                                            <Text style={{opacity: pressed  ? 0.25 : 1, elevation: 3, color: "#007bff", fontSize: 17}}>
                                                Filter
                                            </Text>
                                        )}
                                                    
                                    </Pressable>
                                  ),
                                headerLeftContainerStyle: {paddingLeft: 20},
                                headerRightContainerStyle: {paddingRight: 20},
                            })}
                        />
                        <Stack.Screen 
                            name="List View" 
                            component={ListView}
                            options={({navigation}) => ({
                                title: "Search",
                                headerTitleAlign: 'center',
                                animationEnabled: true,
                                headerLeft: () => (
                                    <Pressable
                                        onPress={() => navigation.replace("Map View", {prevScreen: "List"})}

                                    >
                                        {({ pressed }) => (
                                            <Text style={{opacity: pressed  ? 0.25 : 1, elevation: 3, color: "#007bff", fontSize: 17}}>
                                                Map
                                            </Text>
                                        )}
                                                    
                                    </Pressable>
                                  ),
                                  headerRight: () => (
                                    <Pressable
                                        onPress={() => navigation.navigate("Filter Screen")}
                                    >
                                        {({ pressed }) => (
                                            <Text style={{opacity: pressed  ? 0.25 : 1, elevation: 3, color: "#007bff", fontSize: 17}}>
                                                Filter
                                            </Text>
                                        )}
                                                    
                                    </Pressable>
                                  ),
                                headerLeftContainerStyle: {paddingLeft: 20},
                                headerRightContainerStyle: {paddingRight: 20},

                            })}
                        />
                        <Stack.Screen 
                            name="Details View" 
                            component={LandmarkDetailScreen}
                            ref={backRef}
                            options={{
                                title: "Details",
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
                            }}
                        />

                    </Stack.Navigator>
                </LandmarkMapProvider>
               
                : <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}><Text>This shouldn't appear</Text></View>
            }
        </>
    );
}



const styles = StyleSheet.create({

    screen: {
        flex: 1,
        backgroundColor: 'white',
        alignItems: 'center',
        justifyContent: 'center',
    }
});