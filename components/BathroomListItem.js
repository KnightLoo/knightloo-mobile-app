import React, { useState, useRef, useCallback, useContext, useEffect } from 'react';
import { StyleSheet, Dimensions, View, Text } from 'react-native';
import AppContext from '../contexts/AppContext';
import LandmarkMapContext from '../contexts/LandmarkMapContext';
import CustomFastImage from './CustomFastImage';
import { Ionicons } from '@expo/vector-icons';


export default function BathroomListItem({navigation, landmark}){

    function mod(n, m) {
        return ((n % m) + m) % m;
    }

    
    return (
        <>
        { landmark ? 
        (<View style={styles.container}>
        <View style={styles.textContainer}>
            <Text style={styles.landmarkTitle}>{landmark.building}</Text>
            {/* <Text style={styles.landmarkDesc}>Knights Plaza</Text> */}
            <Text style={styles.landmarkDesc}>{landmark.gender ? landmark.gender.charAt(0).toUpperCase() + landmark.gender.slice(1) : ""}</Text>

            <BathroomHoursOfOperationText hopData={landmark.hopData.flattenedHopDataForFilteringAndMutating[mod(new Date().getDay() - 1, 7)]}/>
            
            <View style={styles.handicapInfoContainer}>

            {landmark.isHandicapAccessible ?
                <Ionicons name="ios-checkmark-sharp" size={18} color={'green'} /> :
                <Ionicons name="md-close-sharp" size={18} color="red" />
            }

            <Text style={{paddingLeft: 5}}>Handicap Accessible</Text>
            </View>
        </View>       
        <View>                 
            <CustomFastImage 
            source={{ uri: landmark.imgUrl }}
            cacheKey={landmark.id}
            resizeMode="cover"
            style={styles.imageContainer}
            />
        </View>
        
        </View>  )
        : <View><Text>Empty</Text></View>
        }  
        </>
    );
}


function BathroomHoursOfOperationText({hopData}){

    if(!hopData){
      return <Text>No hours information</Text>;
    }
    if(hopData.isAllDay){
      return <Text style={styles.openText}>Open 24 Hours</Text>;
    }
  
    if(hopData.etRangeStr == "closed"){
      return <Text style={styles.closedText}>Closed</Text>
    }

    return (
      <View style={{flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center', paddingVertical: 4}}>
        <Text style={styles.openText}>Open </Text>
        <Text style={styles.middleDot}>{'\u2B24'}</Text>
        <Text style={styles.hopRangeText}> {hopData.etRangeStr}</Text>
      </View>
    );
  
}



const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'row',
        // backgroundColor: 'red',
        alignItems: 'center',
        justifyContent: 'center',
    },
    textContainer: {
      flex: 1,
      alignSelf: 'center',
      paddingLeft: 12,
      marginVertical: 5
    },
    landmarkTitle:{
      // paddingLeft: 12,
      // paddingTop: 10,
      paddingVertical: 4,
      fontWeight: 'bold'
    },
    landmarkDesc: {
      // paddingLeft: 12,
      paddingVertical: 4,
    },
    imageContainer: {
      flex: 1,
      // borderWidth: 1,
      backgroundColor: 'black',
      // justifyContent: 'flex-end',
      // maxHeight: Dimensions.get('window').width / 4,
  
      minWidth: Dimensions.get('window').width / 3,
    },
    bgContainer: {
      borderRadius: 0
    },
    openText: {
      color: 'green'
    },
    closedText: {
      color: 'red'
    },
    hopRangeText: {
      color: 'black'
    },
    middleDot: {
      fontSize: 3,
      color: 'black'
    },
    handicapInfoContainer: {
      flexDirection: 'row', 
      justifyContent: 'flex-start', 
      alignItems: 'center',
      paddingVertical: 4,
    }
  });