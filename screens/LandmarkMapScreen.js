import React, { useState, useEffect, useRef, useContext, useLayoutEffect } from 'react';
import { StyleSheet, Text, View, Button, Easing, Pressable } from 'react-native';
import * as Location from 'expo-location';
import MapView from '../components/MapView';
import ListView from '../components/ListView';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';
import { createStackNavigator, CardStyleInterpolators, TransitionSpecs } from '@react-navigation/stack';
import {HeaderBackButton} from '@react-navigation/elements';
import { LandmarkMapProvider } from '../contexts/LandmarkMapContext';
import LandmarkDetailScreen from './LandmarkDetailScreen';
import FilterScreen from './FilterScreen';

import AppContext from '../contexts/AppContext';

import SignInToContinueBottomSheet from '../components/SignInToContinueBottomSheet';

import createBathroomQuery from '../utils/createBathroomQuery';
import filterBathroomResults from '../utils/filterBathroomResults';

const flipOptions = {
    transitionSpec: {
      open: {
        animation: "timing",
        config: {
          duration: 700,
          easing: Easing.out(Easing.poly(4)),
          // easing: Easing.ease
        }
      },
      close: {
        animation: "timing",
        config: {
          duration: 700,
          easing: Easing.out(Easing.poly(4)),
        }
      },
    },
    cardStyleInterpolator: ({ current, next }) => {
      return {
        cardStyle: {
          opacity: next
            ? next.progress.interpolate({
              inputRange: [0, 0.5, 1],
              outputRange: [1, 1, 0],
            })
            : current.progress.interpolate({
              inputRange: [0, 0.5, 1],
              outputRange: [0, 0, 1],
            }),
          backfaceVisibility: 'hidden',
          transform: [
            {
              rotateY: next
                ? next.progress.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0deg', '-180deg'],
                })
                : current.progress.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['180deg', '0deg'],
                }),
            },
            {
              scaleY: next ? next.progress.interpolate({
                inputRange: [0, 1],
                outputRange: [1, 0.7],
              }) : current.progress.interpolate({
                inputRange: [0, 1],
                outputRange: [0.7, 1],
              }),
            },
          ],
        },
        overlayStyle: {
          opacity: current.progress.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 1],
          }),
        },
      };
    },
};

function getUTCDateFromHoursAndMins(hour, min, dayTimeType){

    let hourMilTime = dayTimeType == "PM" ? ((hour % 12) + 12) : (hour % 12)

    let utcDate = new Date();
    utcDate.setUTCMonth(0);
    utcDate.setUTCDate(1);
    utcDate.setUTCFullYear(2021);
    utcDate.setUTCMilliseconds(0);
    utcDate.setUTCSeconds(0);
    utcDate.setUTCMinutes(min);
    utcDate.setUTCHours(hourMilTime);
    
    return utcDate.getTime();
}

const landmarksTest = [
    {
        name: "Dominoes (Knights Plaza)",
        imgUrl: "https://firebasestorage.googleapis.com/v0/b/knightloo.appspot.com/o/IMG_2818.jpg?alt=media&token=f3445847-8c4a-415a-a02d-632c54111d7b",
        longitude: -81.21222699490872 - 0.0002,
        latitude: 28.584756320548234 - 0.0002,
        hopData: {
            displayableHopData: [
                {
                    days: ["Mon-Tue", "Fri"],
                    daysInNum: [0, 1, 4],
                    isAllDay: false,
                    startEtHour: 12,
                    startEtMin: 15,
                    startEtDayTime: 'PM',
                    endEtHour: 4,
                    endEtMin: 0,
                    endEtDayTime: 'PM',
                    etRangeStr: "12:15 PM - 4:00 PM"
                },
                {
                    days: ["Sun"],
                    isAllDay: true,
                }
            ],
            flattenedHopDataForFilteringAndMutating: [
                {
                    startUtcInMilli: getUTCDateFromHoursAndMins(12, 15, "PM"),
                    endUtcInMilli: getUTCDateFromHoursAndMins(4, 0, "PM"),
                    // etRangeStr: "12:15-16:00",
                    etRangeStr: "12:15 PM - 4:00 PM",
                    isAllDay: false
                },
                {
                    startUtcInMilli: getUTCDateFromHoursAndMins(12, 15, "PM"),
                    endUtcInMilli: getUTCDateFromHoursAndMins(4, 0, "PM"),
                    // etRangeStr: "9:00-17:00",
                    etRangeStr: "12:15 PM - 4:00 PM",
                    isAllDay: false
                },
                    null,
                    null,
                {
                    startUtcInMilli: getUTCDateFromHoursAndMins(12, 15, "PM"),
                    endUtcInMilli: getUTCDateFromHoursAndMins(4, 0, "PM"),
                    // etRangeStr: "9:00-17:00",
                    etRangeStr: "12:15 PM - 4:00 PM",
                    isAllDay: false
                },
                null,
                { etRangeStr: "allday", isAllDay: true },
            ]

        }

    },
    {
        name: "landmark 2",
        imgUrl: "https://firebasestorage.googleapis.com/v0/b/knightloo.appspot.com/o/IMG_2818.jpg?alt=media&token=f3445847-8c4a-415a-a02d-632c54111d7b",
        longitude: -81.21222699490872 + 0.0002,
        latitude: 28.584756320548234 + 0.0002,
        hopData: {
            displayableHopData: [
                {
                    days: ["Mon-Tue", "Fri"],
                    daysInNum: [0, 1, 4],
                    isAllDay: false,
                    startEtHour: 12,
                    startEtMin: 15,
                    startEtDayTime: 'PM',
                    endEtHour: 4,
                    endEtMin: 0,
                    endEtDayTime: 'PM',
                    etRangeStr: "12:15 PM - 4:00 PM"
                },
                {
                    days: ["Sun"],
                    isAllDay: true,
                }
            ],
            flattenedHopDataForFilteringAndMutating: [
                {
                    startUtcInMilli: getUTCDateFromHoursAndMins(12, 15, "PM"),
                    endUtcInMilli: getUTCDateFromHoursAndMins(4, 0, "PM"),
                    // etRangeStr: "12:15-16:00",
                    etRangeStr: "12:15 PM - 4:00 PM",
                    isAllDay: false
                },
                {
                    startUtcInMilli: getUTCDateFromHoursAndMins(12, 15, "PM"),
                    endUtcInMilli: getUTCDateFromHoursAndMins(4, 0, "PM"),
                    // etRangeStr: "9:00-17:00",
                    etRangeStr: "12:15 PM - 4:00 PM",
                    isAllDay: false
                },
                    null,
                    null,
                {
                    startUtcInMilli: getUTCDateFromHoursAndMins(12, 15, "PM"),
                    endUtcInMilli: getUTCDateFromHoursAndMins(4, 0, "PM"),
                    // etRangeStr: "9:00-17:00",
                    etRangeStr: "12:15 PM - 4:00 PM",
                    isAllDay: false
                },
                null,
                { etRangeStr: "allday", isAllDay: true },
            ]

        }
    }
];

const landmarksAfterQueryTest = [
    {
        name: "Test landmark 1",
        imgUrl: "https://firebasestorage.googleapis.com/v0/b/knightloo.appspot.com/o/IMG_2818.jpg?alt=media&token=f3445847-8c4a-415a-a02d-632c54111d7b",
        longitude: -81.21222699490872 - 0.0004,
        latitude: 28.584756320548234 - 0.0004,
        displayableHopData: [
            {
                days: ["Mon-Tue", "Fri"],
                daysInNum: [0, 1, 4],
                isAllDay: false,
                startEtHour: 12,
                startEtMin: 0,
                startEtDayTime: 'PM',
                endEtHour: 4,
                endEtMin: 34,
                endEtDayTime: 'PM',
                // rangeEtStr: "12:00PM-4:34PM",
                // startUtcMilli: getUTCDateFromHoursAndMins(12, 0, "PM"),
                // endUtcMilli: getUTCDateFromHoursAndMins(4, 34, "PM"),
            },
            {
                days: ["Sun"],
                isAllDay: true,
            }
        ],
        flattenedHopDataForFilteringAndMutating: [
            {
                startUtcInMilli: getUTCDateFromHoursAndMins(12, 15, "PM"),
                endUtcInMilli: getUTCDateFromHoursAndMins(4, 0, "PM"),
                etRangeStr: "12:15-16:00",
                isAllDay: false
            },
            {
                startUtcInMilli: getUTCDateFromHoursAndMins(9, 0, "AM"),
                endUtcInMilli: getUTCDateFromHoursAndMins(5, 0, "PM"),
                etRangeStr: "9:00-17:00",
                isAllDay: false
            },
                null,
                null,
                null,
            { etRangeStr: "allday", isAllDay: true },
        ]
    },
    {
        name: "Test landmark 2",
        imgUrl: "https://firebasestorage.googleapis.com/v0/b/knightloo.appspot.com/o/IMG_2818.jpg?alt=media&token=f3445847-8c4a-415a-a02d-632c54111d7b",
        longitude: -81.21222699490872 + 0.0004,
        latitude: 28.584756320548234 + 0.0004,
        displayableHopData: [
            {
                days: ["Mon-Tue", "Fri"],
                daysInNum: [0, 1, 4],
                isAllDay: false,
                startEtHour: 12,
                startEtMin: 0,
                startEtDayTime: 'PM',
                endEtHour: 4,
                endEtMin: 34,
                endEtDayTime: 'PM',
                // rangeEtStr: "12:00PM-4:34PM",
                // startUtcMilli: getUTCDateFromHoursAndMins(12, 0, "PM"),
                // endUtcMilli: getUTCDateFromHoursAndMins(4, 34, "PM"),
            },
            {
                days: ["Sun"],
                isAllDay: true,
            }
        ],
        flattenedHopDataForFilteringAndMutating: [
            {
                startUtcInMilli: getUTCDateFromHoursAndMins(12, 15, "PM"),
                endUtcInMilli: getUTCDateFromHoursAndMins(4, 0, "PM"),
                etRangeStr: "12:15-16:00",
                isAllDay: false
            },
            {
                startUtcInMilli: getUTCDateFromHoursAndMins(9, 0, "AM"),
                endUtcInMilli: getUTCDateFromHoursAndMins(5, 0, "PM"),
                etRangeStr: "9:00-17:00",
                isAllDay: false
            },
                null,
                null,
                null,
            { etRangeStr: "allday", isAllDay: true },
        ]
    }
];

const landmarksAfterQueryTestV2 = [
    {
        name: "Test landmark 1",
        imgUrl: "https://firebasestorage.googleapis.com/v0/b/knightloo.appspot.com/o/IMG_2818.jpg?alt=media&token=f3445847-8c4a-415a-a02d-632c54111d7b",
        longitude: -81.198124,
        latitude: 28.601662
    },
    {
        name: "Test landmark 2",
        imgUrl: "https://firebasestorage.googleapis.com/v0/b/knightloo.appspot.com/o/IMG_2818.jpg?alt=media&token=f3445847-8c4a-415a-a02d-632c54111d7b",
        longitude: -81.198653,
        latitude: 28.602032
    }
];


export default function LandmarkMapScreen({navigation, route}) {

    const Stack = createStackNavigator();

    const mapRef = useRef(null);

    // const signInToContinueSheetRef = useRef();

    const {filterQuery, setRegion, region, location, selectedLandmark, setSelectedLandmark} = useContext(AppContext);

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
                                // headerLeft: () => (
                                //     <Button
                                //         onPress={() => navigation.replace("List View", {prevScreen: "Map"})}
                                //         title={"List"}
                                //         color="#007bff"
                                //     />
                                // ), 
                                // headerLeftContainerStyle: {paddingLeft: 5},
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
                                // headerRight: () => (
                                // <Button
                                //     onPress={() => {
                                //         navigation.navigate("Filter Screen")
                                //     }}
                                //     title="Filter"
                                //     color="#007bff"
                                // />
                                // ), 
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
                                // headerRightContainerStyle: {paddingRight: 5},
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
                                // headerLeft: () => (
                                //     <Button
                                //         onPress={() => navigation.replace("Map View", {prevScreen: "List"})}
                                //         title={"Map"}
                                //         color="#007bff"
                                //     />
                                // ), 


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


                                // headerLeftContainerStyle: {paddingLeft: 5},
                                // headerRight: () => (
                                // <Button
                                //     onPress={() => navigation.navigate("Filter Screen")}
                                //     title="Filter"
                                //     color="#007bff"
                                // />
                                // ), 
                                // headerRightContainerStyle: {paddingRight: 5},
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
                                // headerRight: () => (
                                //     <Button
                                //         onPress={() => alert("Reset button pressed!")}
                                //         title="Reset"
                                //         color="#007bff"
                                //     />
                                // ), 
                                // headerRightContainerStyle: {paddingRight: 5}
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