import React, { useState, useRef, useCallback, useContext } from 'react';
import { StyleSheet, Dimensions, View, Text } from 'react-native';
import {default as ReactNativeMapView} from 'react-native-maps';
import LandmarkBottomSheetView from '../components/LandmarkBottomSheetView';
import LandmarkMapContext from '../contexts/LandmarkMapContext';

export default function MapView() {

    const {region: initialRegion, landmarks} = useContext(LandmarkMapContext);
    const windowHeight = Dimensions.get("window").height;

    const [selectedMarker, setSelectedMarker] = useState(null);

    const mapRef = useRef(null);
    const bottomSheetModalRef = useRef(null);

    const handleSheetChanges = useCallback((index) => {
        // console.log('handleSheetChanges', index);
    }, []);

    const handleMarkerSelectionChange = (e, selectedMarkerId) => {

        if(selectedMarkerId != null){
         
            const tapCoord = e.nativeEvent.coordinate;
            
            mapRef.current.pointForCoordinate(tapCoord).then((point) => {

                if(point.y >= (windowHeight/2)){
                    mapRef.current.getCamera().then((curCam) => {
                        mapRef.current.animateCamera({ center: {latitude: tapCoord.latitude, longitude: curCam.center.longitude} }, { duration: 1000 });
                    });
                }
            });

            setSelectedMarker(selectedMarkerId);
            bottomSheetModalRef.current?.snapToIndex(0);
        } else {
            // console.log("Deselected marker");
            setSelectedMarker(null);
            bottomSheetModalRef.current?.close();
        }
    };

    return (
        <View style={mapStyles.container}>
            <ReactNativeMapView
                showsUserLocation={true}
                showsMyLocationButton={true}
                ref={mapRef}
                style={mapStyles.map}
                
                initialRegion={initialRegion}
                onPress={e => {
                    handleMarkerSelectionChange(null);
                }}
            >
                {landmarks.map((landmark, i) => (
                        <ReactNativeMapView.Marker
                            stopPropagation
                            identifier={`${i}`}
                            key={i}
                            coordinate={{ longitude: landmark.longitude, latitude: landmark.latitude }}
                            onPress={e => handleMarkerSelectionChange(e, i)}
                            pinColor={selectedMarker === i ? "red" : "green"}
                        />
                    )
                )}
            </ReactNativeMapView>

            
            <LandmarkBottomSheetView sheetRef={bottomSheetModalRef} handleSheetChanges={handleSheetChanges} landmark={selectedMarker != null ? landmarks[selectedMarker]: null}/>
                
        </View>
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
    }
});