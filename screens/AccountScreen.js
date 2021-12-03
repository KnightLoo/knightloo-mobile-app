import React, {useEffect, useState, useRef, useContext, forwardRef, useImperativeHandle} from 'react';
import { StyleSheet, Button, Text, View, Dimensions, Pressable, Image} from 'react-native';
import AppContext from '../contexts/AppContext';
import Firebase from '../utils/Firebase';

const auth = Firebase.auth();

export default function AccountScreen({navigation}){

    const {user} = useContext(AppContext);

    const handleSignOut = async () => {
        await auth.signOut();
    };

    return (
        <View style={styles.screen}>

            {user ?
            
            (<>
                <View style={{alignItems: 'center', justifyContent: 'center', marginVertical: 20}}>
                    <Image source={require('../assets/knightloo_logo.jpg')} style={{ width: 324 / 3, height: 362 / 3, borderWidth: 0}} /> 
                </View>
                
                <View style={styles.welcomeMessageContainer}>
                    <Text style={styles.welcomeMessageText}>Hello, {user.displayName}</Text>
                </View>

                <View style={styles.signOutButtonContainer}>

                <Pressable 
                        onPress={handleSignOut} 
                    >
                        {({ pressed }) => (
                            <Text style={{opacity: pressed ? 0.25 : 1, elevation: 3, fontWeight: '600', color: "#007bff", fontSize: 17}}>
                                Sign out
                            </Text>
                        )}             
                    </Pressable>
                </View>
            </>)
            
            : (<View>
                    <View style={styles.signInMessageContainer}>
                        <Text style={styles.signInMessageText}>Sign In or Create an Account</Text>
                    </View>
        
                    <View style={styles.loginButtonsContainer}>
        
                        <Pressable 
                            style={({pressed}) => [styles.button, {backgroundColor: pressed ? 'gold' : 'gold', borderColor: 'gold', opacity: pressed ? 0.5 : 1}]}
                            onPress={() => {
                                console.log("sign in button pressed");
                                navigation.navigate("Sign in Screen", {prevScreen: 'Account'});
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
                                navigation.navigate("Create Account Screen", {prevScreen: 'Account'});
                            }}
                        >
                            {({pressed}) => (
                                <Text style={[styles.createAccountButtonText,{color: 'white'}]}>Create Account</Text>
                            )}
                        </Pressable>
        
        
                        <View>
        
                        </View>
        
                    </View>
                </View>)
            }
        </View>
    );
}




const styles = StyleSheet.create({
    screen: {
        flex: 1,
        width: '100%',
        backgroundColor: 'white'
    },
    welcomeMessageContainer: {
        alignItems: 'center',
        marginVertical: 30
    },
    welcomeMessageText: {
        fontSize: 24,
        fontWeight: '500',
    },
    signInMessageContainer: {
        alignItems: 'center',
        marginVertical: 20
    },
    signInMessageText: {
        fontSize: 24,
        fontWeight: '500'
    },
    loginButtonsContainer: {
        paddingHorizontal: 30,
        alignItems: 'center'
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
    },
    signOutButtonContainer: {
        flex: 1,
        alignItems: 'center'
    }
});