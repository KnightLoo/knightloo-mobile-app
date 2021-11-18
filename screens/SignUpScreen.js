import React, {useEffect, useState, useRef, useContext, forwardRef, useImperativeHandle, useLayoutEffect} from 'react';
import { StyleSheet, Button, Text, View, Dimensions, Pressable, TextInput, Platform, Image, Easing, Alert } from 'react-native';
import AppContext from '../contexts/AppContext';
// import knightloo_logo from '../assets/knightloo_logo.jpg';
// import auth from '../utils/auth';
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

export default function SignUpScreen({navigation, route}){

    const {setIsAppWideLoading, signInToContinueSheetRef, setNeedsToShowReviewScreen} = useContext(AppContext);

    const nameTextInputRef = useRef();
    const emailTextInputRef = useRef();
    const pwordTextInputRef = useRef();
    const confirmPwordTextInputRef = useRef();

    const [name, setName] = useState(null);
    const [email, setEmail] = useState(null);
    const [password, setPassword] = useState(null);
    const [confirmPassword, setConfirmPassword] = useState(null);

    // const [nameError, setNameError] = useState("Required");
    // const [emailError, setEmailError] = useState("Required"); 
    // const [pwordError, setPwordError] = useState("Required"); 
    // const [confirmPwordError, setConfirmPwordError] = useState("Required");      

    const [nameError, setNameError] = useState(null);
    const [emailError, setEmailError] = useState(null); 
    const [pwordError, setPwordError] = useState(null); 
    const [confirmPwordError, setConfirmPwordError] = useState(null); 

    useLayoutEffect(() => {
        console.log("Create Account screen:::prev screen: ", route.params.prevScreen);

        if(route.params.prevScreen == "SignIn"){
            navigation.setOptions(flipOptions);
        } else {
            navigation.setOptions({});
        }

    }, []);

    const blurAllInputs = () => {
        nameTextInputRef.current.blur();
        emailTextInputRef.current.blur();
        pwordTextInputRef.current.blur();
        confirmPwordTextInputRef.current.blur();
    }

    const getConfirmPasswordError = () => {
        if(confirmPassword == null || confirmPassword == ""){
            return "Required"
        } else if(confirmPassword !== password){
            return "Passwords do not match";
        }

        return null;
    }


    const handleSubmit = async () => {

        const newNameError = name == null || name == "" ? "Required" : null;
        const newEmailError = email == null || email == "" ? "Required" : null;
        const newPwordError = password == null || password == "" ? "Required" : null;
        const newConfirmPwordError = getConfirmPasswordError();
        // const newConfirmPwordError = confirmPassword == null || confirmPassword == "" ? "Required" : null 

        setNameError(newNameError);
        setEmailError(newEmailError);
        setPwordError(newPwordError);
        setConfirmPwordError(newConfirmPwordError);
        
        if(!newNameError && !newEmailError && !newPwordError && !newConfirmPwordError){
            
            try{
                setIsAppWideLoading(true);
                // setTimeout(() => {
                //     setIsAppWideLoading(false);
                // }, 5000);
                await auth.createUserWithEmailAndPassword(email, password);

                auth.currentUser.updateProfile({
                    displayName: name,
                  }).then(() => {
                    console.log("name updated successfully");
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
                        setNeedsToShowReviewScreen(true);
                        console.log("here");
                        navigation.goBack();
                      }, 10);

                  }).catch((error) => {
                    console.log(error);
                    setIsAppWideLoading(false);
                  });  
                
            } catch(error){

                switch(error.code){
                    case "auth/invalid-email":
                        setEmailError("Invalid Email");
                        break;
                    case "auth/email-already-in-use":
                        setEmailError("Email already in use");
                        break;
                    default: 
                        console.log(error.code);
                }
                // console.log(error.message);
                // console.log(error.code);
                setPassword(null);
                setConfirmPassword(null);
                pwordTextInputRef.current.clear();
                confirmPwordTextInputRef.current.clear();
                setIsAppWideLoading(false);
            }

        } else {
            console.log("found errors");
        }
    }

    useEffect(() => {
        if(name != null && name != ""){
            setNameError(null);
        }
    }, [name])

    return (
        <Pressable onPress={blurAllInputs} style={styles.screen}>

            {/* <View style={styles.signInMessageContainer}>
                <Text style={styles.signInMessageText}>Sign In</Text>
            </View> */}

            <View style={{alignItems: 'center', justifyContent: 'center', marginVertical: 20}}>
                <Image source={require('../assets/knightloo_logo.jpg')} style={{ width: 324 / 4, height: 362 / 4, borderWidth: 0}} /> 
            </View>
            

            <View style={styles.signInFormContainer}>

            <View style={{width: '100%'}}>
                    <TextInput 
                        ref={nameTextInputRef}
                        clearButtonMode={'while-editing'}
                        keyboardType={keyboardType} //'#D3D3D3'
                        style={[styles.textInput, nameError ? {borderColor: 'red', borderWidth: 1} : {borderColor: '#D3D3D3', borderWidth: 0.5}]} 
                        // defaultValue={name}
                        autoCorrect={false}
                        onChangeText={(newName) => {

                            if(newName != null && newName != ""){
                                setNameError(null);
                            }
                            setName(newName);
                        }}
                        placeholder="Name" 
                        multiline={false}
                        returnKeyType={"next"}
                        blurOnSubmit={false}
                        onSubmitEditing={() => emailTextInputRef.current.focus()}
                    />
                    <Text style={{opacity: nameError ? 1 : 0, color: 'red', marginTop: 5}}>{nameError ? nameError: "hidden"}</Text>
                </View>

                <View style={{width: '100%', marginTop: 6}}>
                    <TextInput 
                        ref={emailTextInputRef}
                        clearButtonMode={'while-editing'}
                        keyboardType={'email-address'} //'#D3D3D3'
                        style={[styles.textInput, emailError ? {borderColor: 'red', borderWidth: 1} : {borderColor: '#D3D3D3', borderWidth: 0.5}]} 
                        // defaultValue={email}
                        autoCorrect={false}
                        onChangeText={(newEmail) => {

                            if(newEmail != null && newEmail != ""){
                                setEmailError(null);
                            }

                            setEmail(newEmail);
                        }}
                        placeholder="Email" 
                        multiline={false}
                        returnKeyType={"next"}
                        blurOnSubmit={false}
                        onSubmitEditing={() => pwordTextInputRef.current.focus()}
                    />
                    <Text style={{opacity: emailError ? 1 : 0, color: 'red', marginTop: 5}}>{emailError ? emailError: "hidden"}</Text>
                </View>


                <View style={{width: '100%', marginTop: 6}}>
                    <TextInput 
                        ref={pwordTextInputRef}
                        clearButtonMode={'while-editing'}
                        keyboardType={keyboardType}
                        style={[styles.textInput, pwordError ? {borderColor: 'red', borderWidth: 1} : {borderColor: '#C3C3C3', borderWidth: 0.5}]} 
                        // style={styles.textInput} 
                        // defaultValue={email}
                        autoCorrect={false}
                        onChangeText={(newPassword) => {

                            if(newPassword != null && newPassword != ""){
                                setPwordError(null);
                            }
                            setPassword(newPassword);
                        }}
                        placeholder="Password" 
                        multiline={false}
                        returnKeyType={"next"}
                        blurOnSubmit={false}
                        secureTextEntry={true}
                        onSubmitEditing={() => confirmPwordTextInputRef.current.focus()}
                    />
                    <Text style={{opacity: pwordError ? 1 : 0, color: 'red', marginTop: 5}}>{pwordError ? pwordError: "hidden"}</Text>
                </View>

                <View style={{width: '100%', marginTop: 6}}>
                    <TextInput 
                        ref={confirmPwordTextInputRef}
                        clearButtonMode={'while-editing'}
                        keyboardType={keyboardType}
                        style={[styles.textInput, confirmPwordError ? {borderColor: 'red', borderWidth: 1} : {borderColor: '#C3C3C3', borderWidth: 0.5}]} 
                        // style={styles.textInput} 
                        // defaultValue={email}
                        autoCorrect={false}
                        onChangeText={(newConfirmPword) => {

                            if(newConfirmPword != null && newConfirmPword != ""){
                                setConfirmPwordError(null);
                            }
                            setConfirmPassword(newConfirmPword);
                        }}
                        placeholder="Confirm Password" 
                        multiline={false}
                        secureTextEntry={true}
                    />
                    <Text style={{opacity: confirmPwordError ? 1 : 0, color: 'red', marginTop: 5}}>{confirmPwordError ? confirmPwordError: "hidden"}</Text>
                </View>

                <View style={styles.signInButtonContainer}>
                    <Pressable 
                        style={({pressed}) => [styles.button, {backgroundColor: pressed ? 'gold' : 'gold', borderColor: 'gold', opacity: pressed ? 0.5 : 1}]}
                        onPress={() => {
                            console.log("create account button pressed");
                            handleSubmit();
                        }}
                    >
                        {({pressed}) => (
                            <Text style={[styles.signInButtonText, {color: 'black'}]}>Create Account</Text>
                        )}
                    </Pressable>

                    <View>
                            
                    </View>

                </View>

                <View style={styles.switchToSignInContainer}>
                    
                    <Text style={styles.switchToSignInQuestionText}>Already have an account?</Text>
                    <Pressable 
                            // style={({pressed}) => [styles.button, {opacity: pressed ? 0.5 : 1}]}
                            onPress={() => {
                                console.log("switch to sign in screen button pressed");
                                navigation.replace("Sign in Screen", {prevScreen: 'CreateAccount'});
                            }}
                        >
                            {({pressed}) => (
                                <Text style={[styles.switchToSignInButtonText, {opacity: pressed ? 0.5 : 1}]}>Sign in</Text>
                            )}
                    </Pressable>
                </View>

                
                
            </View>
        </Pressable >
    );
}


const styles = StyleSheet.create({
    screen: {
        flex: 1,
        width: '100%',
        backgroundColor: 'white'
    },
    signInFormContainer: {
        // borderWidth: 1,
        marginHorizontal: 30,
        // alignItems: 'center',
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
        // paddingHorizontal: 30,
        alignItems: 'center',
        width: '100%',
        marginTop: 2
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
        // borderColor: '#D3D3D3',
        paddingLeft: 10,
        paddingVertical: 14, // 18
        borderWidth: 0.5,
        borderRadius: 5,
    },
    switchToSignInContainer: {
        width: '100%',
        // flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 15
    },
    switchToSignInQuestionText: {
        color: 'gray',
        fontSize: 16,
        marginRight: 5
    },
    switchToSignInButtonText: {
        color: '#007bff',
        fontSize: 16
    }
});