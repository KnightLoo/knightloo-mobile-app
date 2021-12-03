import React, {useEffect, useState, useRef, useContext, forwardRef, useImperativeHandle} from 'react';
import { StyleSheet, Button, Text, View, Dimensions, Pressable, Platform } from 'react-native';
import AppContext from '../contexts/AppContext';
import ReportIssueStackContext from '../contexts/ReportIssueStackContext';
import { FontAwesome5 } from '@expo/vector-icons';
import MapView from 'react-native-maps';

export default AdjustLocationScreen = forwardRef( ({navigation}, ref) => {

    const {landmarkUnderEdit, editMapScreenRef, setEditedMapLocation, editedMapLocation} = useContext(AppContext);
    const {setHasLocationBeenEdited} = useContext(ReportIssueStackContext);

    const editLocationMapRef = useRef();

    const [mapCenter, setMapCenter] = useState(null);

    const toiletIconTopMargin = Platform.OS === "ios" ? 10 : -5;

    useImperativeHandle(editMapScreenRef, () => ({

        setEditedLocation(){
            editLocationMapRef.current.getCamera().then(camera => {
                // console.log(camera);
                const editedLong = camera.center.longitude;
                const editedLat = camera.center.latitude;

                if(landmarkUnderEdit.longitude != editedLong || landmarkUnderEdit.latitude != editedLat){
                    setHasLocationBeenEdited(true);
                } else {
                    setHasLocationBeenEdited(false);
                }

                setEditedMapLocation({longitude: camera.center.longitude, latitude: camera.center.latitude});
                navigation.goBack();
            });
        }
    }));


    const getCenterPosition = () => {

        editLocationMapRef.current.getCamera().then(camera => {
            editLocationMapRef.current.pointForCoordinate({latitude: camera.center.latitude, longitude: camera.center.longitude}).then(point => {
                setMapCenter(point);
            });
        });
    };

    return (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <View style={styles.mapContainer}>
                            
                <MapView
                    ref={editLocationMapRef}
                    onMapReady={getCenterPosition}
                    showsUserLocation={false}
                    showsMyLocationButton={false}
                    style={styles.map}
                    initialRegion={{
                        latitude: editedMapLocation.latitude,
                        longitude: editedMapLocation.longitude,
                        latitudeDelta: 0.001,
                        longitudeDelta: 0.002,
                    }}
                />
                
                {mapCenter && 
                    <View style={[{position: 'absolute'}, {top: mapCenter.y, left: mapCenter.x, marginTop: -55, marginLeft: -20.75}]}>
                        <View style={{position: 'relative'}} onLayout={(e) => console.log(e.nativeEvent.layout) }>
                            <FontAwesome5 name="map-marker" size={55} color="gold" />
                            <FontAwesome5 name="toilet" size={24} color="black" style={{position: 'absolute', zIndex: 99, margin: 'auto', top: toiletIconTopMargin, left: 0, right: 0, bottom: 0, textAlign: 'center', textAlignVertical: 'center'}}/>
                        </View>
                    </View>
                }

                <View style={{flex: 1, justifyContent: 'center', alignItems: 'center', position: 'absolute', top: 0, bottom: '95%', left: 0, right: 0, backgroundColor: '#efeeeb', opacity: 0.9, borderWidth: 0}}>       
                    <Text style={{paddingVertical: 0, color: 'gray'}}>Pan {"&"} zoom map to refine location</Text>
                </View>

            </View>
                        
        </View>
    );
});


const styles = StyleSheet.create({
    screen: {
        flex: 1,
        width: '100%',
    },
    mapContainer: {
        // flex: 1,
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
});