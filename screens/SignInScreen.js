import React, { useEffect, useState, useRef, useContext, useLayoutEffect } from 'react';
import { StyleSheet, Text, View, Pressable, TextInput, Platform, Image, Easing } from 'react-native';
import AppContext from '../contexts/AppContext';
import {CardStyleInterpolators, TransitionSpecs} from '@react-navigation/stack';
import Firebase from '../utils/Firebase';

const auth = Firebase.auth();

const keyboardType = Platform.OS === "ios" ? "ascii-capable": "default";

const flipOptions = {
    headerBackTitle: "Back",
    headerBackTitleStyle: {color: "#007bff"},
    headerLeftContainerStyle: {paddingLeft: 5},
    transitionSpec: {
      open: {
        animation: "timing",
        config: {
          duration: 700,
          easing: Easing.out(Easing.poly(4)),
          // easing: Easing.ease
        }
      },
      close: {
        animation: "timing",
        config: {
          duration: 700,
          easing: Easing.out(Easing.poly(4)),
        }
      },
    },
    cardStyleInterpolator: ({ current, next }) => {
      return {
        cardStyle: {
          opacity: next
            ? next.progress.interpolate({
              inputRange: [0, 0.5, 1],
              outputRange: [1, 1, 0],
            })
            : current.progress.interpolate({
              inputRange: [0, 0.5, 1],
              outputRange: [0, 0, 1],
            }),
          backfaceVisibility: 'hidden',
          transform: [
            {
              rotateY: next
                ? next.progress.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0deg', '-180deg'],
                })
                : current.progress.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['180deg', '0deg'],
                }),
            },
            {
              scaleY: next ? next.progress.interpolate({
                inputRange: [0, 1],
                outputRange: [1, 0.7],
              }) : current.progress.interpolate({
                inputRange: [0, 1],
                outputRange: [0.7, 1],
              }),
            },
          ],
        },
        overlayStyle: {
          opacity: current.progress.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 1],
          }),
        },
      };
    },
};

export default function SignInScreen({navigation, route}){

    const {setIsAppWideLoading, signInToContinueSheetRef, setNeedsToShowReviewScreen, setDidComeFromReviewButtonPress, didComeFromReviewButtonPress} = useContext(AppContext);
  
    const emailTextInputRef = useRef();
    const pwordTextInputRef = useRef();

    const [email, setEmail] = useState(null);
    const [password, setPassword] = useState(null);

    const [emailError, setEmailError] = useState(null); 
    const [pwordError, setPwordError] = useState(null);


    useLayoutEffect(() => {

        if(route.params.prevScreen == "CreateAccount"){
            navigation.setOptions(flipOptions);
        } else {
            navigation.setOptions({});
        }

    }, []);

    const blurAllInputs = () => {
        emailTextInputRef.current.blur();
        pwordTextInputRef.current.blur();
    }


    const handleSignIn = async () => {

        const newEmailError = email == null || email == "" ? "Required" : null;
        const newPwordError = password == null || password == "" ? "Required" : null;

        setEmailError(newEmailError);
        setPwordError(newPwordError);

        if(!newEmailError && !newPwordError){

            try {
                setIsAppWideLoading(true);
                await auth.signInWithEmailAndPassword(email, password);
                
                setIsAppWideLoading(false);

                navigation.setOptions({
                    cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS, 
                    transitionSpec: {
                      open: TransitionSpecs.TransitionIOSSpec,
                      close: TransitionSpecs.TransitionIOSSpec,
                    }
                  });

                  signInToContinueSheetRef.current.close();

                  setTimeout(() => {
                    if(didComeFromReviewButtonPress){
                        setNeedsToShowReviewScreen(true);
                    }

                    navigation.goBack();
                  }, 10);

            } catch (error) {

                switch(error.code){
                    case "auth/invalid-email":
                        setEmailError("Invalid Email");
                        break;
                    case "auth/wrong-password":
                        setPwordError("Incorrect Email and/or Password");
                        break;
                    case "auth/user-not-found":
                        setEmailError("An account with that email does not exist");
                    default: 
                        console.log(error.code);
                }

                pwordTextInputRef.current.clear();
                setIsAppWideLoading(false);
            }
        }
    };

    return (
        <Pressable onPress={blurAllInputs} style={styles.screen}>

            <View style={{alignItems: 'center', justifyContent: 'center', marginVertical: 20}}>
                <Image source={require('../assets/knightloo_logo.jpg')} style={{ width: 324 / 2, height: 362 / 2, borderWidth: 0}} /> 
            </View>
            

            <View style={styles.signInFormContainer}>
                <View style={{width: '100%'}}>
                    <TextInput 
                        ref={emailTextInputRef}
                        clearButtonMode={'while-editing'}
                        keyboardType={'email-address'}
                        style={[styles.textInput, emailError ? {borderColor: 'red', borderWidth: 1} : {borderColor: '#D3D3D3', borderWidth: 0.5}]} 
                        autoCorrect={false}
                        placeholder="Email" 
                        multiline={false}
                        returnKeyType={"next"}
                        blurOnSubmit={false}
                        onSubmitEditing={() => pwordTextInputRef.current.focus()}
                        onChangeText={(newEmail) => {

                            if(newEmail != null && newEmail != ""){
                                setEmailError(null);
                            }
                            setEmail(newEmail);
                        }}
                    />
                     <Text style={{opacity: emailError ? 1 : 0, color: 'red', marginTop: 5}}>{emailError ? emailError: "hidden"}</Text>
                </View>


                <View style={{width: '100%', marginTop: 6}}>
                    <TextInput 
                        ref={pwordTextInputRef}
                        clearButtonMode={'while-editing'}
                        keyboardType={keyboardType}
                        style={[styles.textInput, pwordError ? {borderColor: 'red', borderWidth: 1} : {borderColor: '#C3C3C3', borderWidth: 0.5}]} 
                        autoCorrect={false}
                        placeholder="Password" 
                        multiline={false}
                        secureTextEntry={true}
                        onChangeText={(newPassword) => {

                            if(newPassword != null && newPassword != ""){
                                setPwordError(null);
                            }
                            setPassword(newPassword);
                        }}
                    />
                    <Text style={{opacity: pwordError ? 1 : 0, color: 'red', marginTop: 5}}>{pwordError ? pwordError: "hidden"}</Text>
                </View>

                <View style={styles.signInButtonContainer}>
                    <Pressable 
                        style={({pressed}) => [styles.button, {backgroundColor: pressed ? 'gold' : 'gold', borderColor: 'gold', opacity: pressed ? 0.5 : 1}]}
                        onPress={() => {
                            // console.log("sign in button pressed");
                            handleSignIn();
                        }}
                    >
                        {({pressed}) => (
                            <Text style={[styles.signInButtonText, {color: 'black'}]}>Sign In</Text>
                        )}
                    </Pressable>

                    <View>
                            
                    </View>

                </View>

                <View style={styles.switchToSignUpContainer}>
                    
                    <Text style={styles.switchToSignUpQuestionText}>Don't have an account yet?</Text>
                    <Pressable 
                            onPress={() => {
                                // console.log("switch to create account screen button pressed");
                                navigation.replace("Create Account Screen", {prevScreen: 'SignIn'});
                            }}
                        >
                            {({pressed}) => (
                                <Text style={[styles.switchToSignUpButtonText, {opacity: pressed ? 0.5 : 1}]}>Sign up</Text>
                            )}
                    </Pressable>
                </View>
                
            </View>
        </Pressable>
    );
}



const styles = StyleSheet.create({
    screen: {
        flex: 1,
        width: '100%',
        backgroundColor: 'white'
    },
    signInFormContainer: {
        marginHorizontal: 30,
    },
    signInMessageContainer: {
        alignItems: 'center',
        marginVertical: 20
    },
    signInMessageText: {
        fontSize: 24,
        fontWeight: '500'
    },
    signInButtonContainer: {
        alignItems: 'center',
        width: '100%',
        marginTop: 15
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
    textInput: {
        fontSize: 17,
        fontSize: 17,
        paddingLeft: 10,
        paddingVertical: 14, // 18
        borderWidth: 0.5,
        borderRadius: 5,
    },
    switchToSignUpContainer: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 15
    },
    switchToSignUpQuestionText: {
        color: 'gray',
        fontSize: 16,
        marginRight: 5
    },
    switchToSignUpButtonText: {
        color: '#007bff',
        fontSize: 16
    }
});