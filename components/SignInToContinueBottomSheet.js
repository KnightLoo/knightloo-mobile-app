import React, { useMemo, useContext, useState, useEffect } from 'react';
import BottomSheet, {BottomSheetBackdrop} from '@gorhom/bottom-sheet';
import { StyleSheet, Text, View, Button, SafeAreaView, Pressable, Dimensions, Image } from 'react-native';
import CachedImage from 'expo-cached-image';
import ExpoFastImage from 'expo-fast-image';
import AppContext from '../contexts/AppContext';
import LandmarkMapContext from '../contexts/LandmarkMapContext';

export default function SignInToContinueBottomSheet({navigation, signInToContinueSheetRef}){


    const {setDidComeFromReviewButtonPress} = useContext(AppContext);

    const snapPoints = useMemo(() => ['15%', '30%'], []);

    return (
        <BottomSheet
            backdropComponent={BottomSheetBackdrop}
            backgroundStyle={styles.bgContainer}
            handleComponent={null}
            ref={signInToContinueSheetRef}
            index={-1}
            snapPoints={snapPoints}
        // onChange={i => handleSheetChanges(i)}
            enablePanDownToClose={false}
            
        >
            <View style={{flex: 1}}>  
                <View style={{width: '100%', marginTop: 25}}>
                    <Text style={{textAlign: 'center', fontSize: 18, fontWeight: '500'}}>Create an account or log in to leave a review</Text>
                </View>
    
                <View style={styles.loginButtonsContainer}>
    
                    <Pressable 
                        style={({pressed}) => [styles.button, {backgroundColor: pressed ? 'gold' : 'gold', borderColor: 'gold', opacity: pressed ? 0.5 : 1}]}
                        onPress={() => {
                            console.log("sign in button pressed");
                            setDidComeFromReviewButtonPress(true);
                            navigation.navigate("Sign in Screen", {prevScreen: 'DetailScreen'});
                        }}
                    >
                        {({pressed}) => (
                            <Text style={[styles.signInButtonText, {color: 'black'}]}>Sign In</Text>
                        )}
                    </Pressable>
    
                    <Pressable 
                        style={({pressed}) => [styles.button, {backgroundColor: pressed ? 'black' : 'black', borderColor: 'black', opacity: pressed ? 0.5 : 1}]}
                        onPress={() => {
                            console.log("create account button pressed");
                            setDidComeFromReviewButtonPress(true);
                            navigation.navigate("Create Account Screen", {prevScreen: 'DetailScreen'});
                        }}
                    >
                        {({pressed}) => (
                            <Text style={[styles.createAccountButtonText,{color: 'white'}]}>Create Account</Text>
                        )}
                    </Pressable>
    
    
                    <View>
                        
                    </View>
    
                </View>
            </View>

        </BottomSheet>
    );
}



const styles = StyleSheet.create({
    loginButtonsContainer: {
        paddingHorizontal: 30,
        alignItems: 'center',
        width: '100%',
        marginTop: 25
    },
    button: {
        width: '100%',
        borderRadius: 5,
        marginVertical: 10,
        paddingVertical: 12,
        alignItems: 'center',
        borderWidth: 1
    },
    signInButtonText: {
        fontSize: 17,
        fontWeight: 'bold',
        elevation: 3
    },
    createAccountButtonText: {
        fontSize: 17,
        fontWeight: 'bold',
        elevation: 3
    }
});