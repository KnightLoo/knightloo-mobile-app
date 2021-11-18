import React, {useEffect, useState, useRef, useContext} from 'react';
import { StyleSheet, Button, Text, TextInput, View, Dimensions, Pressable, Platform, ScrollView, SafeAreaView, KeyboardAvoidingView, TouchableWithoutFeedback, Keyboard, Vibration} from 'react-native';
import AppContext from '../contexts/AppContext';
import * as Haptics from 'expo-haptics';
import { FontAwesome5 } from '@expo/vector-icons';
import { Ionicons } from '@expo/vector-icons';
import { Rating, AirbnbRating } from 'react-native-ratings';

// import { SafeAreaView } from 'react-native-safe-area-context';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { useHeaderHeight } from '@react-navigation/elements';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import firebase from 'firebase/app';
import 'firebase/firestore';
import Firebase from '../utils/Firebase';

const db = Firebase.firestore();

const keyboardType = Platform.OS === "ios" ? "ascii-capable": "default";


export default function LeaveReviewScreen({navigation}){

    const reviewTextInputRef = useRef();

    const {selectedLandmark, user} = useContext(AppContext);

    const [rating, setRating] = useState(3);
    const [reviewText, setReviewText] = useState("");


    const handleReviewSubmit = async () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

        if(rating && reviewText && user && user.displayName && selectedLandmark.id){

            const batch = db.batch();

            const rating_num = parseInt(rating);

            const landmarkDataDocRef = db.collection("landmark_locations_data").doc(selectedLandmark.id);

            batch.update(landmarkDataDocRef, {
                ratings_sum: firebase.firestore.FieldValue.increment(rating_num),
                num_ratings: firebase.firestore.FieldValue.increment(1)
            });

            const newReviewDocRef = db.collection("bathroom_reviews").doc();

            batch.set(newReviewDocRef, {
                landmark_id: selectedLandmark.id,
                review_author: user.displayName,
                review_text: reviewText,
                num_stars: rating_num,
                review_date: firebase.firestore.FieldValue.serverTimestamp()
            });

            try {
                await batch.commit();
                console.log("just committed");
                navigation.goBack();
            } catch (error){
                console.log("Error creating review ", error);
            }
        }
    }
 

    return (
        <Pressable style={styles.screen} onPress={() => reviewTextInputRef.current.blur()}>

            <View style={styles.leaveReviewHeaderContainer}>
                <Text style={styles.leaverReviewHeaderText}>Write a review for {selectedLandmark.building} ({selectedLandmark.gender})</Text>
            </View>

           
            <View style={styles.ratingContainer}>
                {/* <Text style={styles.ratingHeaderText}>Rating</Text> */}

                <Rating
                    // starContainerStyle={styles.starContainer}
                    type="custom"
                    // ratingImage={(<Ionicons name="ios-star" size={24} color="black" />)}
                    showRating={false}
                    // ratingBackgroundColor={'gray'}
                    // ratingColor={'gray'}

                    reviews={['Terrible', 'Bad', 'Okay', 'Good', 'Great']}
                    fractions={0}
                    startingValue={3}
                    minValue={1}
                    // onFinishRating={this.ratingCompleted}
                    style={{ marginTop: 20 }}
                    onFinishRating={(newRating) => setRating(newRating)}
                    // size={30}
                />
            </View>

            <View style={styles.reviewTextInputContainer}>

                <Text style={styles.fieldHeaderText}>Your Review</Text>
                <View style={styles.inputContainer}>
                    <TextInput 
                        ref={reviewTextInputRef}
                        clearButtonMode={'while-editing'}
                        keyboardType={keyboardType}
                        style={styles.textInput} 
                        defaultValue={''}
                        autoCorrect={false}
                        onChangeText={(text) => setReviewText(text)}
                        placeholder="Detail your experience" 
                        multiline={true}
                        maxLength={140}
                        // scrollEnabled={false}
                        numberOfLines={5}
                    />
                </View>
    
            </View>

            <View style={styles.buttonsContainer}>

                <Pressable 
                    style={({pressed}) => [styles.button, {backgroundColor: 'white', borderColor: 'gold', opacity: pressed ? 0.5 : 1}]}
                    onPress={() => {
                        console.log("cancel button pressed");
                        navigation.goBack();
                    }}
                    >
                        {({pressed}) => (
                            <Text style={[styles.buttonText, {color: 'black'}]}>Cancel</Text>
                        )}
                </Pressable>

                <Pressable 
                    disabled={reviewText == null || reviewText == ""}
                    style={({pressed}) => [styles.button, {backgroundColor: 'gold', borderColor: 'gold', opacity: pressed || reviewText == null || reviewText == "" ? 0.5 : 1}]}
                    onPress={() => {
                        console.log("submit button pressed");
                        handleReviewSubmit();
                        // navigation.goBack();
                    }}
                    >
                        {({pressed}) => (
                            <Text style={[styles.buttonText, {color: 'black'}]}>Submit</Text>
                        )}
                </Pressable>
            </View>

        </Pressable>
    );


}


const styles = StyleSheet.create({
    scrollView: {
        // flex: 1,
        // height: 760,
        // flexGrow: 1, 
        backgroundColor: '#fff',
        // height: '100%',
        alignItems: 'center'

    },
    screen: {
        flex: 1,
        // flexGrow: 1, 
        justifyContent: 'flex-start',
        backgroundColor: '#fff',
        // alignItems: 'flex-start',
        // justifyContent: 'flex-start',
        // marginTop: StatusBar.currentHeight || 0,
        // width: '100%',
        paddingBottom: 10
        // height: '100%'
        // height: 300,
        // borderWidth: 1, 
        // borderColor: 'red'

    },
    leaveReviewHeaderContainer: {
        marginVertical: 20,
        marginHorizontal: 15
    },
    leaverReviewHeaderText: {
        fontSize: 18,
        fontWeight: '400'
    },
    ratingContainer: {
        alignItems: 'center',
        paddingBottom: 25
    },
    ratingHeaderText: {
        fontSize: 20,
        fontWeight: '600'
    },
    reviewTextInputContainer: {
        // flex: 1,
        width: '100%',
        marginTop: 20,
    },
    fieldHeaderText: {
        // color: 'gray',
        fontSize: 17,
        paddingLeft: 15,
        fontWeight: '400',
    },
    inputContainer: {
        // borderBottomColor: '#D3D3D3',
        // borderBottomWidth: 1,
        // borderTopColor: '#D3D3D3',
        // borderTopWidth: 1,
        // // marginTop: 10,
        // paddingHorizontal: 15,
        // paddingVertical: 10,
        marginTop: 10,
        
        // marginHorizontal: 10,
        // height: '15%',
        // maxHeight: Dimensions.get("window").height * 0.25
    },
    textInput: {
        fontSize: 17,

        height: Dimensions.get("window").height * 0.15,
        // maxHeight: Dimensions.get("window").height * 0.25,
        borderBottomColor: '#D3D3D3',
        borderBottomWidth: 1,
        borderTopColor: '#D3D3D3',
        borderTopWidth: 1,
        paddingHorizontal: 15,
        // borderBottomColor: '#D3D3D3',
        // borderBottomWidth: 1,
        // borderTopColor: '#D3D3D3',
        // borderTopWidth: 1,
        // paddingVertical: 18,
        // marginVertical: 10
        // paddingHorizontal: 15,
        // marginVertical: 10,
        // marginRight: 10
        // paddingRight: 50
    },
    buttonsContainer: {
        // flexGrow: 1,
        // width: '80%',
        flexDirection: 'row',
        // justifyContent: 'center',
        alignItems: 'center',
        marginTop: 20,
        // marginHorizontal: 30,
        paddingHorizontal: 20,
        // justifyContent: 'space-around',
        // borderWidth: 1,
    },
    button: {
        flexGrow: 1,
        // flexDirection: 'row',
        marginHorizontal: 10,
        // width: '100%',
        borderRadius: 5,
        marginVertical: 10,
        paddingVertical: 12,
        alignItems: 'center',
        borderWidth: 1
    },
    buttonText: {
        fontSize: 17,
        fontWeight: 'bold',
        elevation: 3
    },
    hoursOfOpertionListContainer: {
        // flex: 1,
        // width: 50,
        borderBottomColor: '#D3D3D3',
        borderBottomWidth: 1,
        borderTopColor: '#D3D3D3',
        borderTopWidth: 1,
        marginVertical: 10,
        // paddingLeft: 18,

        // borderWidth: 1,
        // borderColor: 'red'
        // justifyContent: 'center'
    },
    hoursOfOperationItem: {
        // width: '100%',
        // flex:1,
        flexDirection: 'row',
        // justifyContent: 'center'
        // backgroundColor: 'green'
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 14,
        borderTopColor: '#D3D3D3',
        // paddingLeft: 18
        marginLeft: 18
    },
    starContainer: {
        // marginHorizontal: 10,
        // borderWidth: 1,
        // borderColor: 'black',
        // backgroundColor: 'red'
    }
});