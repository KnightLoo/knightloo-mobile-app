import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Button, SafeAreaView, Pressable, Dimensions } from 'react-native';
import * as Location from 'expo-location';
import MapView from '../components/MapView';


const mockMarkers = [
    {
        longitude: -81.21222699490872 - 0.002,
        latitude: 28.584756320548234 - 0.002
    },
    {
        longitude: -81.21222699490872 + 0.002,
        latitude: 28.584756320548234 + 0.002
    }
];


export default function LandmarkMapScreen() {

    const [location, setLocation] = useState(null);
    const [errorMsg, setErrorMsg] = useState(null);
    const [region, setRegion] = useState();

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

    // const [pt, setPt] = useState(0);

    let text = 'Waiting..';
    if (errorMsg) {
        text = errorMsg;
    } else if (location) {
        text = JSON.stringify(location);
    }



    return (

        <View >
            {region ?
                <MapView markers={mockMarkers} initialRegion={region} /> :
                <Text style={styles.paragraph}>{text}</Text>
            }
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
})








// import React, { useState, useEffect, useCallback } from 'react';
// import {
//   Dimensions, StatusBar, StyleSheet, Text,
//   TextInput, TouchableOpacity, View, Button
// } from 'react-native';
// import Constants from 'expo-constants';
// import Mapview, { Marker, Callout, PROVIDER_GOOGLE } from 'react-native-maps'
// import * as Location from 'expo-location';
// // import * as Permissions from 'expo-permissions';
// // import datas from './datas.json'
// // You can import from local files

// // import Animated from 'react-native-reanimated';
// // import BottomSheet from 'reanimated-bottom-sheet';

// // or any pure javascript modules available in npm


// export default function LandmarkMapScreen() {
//   const sheetRef = React.useRef(null);
//   const renderContent = () => (
//     <View
//       style={{
//         backgroundColor: 'white',
//         padding: 16,
//         height: 450,
//       }}
//     >
//       <Text>Swipe down to close</Text>

//       <Button
//         title="Open Bottom Sheet"
//         onPress={() => sheetRef.current.snapTo(0)}
//       />

//     </View>
//   );



//   const [state, setState] = useState({
//     "latitude": 60.1098678,
//     "longitude": 24.7385084,
//     "latitudeDelta": 1,
//     "longitudeDelta": 1
//   });

//   useEffect(() => {
//     _onMapReady();
//   }, [_onMapReady]);

//   const _onMapReady = useCallback(async () => {
//     const { status } = await Location.requestForegroundPermissionsAsync();
//     if (status !== `granted`) {
//       console.log(`Permisson Denied`);
//     }
//     else{
//         console.log("Acceptedd");
//     }



    
//     const location = await Location.getCurrentPositionAsync({ "accuracy": Location.Accuracy.High });

//     console.log(location.coords);
//     setState({
//       ...state,
//       "latitude": location.coords.latitude,
//       "longitude": location.coords.longitude
//     });
//   }, [state]);



//   return (
//     <View style={styles.container}>
//       <Mapview
//         provider={PROVIDER_GOOGLE}
//         region={state}
//         showsIndoors={true}
//         showsMyLocationButton={true}
//         zoomControlEnabled={true}
//         zoomEnabled={true}
//         zoomTapEnabled={true}
//         showsScale={true}

//         showsBuildings={true}
//         showsUserLocation={true}
//         showsCompass={true}
//         onMapReady={_onMapReady}

//         style={styles.mapStyle}>
//         {
//           mockMarkers.map((marker, i) => {
//             return (
//               <Marker
//                 coordinate={{
//                   "latitude": marker.latitude,
//                   "longitude": marker.longitude
//                 }}
//                 animation={true}
//                 key={i}

//               >
//                 <Callout
//                   style={{ "width": 100, "height": 50 }}>
//                   <View>
//                     <Text>{"here"}</Text>
//                   </View>
//                 </Callout>
//               </Marker>
//             );
//           })
//         }

//       </Mapview>


//       {/* <BottomSheet
//         ref={sheetRef}
//         snapPoints={[450, 300, 0]}
//         borderRadius={10}
//         renderContent={renderContent}
//       /> */}

//     </View>
//   );
// }
// const styles = StyleSheet.create({
//   container: {
//     "flex": 1,
//     "alignItems": `center`,
//     "justifyContent": `center`
//     // position: 'absolute',

//   },
//   mapStyle: {

//     "height": Dimensions.get(`window`).height,
//     "width": Dimensions.get(`window`).width

//   },

// });