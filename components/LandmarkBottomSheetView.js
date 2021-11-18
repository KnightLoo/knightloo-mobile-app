import React, { useMemo, useContext, useState, useEffect } from 'react';
import BottomSheet from '@gorhom/bottom-sheet';
import { StyleSheet, Text, View, Button, SafeAreaView, Pressable, Dimensions, Image } from 'react-native';
// import CachedImage from 'expo-cached-image';
// import ExpoFastImage from 'expo-fast-image';
import LandmarkMapContext from '../contexts/LandmarkMapContext';
import AppContext from '../contexts/AppContext';
import CustomFastImage from './CustomFastImage';
import { Ionicons, Feather, MaterialIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import firebase from 'firebase/app';
import 'firebase/firestore';
import Firebase from '../utils/Firebase';
const db = Firebase.firestore();

function useForceUpdate(){
  const [value, setValue] = useState(0); 
  return () => setValue(value => value + 1);
}


export default function LandmarkBottomSheetView({sheetRef, handleSheetChanges, landmark}){
  
    const snapPoints = useMemo(() => ['20%'], []);

    const [isBookmarked, setIsBookmarked] = useState(false);

    // const forceUpdate = useForceUpdate();
    const {selectedLandmark, user, bookmarkedLandmarkIds} = useContext(AppContext);
    const {handleSheetPress} = useContext(LandmarkMapContext);

    useEffect(() => {

      if(selectedLandmark && selectedLandmark.id){
        if(bookmarkedLandmarkIds && bookmarkedLandmarkIds.length > 0){
          setIsBookmarked(bookmarkedLandmarkIds.includes(selectedLandmark.id));
        } else {
          setIsBookmarked(false);
        }
      }

    }, [bookmarkedLandmarkIds, selectedLandmark]);



    const handleToggleBookmark = () => {

      const newIsBookmarked = !isBookmarked;

      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

      if(user && selectedLandmark && selectedLandmark.id){
        const userBookmarkDocRef = db.collection("bookmarks").doc(user.uid);
        console.log(user.uid);
        console.log("updating bookmarks");

        setIsBookmarked(newIsBookmarked);

        userBookmarkDocRef.set({
          bookmarkedLandmarkIds: newIsBookmarked ? firebase.firestore.FieldValue.arrayUnion(selectedLandmark.id) : firebase.firestore.FieldValue.arrayRemove(selectedLandmark.id)
        }, { merge: true })
        .then(() => {
          console.log("Bookmarks updated successfully");
        })
        .catch((error) => {
            console.error("Error updating bookmark ", error);
        });
      }
      else {
        console.log("nothing happending");
      }
      

    };


    // const [imgUrl, setImgUrl] = useState(landmark != null ? landmark.imgUrl : null);
    // const [cacheId, setCacheId] = useState(landmark != null ? landmark.id: null);

    // function getHopText(){
    //   const dayOfWeekInd = (new Date().getDay() - 1) % 7;

    //   if(!landmark){
    //     return "null";
    //   }
    //   const hopData = landmark.hopData.displayableHopData[dayOfWeekInd];

    //   if(hopData.isAllDay){
    //     return "Open All Day";
    //   } else if(hopData.etRangeStr == "closed"){
    //     return "Closed Today";
    //   } else {
    //     return "Open " + '\u2B24' + " " + hopData.etRangeStr;
    //   }
    // }

    function mod(n, m) {
      return ((n % m) + m) % m;
    }

    // useEffect(() => {
    //   console.log("bottom sheet use effect");
    //   // const x = mod(new Date().getDay() - 1, 7);
    //   // console.log(x);
    // }, []);


    // useEffect(() => {

    //   // console.log("forcing update");
    //   console.log(landmark ? "landmark is not null" : "landmark is NULL");
    //   console.log(selectedLandmark ? "selectedLandmark is not null" : "selectedLandmark is NULL");
    //   console.log("imgUrl: ", imgUrl);
    //   console.log("cacheId: ", cacheId);

    //   setCacheId(selectedLandmark != null ? selectedLandmark.id : null);
    //   setImgUrl(selectedLandmark != null ? selectedLandmark.imgUrl : null);
    //   // forceUpdate();
    // }, [selectedLandmark]);

    // const hopText = getHopText();

    // console.log(landmark ? landmark.imgUrl : "");
    // console.log(landmark ? landmark.id : "");

    return (
        <BottomSheet
        backgroundStyle={styles.bgContainer}
        handleComponent={null}
        ref={sheetRef}
        index={-1}
        snapPoints={snapPoints}
        onChange={i => handleSheetChanges(i)}
        enablePanDownToClose={true}
        >
          {selectedLandmark &&
          <Pressable style={styles.pressableContainer} onPress={() => handleSheetPress()}>
              <View style={styles.container}>
              
                <View style={styles.textContainer}>
                  <Text style={styles.landmarkTitle}>{selectedLandmark.building}</Text>
                  {/* <Text style={styles.landmarkDesc}>Knights Plaza</Text> */}
                  <Text style={styles.landmarkDesc}>{selectedLandmark.gender ? selectedLandmark.gender.charAt(0).toUpperCase() + selectedLandmark.gender.slice(1) : ""}</Text>

                  <BottomSheetHoursOfOperationText hopData={selectedLandmark.hopData.flattenedHopDataForFilteringAndMutating[mod(new Date().getDay() - 1, 7)]}/>
                  {/* <Text style={styles.landmarkDesc}>{hopText}</Text>
                  <Text style={{fontSize: 4}}>{'\u2B24'}</Text> */}

                  <View style={styles.handicapInfoContainer}>

                    {selectedLandmark.isHandicapAccessible ?
                      <Ionicons name="ios-checkmark-sharp" size={18} color={'green'} /> :
                      <Ionicons name="md-close-sharp" size={18} color="red" />
                    }

                    <Text style={{paddingLeft: 5}}>Handicap Accessible</Text>

                  </View>


                  

                </View>

                <View style={{position: 'relative', top: 0, bottom: 0, right: 0, left: 0, height: '100%', marginRight: 10, marginTop: 35}}>
                  <Pressable onPress={() => {
                    handleToggleBookmark();
                    // Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
                    // setIsBookmarked(!isBookmarked);
                  }}
                  
                  style={{position: 'relative'}}>
                    {/* <Feather name={isBookmarked ? "bookmark"} size={30} color="black" /> */}
                    <MaterialIcons name={isBookmarked ? "bookmark" : "bookmark-border"} size={30} color="black" />
                  </Pressable>

                  {/* <Pressable onPress={() => setIsBookmarked(!isBookmarked)} style={{position: 'absolute', top: 0, zIndex: -1}}>
                  
                    <MaterialIcons name={isBookmarked ? "bookmark" : "bookmark-border"} size={30} color="black" />
                  </Pressable>  */}
                    
                </View>

                
                
                <View>
                  {/* <Image 
                    source={{ uri: landmark.imgUrl }}
                    resizeMode="cover"
                    style={styles.imageContainer}
                  /> */}
                 
                  {/* <CustomFastImage 
                    source={{ uri: selectedLandmark.imgUrl }}
                    cacheKey={selectedLandmark.id}
                    resizeMode="cover"
                    style={styles.imageContainer}
                  /> */}
                  <CustomFastImage 
                    source={{ uri: selectedLandmark.imgUrl }}
                    cacheKey={selectedLandmark.id}
                    resizeMode="cover"
                    style={styles.imageContainer}>
                      {/* <View style={{alignItems: 'flex-end', marginRight: 5, marginTop: 5}}>
                        <Pressable onPress={() => setIsBookmarked(!isBookmarked)} style={{position: 'relative'}}>
                          <Ionicons name={isBookmarked ? "ios-bookmark-outline" : "ios-bookmark-outline"} size={30} color={isBookmarked ? "black" : "black"} style={{opacity: isBookmarked ? 0.5 : 1}}  />
                        </Pressable>

                        <Pressable onPress={() => setIsBookmarked(!isBookmarked)} style={{position: 'absolute', top: 0, zIndex: -1}}>
                          <Ionicons name={isBookmarked ? "ios-bookmark" : "ios-bookmark"} size={30} color={isBookmarked ? "black" : "gray"} style={{opacity: isBookmarked ? 1 : 0.5}} />
                        </Pressable>
                      </View> */}

                      
                      {/* <Ionicons name="md-bookmark-outline" size={24} color="white" /> */}
                  </CustomFastImage>
                  
                  

                </View>
               
              </View>
              </Pressable>
          }


      </BottomSheet>
    );
}


function BottomSheetHoursOfOperationText({hopData}){

  if(!hopData){
    return <Text>No hours information</Text>;
  }
  if(hopData.isAllDay){
    return <Text style={styles.openText}>Open 24 Hours</Text>;
  }

  if(hopData.etRangeStr == "closed"){
    return <Text style={styles.closedText}>Closed</Text>
  }
  // console.log("-----");
  // console.log(hopData);
  // console.log(hopData.etRangeStr);
  // console.log("------");
  return (
    <View style={{flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center', paddingVertical: 4}}>
      <Text style={styles.openText}>Open </Text>
      <Text style={styles.middleDot}>{'\u2B24'}</Text>
      <Text style={styles.hopRangeText}> {hopData.etRangeStr}</Text>
    </View>
  );

}


// function LandMarkImage(){
  
//   const [imgUrl, setImgUrl] = useState(null);
//   const [cacheId, setCacheId] = useState(null);
  
//   const {selectedLandmark} = useContext(LandmarkMapContext);

//   useEffect(() => {

//     console.log("forcing update");
//     console.log(imgUrl);
//     console.log(cacheId);

//     setCacheId(selectedLandmark != null ? selectedLandmark.id : null);
//     setImgUrl(selectedLandmark != null ? selectedLandmark.imgUrl : null);
//     // forceUpdate();
//   }, [selectedLandmark]);
  

//   return (
//     <>
//     {imgUrl && cacheId &&
//     (<ExpoFastImage 
//       uri={imgUrl}
//       cacheKey={cacheId}
//       resizeMode="cover"
//       style={styles.imageContainer}
//     />)
//      }
//   </>
//   );

// }
  
const styles = StyleSheet.create({
  pressableContainer: {
    flex: 1,
  },
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
  },
  landmarkTitle:{
    // paddingLeft: 12,
    // paddingTop: 10,
    fontSize: 17,
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