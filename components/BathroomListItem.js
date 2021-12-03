import React, { useState, useRef, useCallback, useContext, useEffect } from 'react';
import { StyleSheet, Dimensions, View, Text, Pressable, LayoutAnimation } from 'react-native';
import AppContext from '../contexts/AppContext';
import LandmarkMapContext from '../contexts/LandmarkMapContext';
import CustomFastImage from './CustomFastImage';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import firebase from 'firebase/app';
import 'firebase/firestore';
import Firebase from '../utils/Firebase';
const db = Firebase.firestore();

function mod(n, m) {
  return ((n % m) + m) % m;
}

export default function BathroomListItem({navigation, landmark, useRemoveBookmarkAnimation=false}){


    const [isBookmarked, setIsBookmarked] = useState(false);
    const {user, bookmarkedLandmarkIds} = useContext(AppContext);

    const dayInd = mod(new Date().getDay() - 1, 7);


    useEffect(() => {

      if(landmark && landmark.id){
        if(bookmarkedLandmarkIds && bookmarkedLandmarkIds.length > 0){

          if(useRemoveBookmarkAnimation && !bookmarkedLandmarkIds.includes(landmark.id)){
            
            LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
          } 
          setIsBookmarked(bookmarkedLandmarkIds.includes(landmark.id));
        } else {
          if(useRemoveBookmarkAnimation){
            LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
          }
          setIsBookmarked(false);
        }
      }

    }, [bookmarkedLandmarkIds]);

    

    const handleToggleBookmark = () => {

      const newIsBookmarked = !isBookmarked;

      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

      if(user && landmark && landmark.id){
        const userBookmarkDocRef = db.collection("bookmarks").doc(user.uid);

        setIsBookmarked(newIsBookmarked);

        userBookmarkDocRef.set({
          bookmarkedLandmarkIds: newIsBookmarked ? firebase.firestore.FieldValue.arrayUnion(landmark.id) : firebase.firestore.FieldValue.arrayRemove(landmark.id)
        }, { merge: true })
        .then(() => {
          // console.log("Bookmarks updated successfully");
        })
        .catch((error) => {
            console.error("Error updating bookmark ", error);
        });
      }
      
    };

    
    return (
        <>
        { landmark ? 
        (<View style={styles.container}>
        <View style={styles.textContainer}>
            <Text style={styles.landmarkTitle}>{landmark.building}</Text>
  
            <View style={{flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center', paddingVertical: 4}}>
                <Text style={styles.landmarkDesc}>{landmark.gender ? landmark.gender.charAt(0).toUpperCase() + landmark.gender.slice(1) : ""} </Text>
                <Text style={styles.middleDot}>{'\u2B24'}</Text>
                <Text style={styles.landmarkDesc}> {landmark.floorStr}</Text>
              </View>

            <BathroomHoursOfOperationText hopData={landmark.hopData.flattenedHopDataForFilteringAndMutating[dayInd]}/>
            
            <View style={styles.handicapInfoContainer}>

              {landmark.isHandicapAccessible ?
                  <Ionicons name="ios-checkmark-sharp" size={18} color={'green'} /> :
                  <Ionicons name="md-close-sharp" size={18} color="red" />
              }

              <Text style={{paddingLeft: 5}}>Handicap Accessible</Text>
            </View>
        </View>  

        {user && user.uid &&
          <View style={{position: 'relative', top: 0, bottom: 0, right: 0, left: 0, height: '100%', marginRight: 10, marginTop: 20}}>
            <Pressable onPress={() => {
              handleToggleBookmark();
            }} style={{position: 'relative'}}>
              <MaterialIcons name={isBookmarked ? "bookmark" : "bookmark-border"} size={30} color="black" />
            </Pressable>        
          </View>
        }

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

    useEffect(() => {
      console.log("hop re rendered");
    }, [hopData]);

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
      marginVertical: 10
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