import React, { useRef, useContext } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import AppContext from '../contexts/AppContext';
import { FontAwesome5 } from '@expo/vector-icons';
import MapView from 'react-native-maps';
import { Marker } from "react-native-maps";

export default function ViewOnMapScreen({navigation}) {

    const viewOnMapRef = useRef();
    const {selectedBookmarkedLandmark} = useContext(AppContext);

    const handleLandmarkMarkerPress = (e) => {

        const region = {
            longitude: selectedBookmarkedLandmark.longitude,
            latitude: selectedBookmarkedLandmark.latitude,
            latitudeDelta: 0.001,
            longitudeDelta: 0.002,
        };

        viewOnMapRef?.current.animateToRegion(region, 300);
    };

    return (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>

            {selectedBookmarkedLandmark ? 
                (<View style={styles.mapContainer}>
                                
                    <MapView
                        ref={viewOnMapRef}
                        showsUserLocation={true}
                        showsMyLocationButton={true}
                        style={styles.map}
                        initialRegion={{
                            latitude: selectedBookmarkedLandmark.latitude,
                            longitude: selectedBookmarkedLandmark.longitude,
                            latitudeDelta: 0.001,
                            longitudeDelta: 0.002,
                        }}
                    >
                        <Marker
                                stopPropagation
                                identifier={"bathroom-icon"}
                                key={"bathroom-icon"}
                                coordinate={{ longitude: selectedBookmarkedLandmark.longitude, latitude: selectedBookmarkedLandmark.latitude }}
                                onPress={e => handleLandmarkMarkerPress(e)}
                            >
                                <View style={{position: 'relative'}} onLayout={(e) => console.log(e.nativeEvent.layout) }>
                                    <FontAwesome5 name="map-marker" size={55} color="gold" />
                                    <FontAwesome5 name="toilet" size={24} color="black" style={styles.bathroomIcon}/>
                                </View>
                            </Marker>
                    </MapView>
                </View>) : 
                (<View><Text>Error</Text></View>) 
            }
        </View>
    );
}


const styles = StyleSheet.create({
    screen: {
        flex: 1,
        width: '100%',
    },
    mapContainer: {
        width: '100%',
        height: '100%',
        borderTopWidth: 1,
        borderTopColor: '#D3D3D3',
        borderBottomWidth: 1,
        borderBottomColor: '#D3D3D3',
        marginVertical: 10
    },
    map: {
        flex: 1,
        width: '100%',
        height: '100%'
    },
    markerFixed: {
        left: '50%',
        marginLeft: -20,
        marginTop: -55,
        position: 'absolute',
        top: '50%'
    },
    marker: {
        height: 48,
        width: 48
    },
    bathroomIcon: {
        position: 'absolute', 
        zIndex: 99, 
        margin: 'auto', 
        top: 10, 
        left: 0, 
        right: 0, 
        bottom: 0, 
        textAlign: 'center', 
        textAlignVertical: 'center'
    }
});