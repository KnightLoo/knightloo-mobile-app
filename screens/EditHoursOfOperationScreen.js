import React, {useEffect, useState, useRef, useContext, forwardRef, useImperativeHandle} from 'react';
import { StyleSheet, Button, Text, TextInput, View, Dimensions, Pressable, Platform, ScrollView, Switch, StatusBar, LayoutAnimation } from 'react-native';
import AppContext from '../contexts/AppContext';

import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';

import getTimeslotUpdates from '../utils/getTimeslotUpdates';
// import { useIsFocused } from '@react-navigation/native';

// function FocusAwareStatusBar(props) {
//   const isFocused = useIsFocused();

//   return isFocused ? <StatusBar {...props} /> : <StatusBar {...props} />;
// }
import Collapsible from 'react-native-collapsible';

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

function getStandardHourDT(milHour) {
    if (milHour > 12) {
        return { stdHour: milHour - 12, dayTimeType: "PM" };
    }

    if (milHour === 12) {
        return { stdHour: 12, dayTimeType: "PM" };
    }

    if (milHour === 0) {
        return { stdHour: 12, dayTimeType: "AM" };
    }

    return { stdHour: milHour, dayTimeType: "AM" };
}


export default EditHoursOfOperationScreen = forwardRef( ({navigation}, ref) => {

    useEffect(() => {
        StatusBar.setBarStyle("light-content");
    }, []);

    const {editHoursOfOppRef, curLandmarkHopData, setCurLandmarkHopData} = useContext(AppContext);

    const scrollViewRef = useRef();

    const [selectedOpenTime, setSelectedOpenTime] = useState(new Date(2021, 0, 1, 9, 0, 0, 0));
    const [selectedCloseTime, setSelectedCloseTime] = useState(new Date(2021, 0, 1, 17, 0, 0, 0));

    const [isDaySelected, setIsDaySelected] = useState([false, false, false, false, false, false, false]);
    const [isOpenAllDay, setIsOpenAllDay] = useState(false);

    const [expandedTimePickerIndex, setExpandedTimePickerIndex] = useState(-1);

    const [opensTimeHeaderText, setOpensTimeHeaderText] = useState("9:00 AM");
    const [closesTimeHeaderText, setClosesTimeHeaderText] = useState("5:00 PM");

    const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];


    useImperativeHandle(editHoursOfOppRef, () => ({

        addEditedHoursOfOpp() {
            // getTimeslotUpdates()
            const selectedDayIndices = isDaySelected.reduce((prev, curr, i) => {
                    if(curr){
                        prev.push(i);
                    }
                    return prev;
                }, []
            );

            let timeslotUpdates = {days: selectedDayIndices, startUtcInMilli: null, endUtcInMilli: null, isAllDay: true, etRangeStr: "allday"};

            if(!isOpenAllDay){
                
                const openTimeFullComps = opensTimeHeaderText.split(" ");
                const openTimeComps = openTimeFullComps[0].split(":");
                const closeTimeFullComps = closesTimeHeaderText.split(" ");
                const closeTimeComps = closeTimeFullComps[0].split(":");
                
                const openUtcTime = getUTCDateFromHoursAndMins(openTimeComps[0], openTimeComps[1], openTimeFullComps[1]);
                const closeUtcTime = getUTCDateFromHoursAndMins(closeTimeComps[0], closeTimeComps[1], closeTimeFullComps[1]);

                const etRangeStr = opensTimeHeaderText + " - " + closesTimeHeaderText;
                timeslotUpdates = {days: selectedDayIndices, startUtcInMilli:openUtcTime, endUtcInMilli: closeUtcTime, isAllDay: false, etRangeStr: etRangeStr};
            }
            
        
            const {didDataChange, newHopData} = getTimeslotUpdates(curLandmarkHopData, timeslotUpdates);

            if(didDataChange){
                setCurLandmarkHopData(newHopData);
            }

            navigation.goBack();
        }
    
    }));

    

    return (
    <>
      <View style={{alignItems: 'center', justifyContent: 'flex-start', flexGrow: 1}}>
        <ScrollView 
            style={styles.scrollView} 
            contentContainerStyle={{flexGrow: 1}} 
            ref={scrollViewRef}
            onContentSizeChange={() => {
                console.log("scrollllling");
                // setTimeout(() => {
                //     scrollViewRef.current.scrollToEnd({animated: true});
                // }, 1000);
                
            }}
        >
            <View style={styles.screen}>
                <View style={styles.daySelectFieldContainer}>

                    <Text style={styles.fieldHeaderText}>Days</Text>

                    <View style={styles.daySelectListContainer}>
                        {daysOfWeek.map((day, i) => (
                            <Pressable
                                key={day}
                                style={({ pressed }) => [
                                    {backgroundColor: pressed ? "#D0D0D0" : 'white'},
                                ]}
                                onPress={() => {
                                    let newIsDaySelected = [...isDaySelected];
                                    newIsDaySelected[i] = !newIsDaySelected[i];
                                    setIsDaySelected(newIsDaySelected); // 007bff b7a369
                                }}
                            >
                                <View style={[styles.dayItemContainer, {borderTopWidth: i !=0 ? 1 : 0}] }>

                                    <Text style={styles.dayItemText}>{day}</Text>
                                                            
                                    <Ionicons name="ios-checkmark-sharp" size={24} color={isDaySelected[i] ? '#ffca06' : 'transparent'} />
                                    
                                </View>
                            </Pressable>
                            
                        ))}
                    </View>

                    <View style={styles.timeSelectFieldContainer}>
                        <Text style={styles.fieldHeaderText}>Hours</Text>

                        <View style={styles.timeSelectFieldItemsContainer}>

                            <View style={styles.openAllDaySwitchContainer}>
                                <Text style={styles.openAllDaySwitchTitle}>Open 24 Hours</Text>
                                <Switch
                                    trackColor={{ false: "#3e3e3e", true: "gold" }}
                                    thumbColor={'white'}
                                    // thumbColor off was #f4f3f4
                                    ios_backgroundColor="#F5F5F5"
                                    onValueChange={() => setIsOpenAllDay(!isOpenAllDay)}
                                    value={isOpenAllDay}
                                />
                            </View>

                            <Collapsible 
                                collapsed={isOpenAllDay} 
                                duration={300} 
                                renderChildrenCollapsed={true} 
                            >
                                <>
                                    <View style={styles.timePickerContainer}>

                                        <Pressable
                                            style={({ pressed }) => [
                                                {backgroundColor: pressed ? "#D0D0D0" : 'white'},
                                            ]}
                                            onPress={() => {

                                                // LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                                                // LayoutAnimation.configureNext(
                                                //     LayoutAnimation.create(
                                                //       400,
                                                //       LayoutAnimation.Types.easeInEaseOut,
                                                //       LayoutAnimation.Properties.opacity
                                                //     )
                                                //   );

                                                if(expandedTimePickerIndex === 0){
                                                    scrollViewRef.current.scrollTo({ x: 0, y: 0, animated: true });
                                                    setExpandedTimePickerIndex(-1);
                                                } else {
                                                    setExpandedTimePickerIndex(0);
                                                    setTimeout(() => {
                                                        scrollViewRef.current.scrollToEnd({animated: true}); // 007bff
                                                    }, 300);
                                                }
                                                
                                            }}
                                        >
                                            <View style={styles.timePickerHeader}>
                                                <Text style={styles.timePickerHeaderLabelText}>Opens</Text>
                                                <Text style={[styles.timePickerHeaderTimeText, {color: expandedTimePickerIndex === 0 ? '#ffca06': 'black'}]}>
                                                    {opensTimeHeaderText}
                                                </Text>
                                            </View>
                                        </Pressable>

                                        <Collapsible 
                                            collapsed={expandedTimePickerIndex != 0} 
                                            duration={500} 
                                            renderChildrenCollapsed={true} 
                                        >
                                            <DateTimePicker
                                                testID="dateTimePicker"
                                                value={selectedOpenTime}
                                                mode="time"
                                                minuteInterval={15}
                                                // is24Hour={true}
                                                display="spinner"
                                                onChange={(_, date) => {
                                                    const {stdHour, dayTimeType} = getStandardHourDT(date.getHours());
                                                    const mins = date.getMinutes();
                                                    
                                                    // setSelectedOpenTime(new Date(getUTCDateFromHoursAndMins(stdHour, mins, dayTimeType)));
                                                    setOpensTimeHeaderText(stdHour + ":" + String(mins).padStart(2, '0') + " " + dayTimeType);
                                                    setSelectedOpenTime(new Date(2021, 0, 1, date.getHours(), mins, 0, 0));
                                                }}
                                            />
                                        </Collapsible>
                                        
                                    </View>
                                
                                    <View style={styles.timePickerContainer}>

                                    <Pressable
                                        style={({ pressed }) => [
                                            {backgroundColor: pressed ? "#D0D0D0" : 'white'},
                                        ]}
                                        onPress={() => {

                                            // LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

                                            // LayoutAnimation.configureNext(
                                            //     LayoutAnimation.create(
                                            //       500,
                                            //       LayoutAnimation.Types.easeInEaseOut,
                                            //       LayoutAnimation.Properties.opacity
                                            //     )
                                            //   );
                                            
                                            // if(expandedTimePickerIndex == -1){
                                            //     scrollViewRef.current.scrollTo({ x: 0, y: 0, animated: true });
                                            // }
                                                
                                        

                                            if(expandedTimePickerIndex === 1){
                                                scrollViewRef.current.scrollTo({ x: 0, y: 0, animated: true });
                                                setExpandedTimePickerIndex(-1);
                                            } else {
                                                console.log("should scroll");
                                                
                                                
                                                setExpandedTimePickerIndex(1);

                                                setTimeout(() => {
                                                    scrollViewRef.current.scrollToEnd({animated: true});
                                                }, 300);
                                                // scrollViewRef.current.scrollToEnd({animated: true});
                                            }
                                            
                                            
                                        }}
                                    >
                                        <View style={styles.timePickerHeader}>
                                            <Text style={styles.timePickerHeaderLabelText}>Closes</Text>
                                            <Text style={[styles.timePickerHeaderTimeText, {color: expandedTimePickerIndex === 1 ? '#007bff': 'black'}]}>
                                                {closesTimeHeaderText}
                                            </Text>
                                        </View>
                                    </Pressable>

                                    {/* {expandedTimePickerIndex == 1 &&
                                        <DateTimePicker
                                            testID="dateTimePicker"
                                            value={selectedCloseTime}
                                            mode="time"
                                            minuteInterval={15}
                                            // is24Hour={true}
                                            display="spinner"
                                            onChange={(_, date) => {
                                                const {stdHour, dayTimeType} = getStandardHourDT(date.getHours());
                                                const mins = date.getMinutes();
                                                setSelectedCloseTime(new Date(2021, 0, 1, stdHour, mins, 0, 0));
                                                // setSelectedOpenTime(new Date(getUTCDateFromHoursAndMins(stdHour, mins, dayTimeType)));
                                                setClosesTimeHeaderText(stdHour + ":" + String(mins).padStart(2, '0') + dayTimeType);
                                            }}
                                        />
                                    } */}

                                    <Collapsible 
                                        collapsed={expandedTimePickerIndex != 1} 
                                        duration={500} renderChildrenCollapsed={false}
                                        // onAnimationEnd={() => {
                                        //     if(expandedTimePickerIndex == -1){
                                        //         scrollViewRef.current.scrollTo({ x: 0, y: 0, animated: true });
                                        //     }
                                        // }}
                                    >
                                        <DateTimePicker
                                            testID="dateTimePicker"
                                            value={selectedCloseTime}
                                            mode="time"
                                            minuteInterval={15}
                                            // is24Hour={true}
                                            display="spinner"
                                            onChange={(_, date) => {
                                                const {stdHour, dayTimeType} = getStandardHourDT(date.getHours());
                                                const mins = date.getMinutes();
                                                
                                                // setSelectedOpenTime(new Date(getUTCDateFromHoursAndMins(stdHour, mins, dayTimeType)));
                                                setClosesTimeHeaderText(stdHour + ":" + String(mins).padStart(2, '0') + " " + dayTimeType);
                                                console.log()
                                                setSelectedCloseTime(new Date(2021, 0, 1, date.getHours(), mins, 0, 0));
                                            }}
                                        />
                                    </Collapsible>
                                   
                                    
                                    
                                </View>
                                    
                                </>
                                </Collapsible>
                    
                        </View>
                        
                    </View>
                    
                    
                    {/* <View style={styles.daySelectListContainer}>

                        <View style={styles.dayItem}> 
                            <Text>Monday</Text>
                        </View>
                        <View style={styles.dayItem}> 
                            <Text>Tuesday</Text>
                        </View>
                        <View style={styles.dayItem}> 
                            <Text>Wednesday</Text>
                        </View>
                        <View style={styles.dayItem}> 
                            <Text>Thursday</Text>
                        </View>
                        <View style={styles.dayItem}> 
                            <Text>Friday</Text>
                        </View>
                        <View style={styles.dayItem}> 
                            <Text>Saturday</Text>
                        </View>
                        <View style={styles.dayItem}> 
                            <Text>Sunday</Text>
                        </View>
                    </View> */}
                
                </View>
            </View>
        </ScrollView>
      </View>
        {/* <FocusAwareStatusBar style="light-content"/> */}
      </>
    );
});


const styles = StyleSheet.create({
    scrollView: {
        flex: 1,
        backgroundColor: '#fff',
        width: '100%',
        height: '100%'
    },
    screen: {
        flex: 1,
        justifyContent: 'flex-start',
        // backgroundColor: '#fff',
        // alignItems: 'flex-start',
        // justifyContent: 'flex-start',
        // marginTop: StatusBar.currentHeight || 0,
        width: '100%',
        // height: 300,
        // borderWidth: 1, 
        // borderColor: 'red'

    },
    daySelectFieldContainer: {
        flex: 1, //
        width: '100%',
        marginTop: 20,
    },
    daySelectListContainer: {
        borderBottomColor: '#D3D3D3',
        borderBottomWidth: 1,
        borderTopColor: '#D3D3D3',
        borderTopWidth: 1,
        marginVertical: 10,
    },
    dayItemContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 14,
        borderTopColor: '#D3D3D3',
        // borderTopWidth: 1,
        marginLeft: 18,
        paddingRight: 18
    },
    dayItemText: {
        fontSize: 17,
        textAlign: 'right',
        alignSelf: 'flex-end',
    },
    fieldHeaderText: {
        color: 'gray',
        fontSize: 17,
        paddingLeft: 15,
    },
    timeSelectFieldContainer: {
        // flex: 1, //
        width: '100%',
        marginTop: 20,
        marginBottom: 50
    },
    timeSelectFieldItemsContainer: {
        borderBottomColor: '#D3D3D3',
        borderBottomWidth: 1,
        borderTopColor: '#D3D3D3',
        borderTopWidth: 1,
        marginVertical: 10,
    },
    openAllDaySwitchContainer: {
        // flex: 1, //
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 15,
        marginTop: 15,
        paddingBottom: 15,
        // borderBottomColor: "#D3D3D3",
        // borderBottomWidth: 1
    },
    openAllDaySwitchTitle: {
        alignSelf: 'center',
        fontSize: 17,
        fontWeight: '400'
    },
    timePickerContainer: {
        width: '100%'
    },
    timePickerHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginLeft: 18,
        paddingRight: 18,
        alignItems: 'center',
        paddingVertical: 20,
        borderTopColor: '#D3D3D3',
        borderTopWidth: 1
    },
    timePickerHeaderLabelText: {
        fontSize: 17
    }, 
    timePickerHeaderTimeText: {
        fontSize: 17
    }

});