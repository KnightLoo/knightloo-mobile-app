import React, { useState, useEffect, useCallback, useRef, useContext, useMemo, useLayoutEffect } from 'react';
import { StyleSheet, Text, View, Button, Dimensions, SafeAreaView, StatusBar, FlatList, ActivityIndicator, Pressable, Modal} from 'react-native';
import LandmarkMapContext from '../contexts/LandmarkMapContext';
import AppContext from '../contexts/AppContext';
import * as Haptics from 'expo-haptics';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import ReadMore from 'react-native-read-more-text';
import cloneDeep from 'lodash/cloneDeep';
import CustomFastImage from '../components/CustomFastImage';
import {DateTime} from 'luxon';

import firebase from 'firebase/app';
import 'firebase/firestore';
import Firebase from '../utils/Firebase';
const db = Firebase.firestore();


export default function DetailScreen({navigation, route, selectedLandmark}) {

    const { user, needsToShowReviewScreen, setNeedsToShowReviewScreen, setDidComeFromReviewButtonPress } = useContext(AppContext);

    const [reviewsData, setReviewsData] = useState(null);

    useEffect(() => {

        if(needsToShowReviewScreen){
            setNeedsToShowReviewScreen(false);
            setDidComeFromReviewButtonPress(false);
            // console.log("opening review screen");
            navigation.navigate("Leave Review");
        }

    }, [needsToShowReviewScreen]);


    function getRelativeDateTime(timestamp){

        console.log(timestamp);
        if(timestamp){
            const relStr = DateTime.fromJSDate(timestamp.toDate()).toRelative();

            // console.log(timestamp.toDate());
            // return "nada";
            if(relStr.split(" ")[0] == "1"){
                return "a" + relStr.slice(1); 
            }
    
            return relStr;
        } else {
            return "not working";
        }
    }

    
    useEffect(() => {

        if(!selectedLandmark || !selectedLandmark.id){
            return;
        }

        const reviewsRef = db.collection("bathroom_reviews").where("landmark_id", "==", selectedLandmark.id);
        
        const unsubscribe = reviewsRef.onSnapshot((querySnapshot) => {

            if(querySnapshot.empty){
                console.log("no reviews found");
                setReviewsData([]);
            } else {
                const reviews = querySnapshot.docs.map(doc => ({id: doc.id, ...doc.data()}));
            
                if(reviews && reviews.length > 0){
                    setReviewsData(reviews);
                } else {
                    setReviewsData([]);
                }
            }
        });


        return unsubscribe;

    }, []);


    return(
        <>
        <SafeAreaView style={styles.screen}>
            {selectedLandmark &&
                    <FlatList
                        style={{width: '100%', flex: 1}}
                        ListHeaderComponent={<LandmarkDetailScreenHeader selectedLandmark={selectedLandmark} navigation={navigation} />}
                        ListHeaderComponentStyle={styles.headerComponentStyle}
                        ListEmptyComponent={reviewsData != null ? <NoReviewsView /> : <LoadingReviewsView reviewsData={reviewsData}/> }
                        data={reviewsData}
                        renderItem={({item}) => (
                            <View style={styles.reviewItemContainer}>
                                <Text style={styles.reviewAuthorText}>{item.review_author}</Text>
                                <View style={styles.reviewRatingContainer}>
                                    <MaterialIcons name="star-rate" size={18} color={item.num_stars >= 1 ? "gold" : "#D3D3D3"} />
                                    <MaterialIcons name="star-rate" size={18} color={item.num_stars >= 2 ? "gold" : "#D3D3D3"} />
                                    <MaterialIcons name="star-rate" size={18} color={item.num_stars >= 3 ? "gold" : "#D3D3D3"} />
                                    <MaterialIcons name="star-rate" size={18} color={item.num_stars >= 4 ? "gold" : "#D3D3D3"} />
                                    <MaterialIcons name="star-rate" size={18} color={item.num_stars >= 5 ? "gold" : "#D3D3D3"} />
                                    
                                    <Text style={styles.reviewLapsedTimeText}>{getRelativeDateTime(item.review_date)}</Text>

                                </View>
                                <ReadMore
                                    numberOfLines={4}
                                    renderTruncatedFooter={(handlePress) => (<Text style={styles.seeMoreTextStyle} onPress={handlePress}>Show More</Text>)}
                                    renderRevealedFooter={(handlePress) => (<Text style={styles.seeMoreTextStyle} onPress={handlePress}>Show Less</Text>)}
                                    >
                                    <Text style={styles.reviewText}>
                                        {item.review_text}
                                    </Text>
                                </ReadMore>
                            </View>
                        )}
                    />    
            }
            
        </SafeAreaView>
        </>
    );
}



function LandmarkDetailScreenHeader({selectedLandmark, navigation}){

    const {setLandmarkUnderEdit, setCurLandmarkHopData, setEditedMapLocation, signInToContinueSheetRef, user, bookmarkedLandmarkIds, setLandmarkUnderReview} = useContext(AppContext);
    
    const [isBookmarked, setIsBookmarked] = useState(false);


    useEffect(() => {
      
        if(selectedLandmark && selectedLandmark.id){
          if(bookmarkedLandmarkIds && bookmarkedLandmarkIds.length > 0){
            setIsBookmarked(bookmarkedLandmarkIds.includes(selectedLandmark.id));
          } else {
            setIsBookmarked(false);
          }
        }
  
      }, [bookmarkedLandmarkIds, selectedLandmark]);


    function mod(n, m) {
        return ((n % m) + m) % m;
    }

    const handleToggleBookmark = () => {

        const newIsBookmarked = !isBookmarked;
  
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  
        if(user && selectedLandmark && selectedLandmark.id){
          const userBookmarkDocRef = db.collection("bookmarks").doc(user.uid);
  
          setIsBookmarked(newIsBookmarked);
  
          userBookmarkDocRef.set({
            bookmarkedLandmarkIds: newIsBookmarked ? firebase.firestore.FieldValue.arrayUnion(selectedLandmark.id) : firebase.firestore.FieldValue.arrayRemove(selectedLandmark.id)
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
        <View style={{flex: 1}}>
            <View style={styles.landmarkInfoContainer}>
                <View style={styles.textContainer}>
                    <Text style={styles.landmarkTitle}>{selectedLandmark.building || "placeholder"}</Text>
                    <View style={{flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center', paddingVertical: 4}}>
                        <Text style={styles.landmarkDesc}>{selectedLandmark.gender ? selectedLandmark.gender.charAt(0).toUpperCase() + selectedLandmark.gender.slice(1) : ""} </Text>
                        <Text style={styles.middleDot}>{'\u2B24'}</Text>
                        <Text style={styles.landmarkDesc}> {selectedLandmark.floorStr}</Text>
                    </View>
                    
                    <DetailScreenHoursOfOperationText hopData={selectedLandmark.hopData.flattenedHopDataForFilteringAndMutating[mod(new Date().getDay() - 1, 7)]}/>

                    <View style={styles.handicapInfoContainer}>

                        {selectedLandmark.isHandicapAccessible ?
                        <Ionicons name="ios-checkmark-sharp" size={18} color={'green'} /> :
                        <Ionicons name="md-close-sharp" size={18} color="red" />
                        }

                        <Text style={{paddingLeft: 5}}>Handicap Accessible</Text>
                    </View>
                </View>


                {user && user.uid &&
                    <View style={{ borderWidth: 0, flex: 1, alignItems: 'flex-end', marginTop: 15, marginRight: 10}}>
                        <Pressable onPress={() => handleToggleBookmark()} style={{position: 'relative'}}>
                            <MaterialIcons name={isBookmarked ? "bookmark" : "bookmark-border"} size={30} color="black" />
                        </Pressable>
                    </View>
                }

                <View>
                    <CustomFastImage 
                        source={{ uri: selectedLandmark.imgUrl }}
                        cacheKey={selectedLandmark.id}
                        resizeMode="cover"
                        style={styles.imageContainer}
                    /> 
                </View>
            </View>

            <Pressable 
                style={styles.reportIssueButtonContainer}
                onPress={() => {
                    setLandmarkUnderEdit(selectedLandmark);
                    setEditedMapLocation({longitude: selectedLandmark.longitude, latitude: selectedLandmark.latitude});
                    setCurLandmarkHopData(cloneDeep(selectedLandmark.hopData));
                    navigation.navigate("Report Issue");
                }}
            >
                {({ pressed }) => (
                    <Text style={[styles.reportIssueButtonText, {opacity: pressed ? 0.25 : 1}]}>
                        Report an Issue
                    </Text>
                )}
                            
            </Pressable>


            <View style={styles.reviewHeaderContainer}>
                <View style={styles.reviewHeaderTextContainer}>
                    <Text style={styles.reviewHeaderText}>Reviews</Text>
                </View>
       
                <Pressable 
                    style={({ pressed }) => [
                        pressed ? styles.leaveReviewButtonPressed : styles.leaveReviewButtonNotPressed,
                        styles.leaveReviewButton
                        ]}
                    onPress={() => {
                        // console.log("leave review button pressed");
                        setLandmarkUnderReview(selectedLandmark);
                        
                        if(user){
                            navigation.navigate("Leave Review");
                        } else {
                            signInToContinueSheetRef.current?.snapToIndex(1);
                        }
                    }}

                >
                    {({ pressed }) => (
                        <Text style={[styles.leaveReviewText, {color: pressed ? 'gold' : 'black'}]}>
                            Leave a review
                        </Text>
                    )}
                            
                </Pressable>

            </View>
        </View>
    );
}

function DetailScreenHoursOfOperationText({hopData}){

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

function LoadingReviewsView({reviewsData}){
    return (
        <View style={styles.spinnerContainer}>
            <ActivityIndicator animating={reviewsData == null} />
        </View>
    );
}

function NoReviewsView(){
    return (
        <View style={{marginTop: 40, justifyContent: 'flex-end', alignItems: 'center'}}>
            <Text style={{fontSize: 20, fontWeight: '400'}}>No Reviews Yet</Text>
        </View>
    );
}




const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'flex-start',
        justifyContent: 'flex-start',
        width: '100%',
    },
    headerComponentStyle: {
        width: '100%',
        flex: 1
    },
    landmarkInfoContainer: {
        width: '100%',
        flex: 1,
        flexDirection: 'row',
        minHeight: Dimensions.get('window').height * 0.16,
        borderBottomWidth: 1,
        borderBottomColor: '#D3D3D3',
        justifyContent: 'space-between',
    },
    reportIssueButtonContainer: {
        width: '100%',
        marginTop: 12,
        marginBottom: 4
    },
    reportIssueButtonText: {
        color: '#007bff',
        paddingLeft: 12,
        
    },
    imageContainer: {
        flex:1,
        borderWidth: 0, 
        width: Dimensions.get('window').width / 3,
    },
    textContainer: {
      height: '100%',
      justifyContent: 'center',
      paddingTop: 8,
      paddingBottom: 4,
      paddingLeft: 12,
    },
    landmarkTitle:{
      paddingBottom: 4,
      fontWeight: 'bold',
    },
    landmarkDesc: {
      paddingVertical: 4
    },
    bgContainer: {
      borderRadius: 0
    },
    reviewHeaderContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginHorizontal: 15,
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#D3D3D3',
    },
    reviewHeaderTextContainer: {
        alignItems: 'center',
        textAlign: 'center',
    },
    reviewHeaderText: {
        textAlignVertical: 'center',
        fontWeight: 'bold',
        fontSize: 22,
    },
    leaveReviewTextContainer:{
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: 4,
        elevation: 3,
        borderWidth: 1,
        borderColor: 'gold',
        backgroundColor: 'gold',
    },
    leaveReviewText: {
        color: 'black',
        fontWeight: 'bold',
    },
    reviewsContainer: {
        flex: 1,
        width: '100%',
        height: '100%',
        justifyContent: 'flex-start',
        alignItems: 'flex-start'
    },
    reviewItemContainer: {
        flex: 1,
        marginHorizontal: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#D3D3D3',
        paddingVertical: 15
    },
    reviewAuthorText: {
        fontSize: 16,
        fontWeight: 'bold',
        paddingBottom: 8
    },
    reviewText: {
        fontSize: 14,
    },
    seeMoreTextStyle: {
        color: "#007bff",
        fontWeight: 'normal',
        marginTop: 5
    },
    seeLessTextStyle: {
        color: "#007bff",
        fontWeight: 'normal',
        marginTop: 5
    },
    reviewRatingContainer: {
        flex: 1,
        flexDirection: 'row',
        paddingBottom: 4,
        alignItems: 'center',
    },
    reviewLapsedTimeText: {
        color: '#A0A0A0',
        fontSize: 12,
        paddingLeft: 8
    },
    spinnerContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 25
    },
    leaveReviewButton: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: 4,
        elevation: 3,
        borderWidth: 1,
    },
    leaveReviewButtonPressed: {
        backgroundColor: 'white',
        borderColor: 'gold'
    },
    leaveReviewButtonNotPressed: {
        backgroundColor: 'gold',
        borderColor: 'gold'
    },
    leaveReviewText: {
        fontWeight: 'bold',
        letterSpacing: 0.25,
    },
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 22,
        height: '100%',
        width: '100%'
      },
      modalView: {
        height: '90%',
        width: '100%',
        margin: 20,
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 35,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
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