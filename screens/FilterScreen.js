import React, { useState, useEffect, useRef, useContext, forwardRef, useImperativeHandle } from 'react';
import { StyleSheet, Text, View, Button, TouchableHighlight, Switch, SafeAreaView, Pressable, ScrollView, Platform } from 'react-native';
import {ButtonGroup, CheckBox} from 'react-native-elements';
import Slider from '@react-native-community/slider';
import { Ionicons } from '@expo/vector-icons';

import AppContext from '../contexts/AppContext';


export default FilterScreen = forwardRef( ({navigation}, ref) => {

    const {filterQuery, setFilterQuery, filterScreenRef, bottomSheetModalRef} = useContext(AppContext);

    const [showOpenBrOnly, setShowOpenBrOnly] = useState(filterQuery.showOpenBathroomsOnly || false);
    const [showAccessibleBrOnly, setShowAccessibleBrOnly] = useState(filterQuery.showAccessibleBathroomsOnly || false);

    const [selectedMaxRadius, setSelectedMaxRadius] = useState(filterQuery.maxRadiusInFeet || 2000);
    const [initialMaxRadius, setInitialMaxRadius] = useState(filterQuery.maxRadiusInFeet || 2000);

    const floorButtons = ["Any", "1st", "2nd", "3rd", "4th", "5th"];
    const [selectedFloorIndexes, setSelectedFloorIndexes] = useState(filterQuery.floors || []);

    const minStallButtons = ["Any", "1+", "2+", "3+", "4+", "5+"];
    const [selectedMinStallsIndex, setSelectedMinStallsIndex] = useState(filterQuery.minStalls || null);

    const [maleChecked, setMaleChecked] = useState(filterQuery.showMaleBathrooms || false);
    const [femaleChecked, setFemaleChecked] = useState(filterQuery.showFemaleBathrooms || false);
    const [unisexChecked, setUnisexChecked] = useState(filterQuery.showUnisexBathrooms || false);

    const sliderRef = useRef();

    const extraSliderHeaderTextStyles = Platform.OS === "ios" ? {marginBottom: 10} : {marginBottom: 15};
    const sliderThumbTintColor = Platform.OS === "ios" ? "white" : "#d3d3d3";

    useImperativeHandle(filterScreenRef, () => ({

        resetFilters() {
            setShowOpenBrOnly(false);
            setShowAccessibleBrOnly(false);
            setSelectedMaxRadius(2000);
            setInitialMaxRadius(2000);
            setSelectedFloorIndexes([]);
            setSelectedMinStallsIndex(null);
            setMaleChecked(false);
            setFemaleChecked(false);
            setUnisexChecked(false);
            setFilterQuery({});
            sliderRef.current.setNativeProps({value: 2000});
        }
    
    }));
     

    return(
        <View style={{
            flex: 1, 
            width: '100%', 
            backgroundColor: 'white'
        }}>
        <SafeAreaView style={{flex: 1, width: '100%'}}>
            <View style={styles.screen}>
                <ScrollView style={styles.filterSectionsContainer}>
                    <View style={styles.genderFilterSection}>
                        <Text style={styles.filterSectionTitle}>Bathroom Gender</Text>

                        <View style={styles.maleFemaleRowContainer}>

                            <CheckBox
                                activeOpacity={1}  
                                containerStyle={{ backgroundColor: "transparent", borderWidth: 0, marginLeft: 0, paddingLeft: 0 }}
                                title='Male'
                                checkedIcon={ (<View><Ionicons name="checkmark-circle" size={26} color="gold"/><View style={styles.bg}></View></View>) }                        uncheckedIcon={<Ionicons name="radio-button-off-outline" size={26} color="#D3D3D3" />}
                                checked={maleChecked}
                                textStyle={styles.checkBoxTitle}
                                onPress={() => setMaleChecked(!maleChecked)}
                            />

                            <CheckBox
                                activeOpacity={1}  
                                containerStyle={{ backgroundColor: "transparent", borderWidth: 0, marginLeft: 0, paddingLeft: 0 }}
                                title='Female'
                                checkedIcon={ (<View><Ionicons name="checkmark-circle" size={26} color="gold"/><View style={styles.bg}></View></View>) }                        uncheckedIcon={<Ionicons name="radio-button-off-outline" size={26} color="#D3D3D3" />}
                                checked={femaleChecked}
                                textStyle={styles.checkBoxTitle}
                                onPress={() => setFemaleChecked(!femaleChecked)}
                            />
                            <CheckBox
                                activeOpacity={1}  
                                containerStyle={{ backgroundColor: "transparent", borderWidth: 0, marginLeft: 0, paddingLeft: 0 }}
                                title='Unisex'
                                checkedIcon={ (<View><Ionicons name="checkmark-circle" size={26} color="gold"/><View style={styles.bg}></View></View>) }
                                uncheckedIcon={<Ionicons name="radio-button-off-outline" size={26} color="#D3D3D3" />}          
                                checked={unisexChecked}
                                textStyle={styles.checkBoxTitle}
                                onPress={() => setUnisexChecked(!unisexChecked)}
                            />
                        </View>
                    </View>

                    <View style={styles.distanceFilterSection}>
                        <View style={[styles.distanceFilterHeaderContainer, extraSliderHeaderTextStyles]}>
                            <Text>Maximum Distance</Text>
                            <Text style={styles.selectedDistanceText}>
                                {selectedMaxRadius != 5600 ? 
                                    selectedMaxRadius + " feet away"
                                    :  "Any"
                                }
                            </Text>
                        </View>
                        
                        <Slider
                            ref={sliderRef}
                            value={initialMaxRadius}
                            style={{width: '100%'}}
                            minimumValue={100}
                            maximumValue={5600}
                            step={100}
                            minimumTrackTintColor="gold"
                            maximumTrackTintColor="#D3D3D3"
                            onValueChange={(val) => setSelectedMaxRadius(val)}
                            thumbTintColor={sliderThumbTintColor}
                        />
                        
                    </View>

                    <View style={styles.stallsFilterSection}>
                        <Text style={styles.filterSectionTitle}>Bathroom Stalls</Text>

                        <View style={styles.stallsFilterButtonGroupContainer}>
                            <ButtonGroup
                                Component={TouchableHighlight}
                                underlayColor={"gray"}
                                selectedButtonStyle={styles.selectedButtonInGroup}
                                selectedTextStyle={styles.selectedButtonInGroupText}
                                // activeOpacity={1}  
                                containerStyle={{ marginHorizontal: 0, paddingHorizontal: 0 }}
                                onPress={index => setSelectedMinStallsIndex(index)}
                                buttons={minStallButtons}
                                selectedIndex={selectedMinStallsIndex}
                            />
                        </View>
                    </View>

                    <View style={styles.stallsFilterSection}>
                        <Text style={styles.filterSectionTitle}>Building Floor</Text>

                        <View style={styles.stallsFilterButtonGroupContainer}>
                            <ButtonGroup
                                Component={TouchableHighlight}
                                underlayColor={"gray"}
                                selectedButtonStyle={styles.selectedButtonInGroup}
                                selectedTextStyle={styles.selectedButtonInGroupText}
                                // activeOpacity={1}  
                                containerStyle={{ marginHorizontal: 0, paddingHorizontal: 0 }}
                                onPress={index => {
                                    if(index.includes(0) && !selectedFloorIndexes.includes(0)){
                                        setSelectedFloorIndexes([0])
                                    } else {
                                        setSelectedFloorIndexes(index.filter(e => e != 0));
                                    }
                                }}
                                selectMultiple={true}
                                buttons={floorButtons}
                                selectedIndexes={selectedFloorIndexes}
                            />
                        </View>
                    </View>

                    <View style={styles.openBathroomsFilterSection}>
                        <Text style={styles.handicapFilterTitle}>Open Bathrooms Only</Text>
                        <Switch
                            trackColor={{ false: "#c5c5c5", true: "gold" }}
                            thumbColor={'white'}
                            // thumbColor off was #f4f3f4
                            ios_backgroundColor="#F5F5F5"
                            onValueChange={() => setShowOpenBrOnly(!showOpenBrOnly)}
                            value={showOpenBrOnly}
                        />
                    </View>


                    <View style={styles.handicapFilterSection}>
                        <Text style={styles.handicapFilterTitle}>Wheelchair Accessible Bathrooms Only</Text>
                        <Switch
                            trackColor={{ false: "#c5c5c5", true: "gold" }}
                            thumbColor={'white'}
                            ios_backgroundColor="#F5F5F5"
                            onValueChange={() => setShowAccessibleBrOnly(!showAccessibleBrOnly)}
                            value={showAccessibleBrOnly}
                        />
                    </View>
                </ScrollView>

                <View style={styles.filterApplyButtonContainer}> 
                    <Pressable 
                        style={({ pressed }) => [
                            pressed ? styles.applyFilterButtonPressed : styles.applyFilterButtonNotPressed,
                            styles.applyFilterButton
                          ]}
                        onPress={() => {
                            console.log("apply pressed");
                            
                            if(bottomSheetModalRef.current){
                                bottomSheetModalRef.current.close();
                            }
                            
                            setFilterQuery({
                                showAccessibleBathroomsOnly: showAccessibleBrOnly,
                                showOpenBathroomsOnly: showOpenBrOnly,
                                maxRadiusInFeet: selectedMaxRadius,
                                minStalls: selectedMinStallsIndex,
                                floors: [...selectedFloorIndexes],
                                showMaleBathrooms: maleChecked,
                                showFemaleBathrooms: femaleChecked,
                                showUnisexBathrooms: unisexChecked
                            });

                            navigation.goBack();
                        }}

                    >
                        {({ pressed }) => (
                            <Text style={[styles.applyFilterText, {color: pressed ? 'gold' : 'black'}]}>
                                Apply
                            </Text>
                        )}
                    </Pressable>
                </View>
            </View>
        </SafeAreaView>
        </View>
    );

});


const styles = StyleSheet.create({

    screen: {
        flex: 1,
        width: '100%',
        backgroundColor: 'white',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    filterSectionsContainer: {
        flex: 1,
        width: '100%',
    },
    filterApplyButtonContainer: {
        width: '100%',
        paddingHorizontal: 12, 
        paddingVertical: 12,
        borderTopWidth: 1,
        borderTopColor: '#D3D3D3',
        marginTop: 5
    },
    checkBoxTitle: {
        fontWeight: 'normal'
    },
    maleFemaleRowContainer: {
        flex: 1,
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 0,
        marginLeft: 0
    },
    genderFilterSection: {
        flex: 1,
        width: '100%', 
        paddingHorizontal: 15,
        marginVertical: 15,
        borderBottomColor: "#D3D3D3",
        borderBottomWidth: 1
    },
    filterSectionTitle: {
        fontWeight: '500',
        fontSize: 16
    },
    stallsFilterSection: {
        width: '100%',
        paddingHorizontal: 15,
        marginTop: 15,
        borderBottomColor: "#D3D3D3",
        borderBottomWidth: 1,
    },
    stallsFilterButtonGroupContainer: {
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: 15,
    },
    selectedButtonInGroup: {
        backgroundColor: 'gold',
    },
    selectedButtonInGroupText: {
        color: 'black'
    },
    bg: {
        backgroundColor: 'black',
        zIndex: -1,
        position: 'absolute',
        left: 5,
        top: 5,
        borderRadius:  7.5,
        width: 15,
        height: 15
    },
    handicapFilterSection: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 15,
        marginTop: 15,
        paddingBottom: 15,
        borderBottomColor: "#D3D3D3",
        borderBottomWidth: 1
    },
    handicapFilterTitle: {
        alignSelf: 'center',
        fontSize: 15,
        fontWeight: '400'
    },
    openBathroomsFilterSection: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 15,
        marginTop: 15,
        paddingBottom: 15,
        borderBottomColor: "#D3D3D3",
        borderBottomWidth: 1
    },
    distanceFilterSection: {
        width: '100%',
        paddingHorizontal: 15,
        marginTop: 15,
        paddingBottom: 15,
        borderBottomColor: "#D3D3D3",
        borderBottomWidth: 1
    },
    distanceFilterHeaderContainer: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    selectedDistanceText: {
        // width: '40%'
    },
    applyFilterButton: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderRadius: 4,
        elevation: 3,
        borderWidth: 1,
    },
    applyFilterButtonPressed: {
        backgroundColor: 'white',
        borderColor: 'gold'
    },
    applyFilterButtonNotPressed: {
        backgroundColor: 'gold',
        borderColor: 'gold'
    },
    applyFilterText: {
        fontSize: 16,
        lineHeight: 21,
        fontWeight: 'bold',
        letterSpacing: 0.25,
    },
});