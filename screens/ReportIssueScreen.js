import React, {useEffect, useState, useRef, useContext, forwardRef, useImperativeHandle} from 'react';
import { StyleSheet, Button, Text, TextInput, View, Dimensions, Pressable, Platform, ScrollView, SafeAreaView, KeyboardAvoidingView, TouchableWithoutFeedback, Keyboard, LayoutAnimation} from 'react-native';
import AppContext from '../contexts/AppContext';
import ReportIssueStackContext from '../contexts/ReportIssueStackContext';
import * as Haptics from 'expo-haptics';
import { FontAwesome5 } from '@expo/vector-icons';
import { Ionicons } from '@expo/vector-icons';
import MapView from 'react-native-maps';
// import { SafeAreaView } from 'react-native-safe-area-context';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { useHeaderHeight } from '@react-navigation/elements';

import firebase from 'firebase/app';
import 'firebase/firestore';
import Firebase from '../utils/Firebase';

const db = Firebase.firestore();

const keyboardType = Platform.OS === "ios" ? "ascii-capable": "default";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { cloneDeep, set } from 'lodash';


const updatedTimeslotDataTest = {startUtcInMilli: 0, endUtcInMilli: 0, etRangeStr: "", isAllDay: false, days: [0, 1, 5]};

const dummyTimeslots = [
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
];

export default ReportIssueScreen = forwardRef( ({navigation}, ref) => {

    const {landmarkUnderEdit, curLandmarkHopData, setCurLandmarkHopData, editedMapLocation, reportIssueScreenRef} = useContext(AppContext);

    const {setHasNameBeenEdited, setHasLocationBeenEdited, setHasHopBeenEdited} = useContext(ReportIssueStackContext);

    const [editedBathroomName, setEditedBathroomName] = useState(landmarkUnderEdit.building);

    const previewEditMapRef = useRef();

    const [mapCenter, setMapCenter] = useState(null);

    const toiletIconTopMargin = Platform.OS === "ios" ? 10 : -5;

    useImperativeHandle(reportIssueScreenRef, () => ({

        async submitLandmarkIssue(){

            console.log("in submit landmark issue");
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

            let edits = {};

            console.log("djksjkdjkdjkjdkjdkjdkjdkjfkdjkfdjdkjdkjdkdjkd");

            if(editedBathroomName != null && editedBathroomName != "" && editedBathroomName != landmarkUnderEdit.building){
                edits["edited_bathroom_name"] = editedBathroomName;
            }

            if(curLandmarkHopData != null && curLandmarkHopData.displayableHopData != null){
                edits["edited_hop_data"] = cloneDeep(curLandmarkHopData);
            }

            if(editedMapLocation != null && (editedMapLocation.longitude != landmarkUnderEdit.longitude || editedMapLocation.latitude != landmarkUnderEdit.latitude)){
                edits["edited_location_data"] = {
                    "longitude": editedMapLocation.longitude, 
                    "latitude": editedMapLocation.latitude
                };
            }

            console.log("before hereerrerrrrrr");

            if(Object.keys(edits).length > 0){
                console.log("$$$$$$$$$$$$$$$$$$$$$$$$$$$$$");
                edits["landmark_id"] = landmarkUnderEdit.id;
                edits["gender"] = landmarkUnderEdit.gender;
                edits["building"] = landmarkUnderEdit.building;
                edits["floor"] = landmarkUnderEdit.floor;
                edits["status"] = "pending";

                const landmarkReportedIssuesRef = db.collection("landmark_reported_issues");

                try {
                    console.log(edits);
                    await landmarkReportedIssuesRef.add(edits);
                    navigation.goBack();
                } catch(error){
                    console.log("Error saving reported issue", error);
                }
            }
        }
    }));



    function getAffectedDayIndices(rangeStrsArr){
        const dayNameToIndex = {"Mon": 0, "Tue": 1, "Wed": 2, "Thu": 3, "Fri": 4, "Sat": 5, "Sun": 6};

        const dayIndices = rangeStrsArr.reduce((prev, curr, i) => {
            
            const days = curr.split("-").map(day => dayNameToIndex[day]);

            if(days.length !== 2){
                return prev.concat(days);
            } else {
                const fullDays = Array(days[1] - days[0] + 1).fill().map((_, idx) => days[0] + idx)
                return prev.concat(fullDays);
            }
            
        }, []);

        return dayIndices;
    }

    const handleTimeslotDelete = (i) => {

        // console.log("delete pressed");
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

        let timeslotsAfterDeletion = [];

        const curHopData = cloneDeep(curLandmarkHopData);

        const deletedTimeslotData = curHopData.displayableHopData[i];

        const affectedDayIndices = getAffectedDayIndices(deletedTimeslotData.days);
    
        let newFlattenedHopDataForFilteringAndMutating = curHopData.flattenedHopDataForFilteringAndMutating;

        for(const ind of affectedDayIndices){
            newFlattenedHopDataForFilteringAndMutating[ind] = null;
        }

        if(i == 0){
            timeslotsAfterDeletion = curHopData.displayableHopData.slice(1);
        } else {
            timeslotsAfterDeletion = curHopData.displayableHopData.slice(0, i).concat(curHopData.displayableHopData.slice(i+1));    
        }

        // console.log(timeslotsAfterDeletion);
        // console.log(newFlattenedHopDataForFilteringAndMutating);

        if(timeslotsAfterDeletion && timeslotsAfterDeletion.length > 0){
            setCurLandmarkHopData({displayableHopData: timeslotsAfterDeletion, flattenedHopDataForFilteringAndMutating: newFlattenedHopDataForFilteringAndMutating});
        } else {
            setCurLandmarkHopData({displayableHopData: null, flattenedHopDataForFilteringAndMutating: newFlattenedHopDataForFilteringAndMutating});
        }

    };

    const getCenterPosition = () => {

        previewEditMapRef.current.getCamera().then(camera => {
            previewEditMapRef.current.pointForCoordinate({latitude: camera.center.latitude, longitude: camera.center.longitude}).then(point => {
                setMapCenter(point);
            });
        });
    };

    
    const headerHeight = useHeaderHeight();
    const insets = useSafeAreaInsets();

    const offset = headerHeight + insets.top + 12;


    return (
        <KeyboardAvoidingView style={{flex: 1, backgroundColor: 'white'}} behavior={Platform.OS === "ios" ? "padding" : "height"} keyboardVerticalOffset={offset}>
            <ScrollView style={{flex: 1}} contentContainerStyle={{flexGrow: 1}}> 
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <>
                    <View style={styles.nameFieldContainer}>
                        <Text style={styles.fieldHeaderText}>Name</Text>
                        <View style={styles.inputContainer}>
                        <TextInput 
                            clearButtonMode={'while-editing'}
                            keyboardType={keyboardType}
                            style={styles.textInput} 
                            defaultValue={editedBathroomName}
                            autoCorrect={false}
                            onChangeText={(newName) => {
                                setEditedBathroomName(newName);
                                
                                if(newName != landmarkUnderEdit.building){
                                    setHasNameBeenEdited(true);
                                } else {
                                    setHasNameBeenEdited(false);
                                }
                            }}
                            placeholder="Add Name" 
                            multiline={false}
                        />
                        </View>
                        
                    </View>
                    
                    <Text style={[styles.fieldHeaderText, {marginTop: 25}]}>Location</Text>



                
                    <Pressable 
                        style={{height: Dimensions.get("window").height * 0.25, borderWidth: 0, marginTop: 8}}
                        onPress={() => {
                            console.log("Edit Location button pressed");
                            navigation.navigate("Edit Location");
                        }}
                    >
                        <View style={styles.mapContainer} pointerEvents={"none"}>
                            
                            <MapView
                                legalLabelInsets={{top: -30, right: 0, left: 0, bottom: 0}}
                                rotateEnabled={false}
                                zoomEnabled={false}
                                scrollEnabled={false}
                                pitchEnabled={false}
                                ref={previewEditMapRef}
                                onMapReady={getCenterPosition}
                                showsUserLocation={false}
                                showsMyLocationButton={false}
                                style={styles.map}
                                region={{
                                    latitude: editedMapLocation.latitude,
                                    longitude: editedMapLocation.longitude,
                                    latitudeDelta: 0.001,
                                    longitudeDelta: 0.002,
                                }}
                            />
                    

                            {mapCenter && 
                                <View style={[{position: 'absolute'}, {top: mapCenter.y, left: mapCenter.x, marginTop: -55, marginLeft: -20.75}]}>
                                    <View style={{position: 'relative'}}>
                                        <FontAwesome5 name="map-marker" size={55} color="gold" />
                                        <FontAwesome5 name="toilet" size={24} color="black" style={{position: 'absolute', zIndex: 99,  margin: 'auto', top: toiletIconTopMargin, left: 0, right: 0, bottom: 0, textAlign: 'center', textAlignVertical: 'center'}} /> 
                                    </View>
                                </View>
                            }

                            <View style={{ justifyContent: 'center', alignItems: 'center', position: 'absolute', top: '80%', bottom: 0, left: 0, right: 0, backgroundColor: '#efeeeb', borderWidth: 0}}>
                                <Text style={{paddingVertical: 0, color: 'gray'}}>Tap map to edit location</Text>
                            </View>
                        </View>
                    </Pressable>
                    
                    <Text style={[styles.fieldHeaderText, {marginTop: 25}]}>Hours of Operation</Text>

                    <View style={styles.hoursOfOpertionListContainer}>
                        
                        {curLandmarkHopData != null && curLandmarkHopData.displayableHopData != null && curLandmarkHopData.displayableHopData.map((timeslot, i) => (

                            <View key={i} style={[styles.hoursOfOperationItem, {borderTopWidth: i != 0 ? 1: 0}]}>

                                        
                                <View style={styles.daysContainer}>
                                    {timeslot.days.map(day => (
                                        <Text key={day} style={styles.dayItem}>{day}</Text>
                                    ))}
                                </View>

                                <View style={styles.hoursContainer}>
                                    {timeslot.isAllDay ?
                                        <Text style={styles.hourItem}>Open 24 Hours</Text> :
                                        // <Text style={styles.hourItem}>{timeslot.startEtHour}:{String(timeslot.startEtMin).padStart(2, '0')} {timeslot.startEtDayTime} - {timeslot.endEtHour}:{String(timeslot.endEtMin).padStart(2, '0')} {timeslot.endEtDayTime}</Text>
                                        <Text style={styles.hourItem}>{timeslot.etRangeStr}</Text>
                                    }
                                </View>

                                <Pressable onPress={() => handleTimeslotDelete(i)} style={styles.deleteTimeslotIconContainer}>
                                    <Ionicons name="ios-close-circle" size={18} color="#C8C8C8" />
                                </Pressable>
                            </View>
                        ))}

                        <Pressable 
                            style={({ pressed }) => [
                                {backgroundColor: pressed ? "#D0D0D0" : 'white'},
                                
                            ]}
                            onPress={() => {
                                // console.log("Add hours button pressed");
                                navigation.navigate("Hours of Operation");
                            }}
                        >
                            <View style={[styles.addHoursButtonContainer, {borderTopWidth: curLandmarkHopData != null && curLandmarkHopData.displayableHopData != null ? 1 : 0}] }>
                                <Text style={styles.addHoursButtonText}>
                                    Add
                                </Text>
                            </View>
                            
                        
                        </Pressable>
                    </View>
                </>
            </TouchableWithoutFeedback>
            </ScrollView>
        </KeyboardAvoidingView> 
  
    );
});


const styles = StyleSheet.create({
    scrollView: {
        // flex: 1,
        // height: 760,
        // flexGrow: 1, 
        backgroundColor: '#fff',
        // height: '100%'

    },
    screen: {
        flex: 1,
        // flexGrow: 1, 
        justifyContent: 'flex-start',
        backgroundColor: '#fff',
        // alignItems: 'flex-start',
        // justifyContent: 'flex-start',
        // marginTop: StatusBar.currentHeight || 0,
        width: '100%',
        paddingBottom: 10
        // height: '100%'
        // height: 300,
        // borderWidth: 1, 
        // borderColor: 'red'

    },
    mapContainer: {
        // flexGrow: 1, 
        // flex: 1,
        // width: '100%',
        height: '100%',
        borderTopWidth: 1,
        borderTopColor: '#D3D3D3',
        borderBottomWidth: 1,
        borderBottomColor: '#D3D3D3',
        marginVertical: 0,
    },
    map: {
        // flexGrow: 1
        // flex: 1,
        // width: '100%',
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
    nameFieldContainer: {
        // flex: 1,
        width: '100%',
        marginTop: 20,
    },
    fieldHeaderText: {
        color: 'gray',
        fontSize: 17,
        paddingLeft: 15,
    },
    inputContainer: {
        borderBottomColor: '#D3D3D3',
        borderBottomWidth: 1,
        borderTopColor: '#D3D3D3',
        borderTopWidth: 1,
        marginTop: 10,
        paddingHorizontal: 15,
    },
    textInput: {
        fontSize: 17,
    
        // borderBottomColor: '#D3D3D3',
        // borderBottomWidth: 1,
        // borderTopColor: '#D3D3D3',
        // borderTopWidth: 1,
        paddingVertical: 18,
        // paddingHorizontal: 15,
        // marginVertical: 10,
        // marginRight: 10
        // paddingRight: 50
    },
    hoursOfOpertionListContainer: {
        borderBottomColor: '#D3D3D3',
        borderBottomWidth: 1,
        borderTopColor: '#D3D3D3',
        borderTopWidth: 1,
        marginVertical: 10,
    },
    hoursOfOperationItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 14,
        borderTopColor: '#D3D3D3',
        marginLeft: 18
    },
    daysContainer: {
        width: '20%',
        marginRight: 0,
    },
    dayItem: {
        paddingVertical: 2,
        fontSize: 17
    },
    hoursContainer: {
        // justifyContent: 'flex-start',
        // borderWidth: 1,
        // flexGrow: 1
    },
    hourItem: {
        fontSize: 17,
        fontWeight: '600'
    },
    deleteTimeslotIconContainer: {
        // paddingRight: 15,
        marginRight: 15,
        // borderWidth: 1
    },
    addHoursButtonContainer: {
        // width: '100%',
        paddingVertical: 14,
        borderTopColor: '#D3D3D3',
        // borderTopWidth: 1,
        marginLeft: 18
    },
    addHoursButtonText: {
        color: '#007bff',
        fontSize: 17,
        elevation: 3,
    }
});