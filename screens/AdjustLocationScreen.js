import React, {useEffect, useState, useRef, useContext, forwardRef, useImperativeHandle} from 'react';
import { StyleSheet, Button, Text, View, Dimensions, Pressable } from 'react-native';
import AppContext from '../contexts/AppContext';
import { FontAwesome5 } from '@expo/vector-icons';
import MapView from 'react-native-maps';

export default AdjustLocationScreen = forwardRef( ({navigation}, ref) => {

    const {landmarkUnderEdit, editMapScreenRef, setEditedMapLocation, editedMapLocation} = useContext(AppContext);
    const editLocationMapRef = useRef();

    const [mapCenter, setMapCenter] = useState(null);

    useImperativeHandle(editMapScreenRef, () => ({

        setEditedLocation(){
            editLocationMapRef.current.getCamera().then(camera => {
                console.log(camera);
                setEditedMapLocation({longitude: camera.center.longitude, latitude: camera.center.latitude});
                navigation.goBack();
            });
        }
    }));


    const getCenterPosition = () => {

        editLocationMapRef.current.getCamera().then(camera => {
            // console.log("cur camera: ", camera);
            editLocationMapRef.current.pointForCoordinate({latitude: camera.center.latitude, longitude: camera.center.longitude}).then(point => {
                // console.log("camera xy: ", point);
                // console.log("window width: ", Dimensions.get('window').width);
                // console.log("window height: ", Dimensions.get('window').height);
                setMapCenter(point);
            });
        });
    };

    return (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        {/* <Text style={{ fontSize: 30 }}>Adjust Location Screen</Text>
        <Button onPress={() => navigation.goBack()} title="Dismiss" /> */}
            <View style={styles.mapContainer}>
                            
                <MapView
                    // legalLabelInsets={{top: -30, right: 0, left: 0, bottom: 0}}
                    ref={editLocationMapRef}
                    onMapReady={getCenterPosition}
                    showsUserLocation={false}
                    showsMyLocationButton={false}
                    style={styles.map}
                    initialRegion={{
                        latitude: editedMapLocation.latitude,
                        longitude: editedMapLocation.longitude,
                        // latitude: landmarkUnderEdit.latitude,
                        // longitude: landmarkUnderEdit.longitude,
                        // latitudeDelta: 0.0018652108904291254,
                        // longitudeDelta: 0.002244906182966133,
                        latitudeDelta: 0.001,
                        longitudeDelta: 0.002,
                    }}
                    // onRegionChangeComplete={(region) => console.log(region)}
                >
                    {/* <MapView.Marker 
                        coordinate={{
                            latitude: landmarkUnderEdit.latitude,
                            longitude: landmarkUnderEdit.longitude,
                        }}
                    /> */}
                </MapView>
                            
                {mapCenter && 
                    <View style={[{position: 'absolute'}, {top: mapCenter.y, left: mapCenter.x, marginTop: -55, marginLeft: -20.75}]}>
                        <View style={{position: 'relative'}} onLayout={(e) => console.log(e.nativeEvent.layout) }>
                            <FontAwesome5 name="map-marker" size={55} color="gold" />
                            <FontAwesome5 name="toilet" size={24} color="black" style={{position: 'absolute', zIndex: 99, margin: 'auto', top: 10, left: 0, right: 0, bottom: 0, textAlign: 'center', textAlignVertical: 'center'}}/>
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