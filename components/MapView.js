import React, { useState, useRef } from 'react';
import { StyleSheet, Dimensions } from 'react-native';
import {default as ReactNativeMapView} from 'react-native-maps';

export default function MapView({ markers, initialRegion }) {

    const [selectedMarker, setSelectedMarker] = useState(null);

    const mapRef = useRef(null);

    const handleMarkerPress = (e, markerId) => {

        console.log(`pressed ${markerId}`);
        mapRef.current.animateCamera({ center: e.nativeEvent.coordinate }, { duration: 1000 });
        setSelectedMarker(markerId);

    };


    return (
        <ReactNativeMapView
            showsUserLocation={true}
            showsMyLocationButton={true}
            ref={mapRef}
            style={mapStyles.map}
            
            initialRegion={initialRegion}
            onPress={e => {
                console.log("deselected");
                setSelectedMarker(null);
            }}
        >
            {markers.map((marker, i) => (
                    <ReactNativeMapView.Marker
                        stopPropagation
                        identifier={`${i}`}
                        key={i}
                        coordinate={{ longitude: marker.longitude, latitude: marker.latitude }}
                        onPress={e => handleMarkerPress(e, i)}
                        pinColor={selectedMarker === i ? "red" : "green"}
                    />
                )
            )}
        </ReactNativeMapView>
    );
}

const mapStyles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
    map: {
        width: Dimensions.get('window').width,
        height: Dimensions.get('window').height,
    },
});