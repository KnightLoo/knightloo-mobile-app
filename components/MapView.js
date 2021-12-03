import React, { useState, useRef, useCallback, useContext, useEffect, useLayoutEffect } from 'react';
import { StyleSheet, Dimensions, View, Text, Easing } from 'react-native';
import {default as ReactNativeMapView} from "react-native-map-clustering";
import { Marker } from "react-native-maps";
import LandmarkBottomSheetView from '../components/LandmarkBottomSheetView';
import AppContext from '../contexts/AppContext';
import LandmarkMapContext from '../contexts/LandmarkMapContext';
import { CardStyleInterpolators, TransitionSpecs } from '@react-navigation/stack';

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


const useComponentSize = () => {
    const [size, setSize] = useState(null);
  
    const onLayout = useCallback(event => {
      const { width, height } = event.nativeEvent.layout;
      setSize({ width, height });
    }, []);
  
    return [size, onLayout];
};


export default function MapView({navigation, route}) {

    const {region: initialRegion, landmarks,  mapRef, curMapRegion, setCurMapRegion} = useContext(LandmarkMapContext);
    const {bottomSheetModalRef, setSelectedLandmark} = useContext(AppContext);
    const [size, onLayout] = useComponentSize();
    const [selectedMarker, setSelectedMarker] = useState(null);


    const handleSheetChanges = useCallback((index) => {
        // console.log('handleSheetChanges', index);
        // mapRef.current.fitToElements();
            // if(mapRef.current){
            //     const coords = landmarks.map(landmark => { 
            //         return {latitude: landmark.latitude, longitude: landmark.longitude};
            //     });

            //     console.log(coords);

            //     // mapRef.current.fitToElements(false);

            //     mapRef.current.getMapBoundaries().then(({northEast, southWest}) => {
            //         // console.log(northEast);
            //         // console.log(southWest);
                    
            //         let upperBoundLat = northEast.latitude;
            //         let lowerBoundLat = southWest.latitude;

            //         if(upperBoundLat < lowerBoundLat){
            //             let temp = upperBoundLat;
            //             upperBoundLat = lowerBoundLat;
            //             lowerBoundLat = temp;
            //         }

            //         let upperBoundLong = northEast.longitude;
            //         let lowerBoundLong = southWest.longitude;

            //         if(upperBoundLong < lowerBoundLong){
            //             let temp = upperBoundLong;
            //             upperBoundLong = lowerBoundLong;
            //             lowerBoundLong = temp;
            //         }

            //         let shouldAnimate = false;

            //         //
            //         for(const latLong of coords){
            //             if(latLong.latitude < lowerBoundLat || 
            //                latLong.latitude > upperBoundLat ||
            //                latLong.longitude < lowerBoundLong ||
            //                latLong.longitude > upperBoundLong){

            //                 shouldAnimate = true;
            //                 break;
            //             }
            //         }

            //         console.log("shouldAnimate: ", shouldAnimate);

            //         if(shouldAnimate){
            //             mapRef.current.fitToCoordinates(coords, {edgePadding: {top: 120, right: 120, bottom: 120, left: 120}});
            //             // mapRef.current.animateCamera({ center: {latitude: northEast.latitude, longitude: northEast.longitude} }, { duration: 1000 });
            //         }
            //     });
            //     // mapRef.current.fitToCoordinates(cords, {edgePadding: {top: 120, right: 120, bottom: 120, left: 120}});
            // }

    }, []);


    useEffect(() => {

        setSelectedMarker(null);
        
        if(mapRef.current && landmarks){
            const coords = landmarks.map(landmark => { 
                return {latitude: landmark.latitude, longitude: landmark.longitude};
            });

            mapRef.current.getMapBoundaries().then(({northEast, southWest}) => {
                
                let upperBoundLat = northEast.latitude;
                let lowerBoundLat = southWest.latitude;

                if(upperBoundLat < lowerBoundLat){
                    let temp = upperBoundLat;
                    upperBoundLat = lowerBoundLat;
                    lowerBoundLat = temp;
                }

                let upperBoundLong = northEast.longitude;
                let lowerBoundLong = southWest.longitude;

                if(upperBoundLong < lowerBoundLong){
                    let temp = upperBoundLong;
                    upperBoundLong = lowerBoundLong;
                    lowerBoundLong = temp;
                }

                let shouldAdjustMap = false;

                // loop through marker coordinates to see if any are currently outside of the map's boundaries
                for(const latLong of coords){
                    if(latLong.latitude < lowerBoundLat || 
                       latLong.latitude > upperBoundLat ||
                       latLong.longitude < lowerBoundLong ||
                       latLong.longitude > upperBoundLong){

                        shouldAdjustMap = true;
                        break;
                    }
                }

                if(shouldAdjustMap){
                    // adjust the map so that all the markers are in view
                    mapRef.current.fitToCoordinates(coords, {edgePadding: {top: 120, right: 120, bottom: 120, left: 120}, animated: true});
                }
            });
        }

    }, [landmarks]);

    useLayoutEffect(() => {

        if(route.params && route.params.prevScreen == "List"){
            navigation.setOptions(flipOptions);
        } else {
            navigation.setOptions({});
        }

    }, []);

    const handleMarkerSelectionChange = (e, selectedMarkerId) => {

        if(selectedMarkerId != null){
         
            const tapCoord = e.nativeEvent.coordinate;
            
            mapRef.current.pointForCoordinate(tapCoord).then((point) => {

                const mapHeight = size.height;

                if(point.y >= (mapHeight * 0.8)){
                    mapRef.current.getCamera().then((curCam) => {

                        let sheetY = mapHeight * 0.78;
                        let dispNeeded = point.y - sheetY;

                        mapRef.current.pointForCoordinate(curCam.center).then((curCamPoint) => {
                            
                            let newCamCenterPointY = curCamPoint.y + dispNeeded;

                            mapRef.current.coordinateForPoint({x: curCamPoint.x, y: newCamCenterPointY}).then((newCam) => {

                                mapRef.current.animateCamera({ center: {latitude: newCam.latitude, longitude: curCam.center.longitude} }, { duration: 1000 });

                            });
                        });
                    });
                }
            });

            setSelectedLandmark(landmarks[selectedMarkerId]);
            setSelectedMarker(selectedMarkerId);
            bottomSheetModalRef.current?.snapToIndex(0);
        } else {
            setSelectedLandmark(null);
            setSelectedMarker(null);
            bottomSheetModalRef.current?.close();
        }
    };


    return (
        <View style={mapStyles.container} onLayout={onLayout}>
            <ReactNativeMapView
                onRegionChangeComplete={(region) => setCurMapRegion(region)}
                animationEnabled={false} // ffca06
                clusterColor={"#b7a369"} // cc9900, b7a369
                clusteringEnabled={true}
                showsUserLocation={true}
                followsUserLocation={false}
                showsMyLocationButton={true}
                ref={mapRef}
                style={mapStyles.map}
                initialRegion={curMapRegion || initialRegion}
                onPress={e => {
                    handleMarkerSelectionChange(null);
                }}
            >
                {landmarks && landmarks.map((landmark, i) => (
                        <Marker
                            stopPropagation
                            identifier={`${landmark.id}`}
                            key={landmark.id}
                            coordinate={{ longitude: landmark.longitude, latitude: landmark.latitude }}
                            onPress={e => handleMarkerSelectionChange(e, i)}
                        >
                            <View style={selectedMarker === i ? mapStyles.selectedMarkerOuter : mapStyles.unselectedMarkerOuter}>
                                <View style={selectedMarker === i ? mapStyles.selectedMarkerInner : mapStyles.unselectedMarkerInner }/>
                            </View>
                        </Marker>
                    )
                )}
            </ReactNativeMapView>
            {landmarks &&
                <LandmarkBottomSheetView sheetRef={bottomSheetModalRef} handleSheetChanges={handleSheetChanges} landmark={landmarks != null && selectedMarker != null ? landmarks[selectedMarker]: null}/> 
            }
                
        </View>
    );
}

const mapStyles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
        // borderWidth: 1,
        // borderColor: 'red',
        height: '100%'
    },
    map: {
        width: '100%',
        height: '100%',
    },
    selectedMarkerStyle: {
        overflow: 'hidden',
        width: 22,
        height: 22,
        borderRadius: 22 / 2,
        backgroundColor: 'gold',
        borderColor: 'black',
        borderWidth: 3
    },
    unselectedMarkerStyle: {
        overflow: 'hidden',
        width: 22,
        height: 22,
        borderRadius: 11,
        backgroundColor: 'red',
        borderColor: 'white',
        borderWidth: 3,
        
    },
    selectedMarkerOuter: {
        overflow: 'hidden',
        width: 22,
        height: 22,
        borderRadius: 22 / 2,
        backgroundColor: 'white',
    },
    unselectedMarkerOuter: {
        overflow: 'hidden',
        width: 22,
        height: 22,
        borderRadius: 11,
        backgroundColor: 'white',        
    },
    selectedMarkerInner: {
        overflow: 'hidden',
        width: 16,
        height: 16,
        margin: 3,
        borderRadius: 16 / 2,
        backgroundColor: 'gold',
    },
    unselectedMarkerInner: {
        overflow: 'hidden',
        width: 16,
        height: 16,
        margin: 3,
        borderRadius: 8,
        backgroundColor: 'grey',        
    }
});