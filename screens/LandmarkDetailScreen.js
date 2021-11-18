import React, { useState, useEffect, useCallback, useRef, useContext, useMemo } from 'react';
import { StyleSheet, Text, View, Button, Dimensions, SafeAreaView, StatusBar, FlatList, ActivityIndicator, Pressable, Modal} from 'react-native';
import LandmarkMapContext from '../contexts/LandmarkMapContext';
import AppContext from '../contexts/AppContext';
// import { useFocusEffect } from '@react-navigation/native';
// import CachedImage from 'expo-cached-image';
import * as Haptics from 'expo-haptics';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
// import ReadMore from '@fawazahmed/react-native-read-more';
import ReadMore from 'react-native-read-more-text';
import cloneDeep from 'lodash/cloneDeep';
import CustomFastImage from '../components/CustomFastImage';
import {DateTime} from 'luxon';

import BottomSheet, {BottomSheetBackdrop} from '@gorhom/bottom-sheet';
import SignInToContinueSheetBackdrop from '../components/SignInToContinueSheetBackdrop';

import firebase from 'firebase/app';
import 'firebase/firestore';
import Firebase from '../utils/Firebase';
const db = Firebase.firestore();

const reviews = [
    {
        id: "1",
        review_author: "Max Smith",
        review_text: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Minima, a reiciendis? Quisquam aspernatur animi inventore quos autem eius debitis deserunt! Corporis hic illum voluptate minima nemo eaque, vitae sapiente alias.",
        num_stars: 5,
        time_since_reviewed_text: "11 months ago"
    },
    {
        id: "2",
        review_author: "Max Smith",
        review_text: "Lorem ipsum dolor, sit amet consectetur adipisicing elit. Illum expedita eligendi esse eum, possimus perferendis quas dolor ullam vero minima! Quasi quaerat exercitationem, esse fugiat facere qui quibusdam nulla, placeat, quisquam laborum ut molestiae eaque.",
        num_stars: 1,
        time_since_reviewed_text: "2 months ago"
    },
    {
        id: "3",
        review_author: "Max Smith",
        review_text: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Minima, a reiciendis? Quisquam aspernatur animi inventore quos autem eius debitis deserunt! Corporis hic illum voluptate minima nemo eaque, vitae sapiente alias.",
        num_stars: 0,
        time_since_reviewed_text: "3 weeks ago"
    },
    {
        id: "4",
        review_author: "Max Smith",
        review_text: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Minima, a reiciendis? Quisquam aspernatur animi inventore quos autem eius debitis deserunt! Corporis hic illum voluptate minima nemo eaque, vitae sapiente alias.",
        num_stars: 3,
        time_since_reviewed_text: "a year ago"
    },
    {
        id: "5",
        review_author: "Max Smith",
        review_text: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Minima, a reiciendis? Quisquam aspernatur animi inventore quos autem eius debitis deserunt! Corporis hic illum voluptate minima nemo eaque, vitae sapiente alias.",
        num_stars: 2,
        time_since_reviewed_text: "4 months ago"
    },
    {
        id: "6",
        review_author: "Max Smith",
        review_text: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Minima, a reiciendis? Quisquam aspernatur animi inventore quos autem eius debitis deserunt! Corporis hic illum voluptate minima nemo eaque, vitae sapiente alias.",
        num_stars: 4,
        time_since_reviewed_text: "a day ago"
    }
];





export default function LandmarkDetailScreen({navigation, route}) {

    
    const {selectedLandmark, user, needsToShowReviewScreen, setNeedsToShowReviewScreen } = useContext(AppContext);
    
    // const signInToContinueSheetRef = useRef();


    const [reviewsData, setReviewsData] = useState(null);

    const [reviewTimeSinceData, setReviewTimeSinceData] = useState([]);

    const [isRefreshingReviews, setIsRefreshingReviews] = useState(false);

    const [modalVisible, setModalVisible] = useState(false);


    useEffect(() => {

        if(needsToShowReviewScreen){
            setNeedsToShowReviewScreen(false);
            console.log("opening review screen");
            navigation.navigate("Leave Review");
        }

    }, [needsToShowReviewScreen]);


    // useEffect(() => {

    //     const cancelInterval = setInterval(() => {
    //         const reviewsProcessed = reviewsData.map(rev => ({...rev, time_since_reviewed_text: getRelativeDateTime(rev.review_date)}));
    //         setReviewsData(reviewsProcessed);
    //     }, 20000);

    //     return () => clearInterval(cancelInterval);
    // }, []);
    // useFocusEffect(
    //     useCallback(() => {
    //       console.log("in fe use cb");
    //       console.log("route params: ", route.params);
    //     //   const unsubscribe = API.subscribe(userId, user => setUser(user));
    //         if(route.params && route.params.prevScreen == "SignIn" && user){
    //             console.log("opening review screen");
    //             navigation.navigate("Leave Review");
    //         } 

    //         return () => console.log("unmounted");
    //     }, [navigation])
    //   );

    // useEffect(()=> {
    //     console.log("in reg use effect");
    // }, [navigation, route]);

    // useEffect(() => {
    //     console.log("use effect route thing");
    //     if(route.params && route.params.prevScreen == "SignIn" && user){
    //         console.log("opening review screen");
    //         navigation.navigate("Leave Review");
    //     } 
    // }, [navigation, route]);


    // useEffect(() => {

    //     console.log(DateTime.fromJSDate(new Date(2021, 10, 7)).toRelative());

    //     var t = setTimeout(() => {
    //         setReviewsData(reviews);
    //     }, 500);

    //     return () => {
    //         clearTimeout(t);
    //     };

    // }, []);


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

    
    async function getReviewsData() {

        try {
            const reviewsRef = db.collection("bathroom_reviews");
            const querySnapshot = await reviewsRef.where("landmark_id", "==", selectedLandmark.id).get();

            if(querySnapshot.empty){
                console.log("no reviews found");
                setReviewsData([]);
            } else {
                const reviews = querySnapshot.docs.map(doc => ({id: doc.id, ...doc.data()}));

                if(reviews && reviews.length > 0){


                    setReviewsData(reviews);
                    // const reviewsProccessed = reviews.map(rev => {
                        
                    //     return {
                    //         ...rev,
                            
                    //     }

                    // });

                } else {
                    setReviewsData([]);
                }
                 
            }

        } catch(error) {
            console.log("error getting reviews");
        }
    }

    useEffect(() => {

        // getReviewsData();
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
                    // const reviewsProcessed = reviews.map(rev => ({...rev, time_since_reviewed_text: getRelativeDateTime(rev.review_date)}));
                    setReviewsData(reviews);
                } else {
                    setReviewsData([]);
                }
            }
        });


        return unsubscribe;

    }, []);

    
    // const handleRefresh = async () => {
    //     setIsRefreshingReviews(true);
    //     await getReviewsData();
    //     setIsRefreshingReviews(false);
    // };


    // return(
    //     <View style={styles.screen}>
    //         {selectedLandmark &&
    //           <View style={styles.container}>
              
    //             <View style={styles.textContainer}>
    //               <Text style={styles.landmarkTitle}>{selectedLandmark.name}</Text>
    //               <Text style={styles.landmarkDesc}>Knights Plaza</Text>
    //               <Text style={styles.landmarkDesc}>Unisex</Text>
    //               <Text style={styles.landmarkDesc}>Hours: 9:00 am - 5:00 pm</Text>

    //             </View>
                
    //             <View>
    //               <CachedImage 
    //                 source={{ uri: selectedLandmark.imgUrl }}
    //                 cacheKey={`img_test`}
    //                 resizeMode="cover"
    //                 style={styles.imageContainer}
    //               /> 
    //             </View>
    //           </View>
    //       }
    //     </View>
    // );

    //     return(
    //     <SafeAreaView style={styles.screen}>
    //         {selectedLandmark &&
    //         //   <View style={styles.container}>   
    //         //   </View>
    //         <>
    //             <View style={styles.textContainer}>
    //               <Text style={styles.landmarkTitle}>{selectedLandmark.name}</Text>
    //               <Text style={styles.landmarkDesc}>Knights Plaza</Text>
    //               <Text style={styles.landmarkDesc}>Unisex</Text>
    //               <Text style={styles.landmarkDesc}>Hours: 9:00 am - 5:00 pm</Text>
    //             </View>

    //             <View style={styles.reviewsContainer}>

    //                 <View style={styles.reviewHeaderContainer}>
    //                     <View style={styles.reviewHeaderTextContainer}>
    //                         <Text style={styles.reviewHeaderText}>Reviews</Text>
    //                     </View>
    //                 </View>
                    
    //                 {reviewsData && 
    //                     <FlatList
    //                         data={reviewsData}
    //                         renderItem={({item}) => (
    //                             <View style={styles.reviewItemContainer}>
    //                                 <Text style={styles.reviewAuthorText}>{item.review_author}</Text>
    //                                 <View style={styles.reviewRatingContainer}>
    //                                     <MaterialIcons name="star-rate" size={18} color={item.num_stars >= 1 ? "gold" : "#D3D3D3"} />
    //                                     <MaterialIcons name="star-rate" size={18} color={item.num_stars >= 2 ? "gold" : "#D3D3D3"} />
    //                                     <MaterialIcons name="star-rate" size={18} color={item.num_stars >= 3 ? "gold" : "#D3D3D3"} />
    //                                     <MaterialIcons name="star-rate" size={18} color={item.num_stars >= 4 ? "gold" : "#D3D3D3"} />
    //                                     <MaterialIcons name="star-rate" size={18} color={item.num_stars >= 5 ? "gold" : "#D3D3D3"} />
                                        
    //                                     <Text style={styles.reviewLapsedTimeText}>{item.time_since_reviewed_text}</Text>
    //                                 </View>
    //                                 {/* <Text style={styles.reviewText}>{item.review_text}</Text> */}
                                   
                                    
    //                                 {/* <ReadMore numberOfLines={4} style={styles.reviewText} seeMoreStyle={styles.seeMoreTextStyle} seeLessStyle={styles.seeLessTextStyle}>
    //                                     {item.review_text}
    //                                 </ReadMore> */}
    //                                 <ReadMore
    //                                     numberOfLines={4}
    //                                     renderTruncatedFooter={(handlePress) => (<Text style={styles.seeMoreTextStyle} onPress={handlePress}>Show More</Text>)}
    //                                     renderRevealedFooter={(handlePress) => (<Text style={styles.seeMoreTextStyle} onPress={handlePress}>Show Less</Text>)}
    //                                     // onReady={() => console.log("ready")}
    //                                     >
    //                                     <Text style={styles.reviewText}>
    //                                         {item.review_text}
    //                                     </Text>
    //                                 </ReadMore>
    //                             </View>
    //                         )}
    //                      />    
    //                 }
    //                 <View style={styles.spinnerContainer}>
    //                     <ActivityIndicator animating={reviewsData == null} />
    //                 </View>
    //             </View>
    //           </>
    //       }
    //     </SafeAreaView>
    // );
    

    return(
        <>
        <SafeAreaView style={styles.screen}>
            {selectedLandmark &&
                    <FlatList
                        style={{width: '100%', flex: 1}}
                        // contentContainerStyle={{width: '100%', flex:1}}
                        // onRefresh={handleRefresh}
                        // refreshing={isRefreshingReviews}
                        ListHeaderComponent={<LandmarkDetailScreenHeader selectedLandmark={selectedLandmark} setModalVisible={setModalVisible} navigation={navigation} />}
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
                                    
                                    {/* <Text style={styles.reviewLapsedTimeText}>{item.time_since_reviewed_text}</Text> */}
                                    <Text style={styles.reviewLapsedTimeText}>{getRelativeDateTime(item.review_date)}</Text>
                                    {/* <Text style={styles.reviewLapsedTimeText}>{reviewTimeSinceData[index]}</Text> */}

                                </View>
                                <ReadMore
                                    numberOfLines={4}
                                    renderTruncatedFooter={(handlePress) => (<Text style={styles.seeMoreTextStyle} onPress={handlePress}>Show More</Text>)}
                                    renderRevealedFooter={(handlePress) => (<Text style={styles.seeMoreTextStyle} onPress={handlePress}>Show Less</Text>)}
                                    // onReady={() => console.log("ready")}
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

        
        {/* <SignInToContinueBottomSheet navigation={navigation} signInToContinueSheetRef={signInToContinueSheetRef}/> */}

        {/* <Modal
            animationType="slide"
            transparent={true}
            visible={modalVisible}
            onRequestClose={() => {
            // Alert.alert('Modal has been closed.');
                setModalVisible(!modalVisible);
            }}>
            <View style={styles.centeredView}>
                <View style={styles.modalView}>
                    <Text>Hello World!</Text>
                    <Pressable
                        onPress={() => setModalVisible(!modalVisible)}
                        >
                            <Text>Hide Modal</Text>
                    </Pressable>
                </View>
            </View>
        </Modal> */}
        </>
    );
}


// function SignInToContinueBottomSheet({navigation, signInToContinueSheetRef}){

//     const snapPoints = useMemo(() => ['15%', '30%'], []);

//     return (
//         <BottomSheet
//             backdropComponent={BottomSheetBackdrop}
//             backgroundStyle={styles.bgContainer}
//             // handleComponent={null}
//             ref={signInToContinueSheetRef}
//             index={-1}
//             snapPoints={snapPoints}
//         // onChange={i => handleSheetChanges(i)}
//             enablePanDownToClose={false}
            
//         >
//             <View style={{flex: 1}}>  
//                 <View style={{width: '100%', marginTop: 25}}>
//                     <Text style={{textAlign: 'center', fontSize: 18, fontWeight: '500'}}>Create an account or log in to leave a review</Text>
//                 </View>
    
//                 <View style={styles.loginButtonsContainer}>
    
//                     <Pressable 
//                         style={({pressed}) => [styles.button, {backgroundColor: pressed ? 'gold' : 'gold', borderColor: 'gold', opacity: pressed ? 0.5 : 1}]}
//                         onPress={() => {
//                             console.log("sign in button pressed");
//                             navigation.navigate("Sign in Screen");
//                         }}
//                     >
//                         {({pressed}) => (
//                             <Text style={[styles.signInButtonText, {color: 'black'}]}>Sign In</Text>
//                         )}
//                     </Pressable>
    
//                     <Pressable 
//                         style={({pressed}) => [styles.button, {backgroundColor: pressed ? 'black' : 'black', borderColor: 'black', opacity: pressed ? 0.5 : 1}]}
//                         onPress={() => console.log("create account button pressed")}
//                     >
//                         {({pressed}) => (
//                             <Text style={[styles.createAccountButtonText,{color: 'white'}]}>Create Account</Text>
//                         )}
//                     </Pressable>
    
    
//                     <View>
                        
//                     </View>
    
//                 </View>
//             </View>

//         </BottomSheet>
//     );
// }


function LandmarkDetailScreenHeader({selectedLandmark, setModalVisible, navigation}){

    const {setLandmarkUnderEdit, setCurLandmarkHopData, setEditedMapLocation, signInToContinueSheetRef, user, bookmarkedLandmarkIds} = useContext(AppContext);
    
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
            console.log("Bookmarks updated successfully");
          })
          .catch((error) => {
              console.error("Error updating bookmark ", error);
          });
        }
        else {
          console.log("nothing happening");
        }
        
  
      };

// position: 'relative', top: 0, bottom: 0, right: 0, left: 0, height: '100%', marginRight: 0, marginTop: 35,
    return (
        <View style={{flex: 1}}>
            <View style={styles.landmarkInfoContainer}>
                <View style={styles.textContainer}>
                    <Text style={styles.landmarkTitle}>{selectedLandmark.building || "placeholder"}</Text>
                    {/* <Text style={styles.landmarkDesc}>Knights Plaza</Text> */}
                    <Text style={styles.landmarkDesc}>{selectedLandmark.gender ? selectedLandmark.gender.charAt(0).toUpperCase() + selectedLandmark.gender.slice(1) : ""}</Text>
                    {/* <Text style={styles.landmarkDesc}>Hours: 9:00 am - 5:00 pm</Text> */}
                    <DetailScreenHoursOfOperationText hopData={selectedLandmark.hopData.flattenedHopDataForFilteringAndMutating[mod(new Date().getDay() - 1, 7)]}/>

                    <View style={styles.handicapInfoContainer}>

                        {selectedLandmark.isHandicapAccessible ?
                        <Ionicons name="ios-checkmark-sharp" size={18} color={'green'} /> :
                        <Ionicons name="md-close-sharp" size={18} color="red" />
                        }

                        <Text style={{paddingLeft: 5}}>Handicap Accessible</Text>
                    </View>
                </View>

                <View style={{ borderWidth: 0, flex: 1, alignItems: 'flex-end', marginTop: 15, marginRight: 10}}>
                    
                  <Pressable onPress={() => {
                      handleToggleBookmark();
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
                    {/* <CachedImage 
                        source={{ uri: selectedLandmark.imgUrl }}
                        cacheKey={`img_test`}
                        resizeMode="cover"
                        style={styles.imageContainer}
                    />  */}
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
                    console.log("Report issue button pressed");
                    // setModalVisible(true);
                    setLandmarkUnderEdit(selectedLandmark);
                    setEditedMapLocation({longitude: selectedLandmark.longitude, latitude: selectedLandmark.latitude});
                    setCurLandmarkHopData(cloneDeep(selectedLandmark.hopData));
                    console.log(selectedLandmark);
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
                        console.log("leave review button pressed");
                        // navigation.navigate("Login modal");
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
        marginTop: StatusBar.currentHeight || 0,
        width: '100%',
        // height: '100%',
        
    },
    // container: {
    //     flex: 1,
    //     // flexDirection: 'row',
    //     // backgroundColor: 'red',
    //     alignItems: 'flex-start',
    //     justifyContent: 'center',
    //     width: '100%'
    // },
    headerComponentStyle: {
        width: '100%',
        flex: 1
    },
    landmarkInfoContainer: {
        width: '100%',
        flex: 1,
        // borderWidth: 1,
        // borderColor: 'red',
        flexDirection: 'row',
        minHeight: Dimensions.get('window').height * 0.16,
        borderBottomWidth: 1,
        borderBottomColor: '#D3D3D3',
        // backgroundColor: 'red',
        // paddingBottom: 10,
        // alignItems: 'center',
        justifyContent: 'space-between',
    },
    reportIssueButtonContainer: {
        width: '100%',
        // marginTop: 10
        marginTop: 12,
        marginBottom: 4
    },
    reportIssueButtonText: {
        color: '#007bff',
        paddingLeft: 12,
        
    },
    imageContainer: {
        // flex: 1,
        // borderWidth: 2,
        // borderColor: 'blue',
        flex:1,
        borderWidth: 0, 
        // borderColor: 'blue', 
        width: Dimensions.get('window').width / 3,
        // backgroundColor: 'red',
        // justifyContent: 'center',
        // alignSelf: 'center',
        // maxHeight: Dimensions.get('window').width / 4,
        // width: 10

        // maxWidth: Dimensions.get('window').width / 3,
        // minWidth: '70%'
    },
    textContainer: {
    //   flex: 1,
    //   alignSelf: 'flex-start',
    //   justifyContent: 'flex-start',
      height: '100%',
    //   borderWidth: 1,
      justifyContent: 'center',
      paddingTop: 8,
      paddingBottom: 4,
      paddingLeft: 12,
    //   borderBottomWidth: 1,
    //   width: '100%',
    //   alignSelf: 'center'
    //   height: 10
    },
    landmarkTitle:{
    //   paddingLeft: 12,
      // paddingTop: 10,
      paddingBottom: 4,
      fontWeight: 'bold',
      fontSize: 18
    },
    landmarkDesc: {
    //   paddingLeft: 12,
      paddingVertical: 4
    },
    // imageContainer: {
    //   flex: 1,
    //   backgroundColor: 'black',  
    //   minWidth: Dimensions.get('window').width / 3,
    // },
    bgContainer: {
      borderRadius: 0
    },
    reviewHeaderContainer: {
        // justifyContent: 'flex-start',
        // alignItems: 'flex-start',
        // flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        // width: '100%',
        marginHorizontal: 15,
        paddingVertical: 10,

        borderBottomWidth: 1,
        borderBottomColor: '#D3D3D3',

        // borderColor: 'blue',
        // borderWidth: 1,
        // before
        // marginTop: 8,
        // paddingHorizontal:15,
        // paddingVertical: 10,
        // width: '100%',
    },
    reviewHeaderTextContainer: {
        alignItems: 'center',
        textAlign: 'center',
        // flex: 1
        // width: '100%',
        // borderBottomWidth: 1,
        // borderBottomColor: '#D3D3D3',
    },
    reviewHeaderText: {
        textAlignVertical: 'center',
        // borderColor: 'blue',
        // borderWidth: 1,
        fontWeight: 'bold',
        fontSize: 22,
        // paddingBottom: 10,
    },
    leaveReviewTextContainer:{
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        paddingHorizontal: 15,
        // paddingHorizontal: 32,
        borderRadius: 4,
        elevation: 3,
        borderWidth: 1,
        borderColor: 'gold',
        backgroundColor: 'gold',
    },
    leaveReviewText: {
        // color: '#007bff',
        color: 'black',
        fontWeight: 'bold',
        
        
        
        // fontWeight: '700'
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
        // flex: 1,
        // width: '100%',
        // height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        // borderColor: 'red',
        // borderWidth: 1,
        paddingTop: 25
        // justifyContent: 'space-between'
    },
    leaveReviewButton: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        paddingHorizontal: 15,
        // paddingHorizontal: 32,
        borderRadius: 4,
        elevation: 3,
        borderWidth: 1,
        // backgroundColor: 'gold',
        // width: '100%'
    },
    leaveReviewButtonPressed: {
        backgroundColor: 'white',
        // borderWidth: 1,
        borderColor: 'gold'
    },
    leaveReviewButtonNotPressed: {
        // borderWidth: 0,
        backgroundColor: 'gold',
        borderColor: 'gold'
    },
    leaveReviewText: {
        // fontSize: 16,
        // lineHeight: 21,
        fontWeight: 'bold',
        letterSpacing: 0.25,
        // color: 'black',
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


// function ExpandableText({text}){

//     //
//     const [textShown, setTextShown] = useState(false); //To show ur remaining Text
//     const [lengthMore, setLengthMore] = useState(false); //to show the "Read more & Less Line"
//     const toggleNumberOfLines = () => { //To toggle the show text or hide it
//         setTextShown(!textShown);
//     }

//     const onTextLayout = useCallback(e =>{
//         console.log(e.nativeEvent.lines.length);
//         setLengthMore(e.nativeEvent.lines.length > 4); //to check the text is more than 4 lines or not
//         // console.log(e.nativeEvent);
//     },[]);

//     //

//     return (
//         <View>
//             <Text onTextLayout={onTextLayout} numberOfLines={textShown ? undefined : 4} style={{ lineHeight: 21 }}>
//                 {text}
//             </Text>
//             {
//                 lengthMore ? <Text
//                 onPress={toggleNumberOfLines}
//                 style={{ lineHeight: 21, marginTop: 10 }}>{textShown ? 'Read less...' : 'Read more...'}</Text> : null
//             }
//         </View>

//     );


// }