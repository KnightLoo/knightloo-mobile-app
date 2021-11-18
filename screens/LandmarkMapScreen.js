import React, { useState, useEffect, useRef, useContext, useLayoutEffect } from 'react';
import { StyleSheet, Text, View, Button, Easing } from 'react-native';
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

    const [landmarks, setLandmarks] = useState(landmarksTest);
    // useLayoutEffect(() => {
    //     const routeName = getFocusedRouteNameFromRoute(route);

    //     console.log(routeName);

    //     // if (routeName === "Filter Screen2"){
    //     //     navigation.setOptions({tabBarStyle: {display: 'none'}});
    //     // }else {
    //     //     navigation.setOptions({tabBarStyle: {
    //     //         display: 'flex',
    //     //         backgroundColor: '#202020',
    //     //         borderTopColor: '#404040',
    //     //         borderTopWidth: 1,
    //     //     }});
    //     // }
    //     if(routeName === "Map View" || routeName === "List View"){
    //             navigation.setOptions({tabBarStyle: {
    //             display: 'flex',
    //             // backgroundColor: '#202020',
    //             // borderTopColor: '#404040',
    //             // borderTopWidth: 1,
    //         }});
    //     }
    // }, [navigation, route]);



    // const [location, setLocation] = useState(null);
    // const [errorMsg, setErrorMsg] = useState(null);
    // const [region, setRegion] = useState(null);

    
    const backRef = useRef();
    // const [selectedLandmark, setSelectedLandmark] = useState(null);

    useEffect(() => {

        async function getBathroomsFromDb(){

            const filQuery = filterQuery;

            const query = createBathroomQuery(filQuery);

            if(query != null){
                
                // const querySnapshot = await getDocs(query);
                const querySnapshot = await query.get();

                //   //     if(doc.exists){
//   //       console.log(doc.data());
//   //       setDocData(doc.data());
//   //     } else {
//   //       console.log("doc doesnt exist");
//   //     }
                if(querySnapshot.empty){
                    console.log("no documents found");
                    setSelectedLandmark(null);
                    setLandmarks(null);
                } else {
                    // const bathrooms = querySnapshot.docs.map(doc => ({id: doc.id, ...doc.data()}));
                    const bathrooms = querySnapshot.docs.map(doc => doc.data());
                    const testUserLoc = [28.606680, -81.198185];
                    // const filteredBathrooms = filterBathroomResults(bathrooms, filQuery.showOpenBathroomsOnly, filQuery.maxRadiusInFeet, testUserLoc);
                    const filteredBathrooms = filterBathroomResults(bathrooms, filQuery.showOpenBathroomsOnly, filQuery.maxRadiusInFeet, [location.coords.latitude, location.coords.longitude]);
                    setSelectedLandmark(null);

                    if(filteredBathrooms && filteredBathrooms.length == 0){
                        setLandmarks(null);
                    } else {
                        // console.log("num filter brooms: ", filteredBathrooms.length);
                        // console.log(filteredBathrooms[0].building);
                        setLandmarks(filteredBathrooms);
                    }
                }
            }
            // setSelectedLandmark(null);
            // setLandmarks(null);
        }

        if(Object.keys(filterQuery).length > 0){
            // console.log(filterQuery);
            // console.log("getting bathrooms from db");
            getBathroomsFromDb();
        }

    }, [filterQuery]);



    // useEffect(() => {

    //     console.log(filterQuery);

    //     async function getLocation(){
    //         let { status } = await Location.requestForegroundPermissionsAsync();
    //         if (status !== 'granted') {
    //             setErrorMsg('Permission to access location was denied');
    //             return;
    //         }

    //         let location = await Location.getCurrentPositionAsync({});

    //         let region = {
    //             latitude: location.coords.latitude || 37.78825,
    //             longitude: location.coords.longitude || -122.4324,
    //             latitudeDelta: 0.015684156756595513,
    //             longitudeDelta: 0.008579808767251507,
    //         };

    //         setLocation(location);
    //         setRegion(region);
    //     }

    //     if(filterQuery == null){
    //         getLocation();
    //     } else {
    //         setLandmarks(landmarksAfterQueryTestV2);
    //         // mapRef.current.fitToElements({animated: false});
    //     }

        
    //     // (async () => {
    //     //     let { status } = await Location.requestForegroundPermissionsAsync();
    //     //     if (status !== 'granted') {
    //     //         setErrorMsg('Permission to access location was denied');
    //     //         return;
    //     //     }

    //     //     let location = await Location.getCurrentPositionAsync({});

    //     //     let region = {
    //     //         latitude: location.coords.latitude || 37.78825,
    //     //         longitude: location.coords.longitude || -122.4324,
    //     //         latitudeDelta: 0.015684156756595513,
    //     //         longitudeDelta: 0.008579808767251507,
    //     //     };

    //     //     setLocation(location);
    //     //     setRegion(region);
    //     // })();

    // }, [filterQuery]);

    // let text = 'Waiting..';
    // if (errorMsg) {
    //     text = errorMsg;
    // } else if (location) {
    //     text = JSON.stringify(location);
    // }


    const handleSheetPress = () => {
        console.log('about to navigate');
        navigation.navigate("Details View");
    };

    return (

        <>
            {region ?
                <LandmarkMapProvider value={{region, landmarks, handleSheetPress, mapRef}}>
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
                                animationEnabled: true,
                                headerLeft: () => (
                                    <Button
                                        onPress={() => navigation.replace("List View", {prevScreen: "Map"})}
                                        title={"List"}
                                        color="#007bff"
                                    />
                                ), 
                                headerLeftContainerStyle: {paddingLeft: 5},
                                headerRight: () => (
                                <Button
                                    onPress={() => {
                                        // navigation.setOptions({tabBarStyle: {display: 'none'}});
                                        navigation.navigate("Filter Screen")
                                    }}
                                    title="Filter"
                                    color="#007bff"
                                />
                                ), 
                                headerRightContainerStyle: {paddingRight: 5},
                               
                            })}
                        />
                        <Stack.Screen 
                            name="List View" 
                            component={ListView}
                            options={({navigation}) => ({
                                animationEnabled: true,
                                headerLeft: () => (
                                    <Button
                                        onPress={() => navigation.replace("Map View", {prevScreen: "List"})}
                                        title={"Map"}
                                        color="#007bff"
                                    />
                                ), 
                                headerLeftContainerStyle: {paddingLeft: 5},
                                headerRight: () => (
                                <Button
                                    onPress={() => navigation.navigate("Filter Screen")}
                                    title="Filter"
                                    color="#007bff"
                                />
                                ), 
                                headerRightContainerStyle: {paddingRight: 5},
                                // ...flipOptions
                            })}
                        />
                        <Stack.Screen 
                            name="Details View" 
                            component={LandmarkDetailScreen}
                            ref={backRef}
                            options={{
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

            {/* <SignInToContinueBottomSheet navigation={navigation} signInToContinueSheetRef={signInToContinueSheetRef}/> */}

        </>
    );
}


// function ListView(){
//     return(
//         <View style={styles.screen}>
//             <Text>
//                 List View
//             </Text>
//         </View>
//     );
// }



const styles = StyleSheet.create({

    screen: {
        flex: 1,
        backgroundColor: 'white',
        alignItems: 'center',
        justifyContent: 'center',
    }
});


