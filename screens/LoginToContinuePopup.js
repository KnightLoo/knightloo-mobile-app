import React, {useEffect, useState, useRef, useContext, forwardRef, useImperativeHandle} from 'react';
import { StyleSheet, Button, Text, View, Dimensions, Pressable } from 'react-native';
import AppContext from '../contexts/AppContext';


export default function LoginToContinuePopup({navigation}){

    return (
      <View opacity={1} style={{flex: 1, backgroundColor: 'transparent', justifyContent: 'flex-end'}}>
        <Pressable 
          style={{backgroundColor: 'black', flexGrow: 1, width: '100%', opacity: 0.2}}
          onPress={() => navigation.goBack()} 
        />
        <View style={{flex: 1, alignItems: 'center', width: '100%', backgroundColor: 'white', position: 'absolute', top: Dimensions.get("window").height * 0.7, bottom: 0, left: 0, right: 0, borderRadius: 15 }}>
          
          <View style={{width: '100%', marginTop: 25}}>
            <Text style={{textAlign: 'center', fontSize: 18, fontWeight: '500'}}>Create an account or log in to leave a review</Text>
          </View>
  
          <View style={styles.loginButtonsContainer}>
  
                  <Pressable 
                      style={({pressed}) => [styles.button, {backgroundColor: pressed ? 'gold' : 'gold', borderColor: 'gold', opacity: pressed ? 0.5 : 1}]}
                      onPress={() => {
                        console.log("sign in button pressed");
                        navigation.navigate("Sign in Screen");
                    }}
                  >
                      {({pressed}) => (
                          <Text style={[styles.signInButtonText, {color: 'black'}]}>Sign In</Text>
                      )}
                  </Pressable>
  
                  <Pressable 
                      style={({pressed}) => [styles.button, {backgroundColor: pressed ? 'black' : 'black', borderColor: 'black', opacity: pressed ? 0.5 : 1}]}
                      onPress={() => console.log("create account button pressed")}
                  >
                      {({pressed}) => (
                          <Text style={[styles.createAccountButtonText,{color: 'white'}]}>Create Account</Text>
                      )}
                  </Pressable>
  
  
                  <View>
                      
                  </View>
  
              </View>
  
          
        </View>
      </View>
    )
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