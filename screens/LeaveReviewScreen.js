import React, {useEffect, useState, useRef, useContext} from 'react';
import { StyleSheet, Text, TextInput, View, Dimensions, Pressable, Platform } from 'react-native';
import AppContext from '../contexts/AppContext';
import * as Haptics from 'expo-haptics';
import { Rating } from 'react-native-ratings';

import firebase from 'firebase/app';
import 'firebase/firestore';
import Firebase from '../utils/Firebase';

const db = Firebase.firestore();

const keyboardType = Platform.OS === "ios" ? "ascii-capable": "default";


export default function LeaveReviewScreen({navigation}){

    const reviewTextInputRef = useRef();

    const {landmarkUnderReview, user} = useContext(AppContext);

    const [rating, setRating] = useState(3);
    const [reviewText, setReviewText] = useState("");


    const handleReviewSubmit = async () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

        if(rating && reviewText && user && user.displayName && landmarkUnderReview.id){

            const batch = db.batch();

            const rating_num = parseInt(rating);

            const landmarkDataDocRef = db.collection("landmark_locations_data").doc(landmarkUnderReview.id);

            batch.update(landmarkDataDocRef, {
                ratings_sum: firebase.firestore.FieldValue.increment(rating_num),
                num_ratings: firebase.firestore.FieldValue.increment(1)
            });

            const newReviewDocRef = db.collection("bathroom_reviews").doc();

            batch.set(newReviewDocRef, {
                landmark_id: landmarkUnderReview.id,
                review_author: user.displayName,
                review_text: reviewText,
                num_stars: rating_num,
                review_date: firebase.firestore.FieldValue.serverTimestamp()
            });

            try {
                await batch.commit();
                // console.log("just committed");
                navigation.goBack();
            } catch (error){
                console.log("Error creating review ", error);
            }
        }
    }
 

    return (
        <Pressable style={styles.screen} onPress={() => reviewTextInputRef.current.blur()}>

            <View style={styles.leaveReviewHeaderContainer}>
                <Text style={styles.leaverReviewHeaderText}>Write a review for {landmarkUnderReview.building} ({landmarkUnderReview.gender})</Text>
            </View>

            <View style={styles.ratingContainer}>
                <Rating
                    type="custom"
                    showRating={false}
                    reviews={['Terrible', 'Bad', 'Okay', 'Good', 'Great']}
                    fractions={0}
                    startingValue={3}
                    minValue={1}
                    style={{ marginTop: 20 }}
                    onFinishRating={(newRating) => setRating(newRating)}
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
                        numberOfLines={5}
                    />
                </View>
    
            </View>

            <View style={styles.buttonsContainer}>

                <Pressable 
                    style={({pressed}) => [styles.button, {backgroundColor: 'white', borderColor: 'gold', opacity: pressed ? 0.5 : 1}]}
                    onPress={() => {
                        // console.log("cancel button pressed");
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
                        // console.log("submit button pressed");
                        handleReviewSubmit();
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
        backgroundColor: '#fff',
        alignItems: 'center'
    },
    screen: {
        flex: 1,
        justifyContent: 'flex-start',
        backgroundColor: '#fff',
        paddingBottom: 10
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
        width: '100%',
        marginTop: 20,
    },
    fieldHeaderText: {
        fontSize: 17,
        paddingLeft: 15,
        fontWeight: '400',
    },
    inputContainer: {
        marginTop: 10,
    },
    textInput: {
        fontSize: 17,
        height: Dimensions.get("window").height * 0.15,
        borderBottomColor: '#D3D3D3',
        borderBottomWidth: 1,
        borderTopColor: '#D3D3D3',
        borderTopWidth: 1,
        paddingHorizontal: 15,
    },
    buttonsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 20,
        paddingHorizontal: 20,
    },
    button: {
        flexGrow: 1,
        marginHorizontal: 10,
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
    starContainer: {
    }
});