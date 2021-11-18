import 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import React, {useCallback, useEffect, useState, useRef, useContext} from 'react';
import { StyleSheet, Button, Text, View, Dimensions, Pressable, Platform, UIManager, Easing, ActivityIndicator } from 'react-native';
import LandmarkMapScreen from './screens/LandmarkMapScreen';
import { NavigationContainer, useNavigationContainerRef } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import AppContext, { AppProvider } from './contexts/AppContext';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Location from 'expo-location';

// import firebase from 'firebase/app';



// import * as firebase from 'firebase';
// import { firestore } from 'firebase'; 
// import { doc, getDoc } from "firebase/firestore";
// import {firebaseConfig} from './firebase-config';
// import CachedImage from 'expo-cached-image';

import BookmarksScreen from './screens/BookmarksScreen';
import LeaveReviewScreen from './screens/LeaveReviewScreen';
import FilterScreen from './screens/FilterScreen';
import AccountScreen from './screens/AccountScreen';
import AdjustLocationScreen from './screens/AdjustLocationScreen';
import ReportIssueScreen from './screens/ReportIssueScreen';
import EditHoursOfOperationScreen from './screens/EditHoursOfOperationScreen';
import LoginToContinuePopup from './screens/LoginToContinuePopup';
import SignInScreen from './screens/SignInScreen';
import SignUpScreen from './screens/SignUpScreen';
import SignInToContinueBottomSheet from './components/SignInToContinueBottomSheet';


import { createStackNavigator, CardStyleInterpolators, TransitionSpecs} from '@react-navigation/stack';
import {HeaderBackButton} from '@react-navigation/elements';

import Firebase from './utils/Firebase';
const db = Firebase.firestore();

const auth = Firebase.auth();

// if(firebase.apps.length === 0){
//   firebase.initializeApp(firebaseConfig);
// }

// const db = firebase.firestore();

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}



export default function App() {

  const Stack = createStackNavigator();

  const [filterQuery, setFilterQuery] = useState({});
  const [location, setLocation] = useState(null);
  const [region, setRegion] = useState(null);
  const [wasLocationPermissionDenied, setWasLocationPermissionDenied] = useState(false);

  const [landmarkUnderEdit, setLandmarkUnderEdit] = useState(null);
  const [curLandmarkHopData, setCurLandmarkHopData] = useState(null);
  const [editedMapLocation, setEditedMapLocation] = useState(null);
  const [selectedLandmark, setSelectedLandmark] = useState(null);

  const [needsToShowReviewScreen, setNeedsToShowReviewScreen] = useState(false);

  const [user, setUser] = useState(null);
  const [isAppWideLoading, setIsAppWideLoading] = useState(false);

  const [bookmarkedLandmarkIds, setBookmarkedLandmarkIds] = useState([]);
  const [cachedBookmarkedLandmarks, setCachedBookmarkedLandmarks] = useState(null);
  const [needsToFetchBookmarks, setNeedsToFetchBookmarks] = useState(false);

  // const [reviewsCache, setReviewsCache] = useState([]);

  const signInToContinueSheetRef = useRef();
  const editHoursOfOppRef = useRef();
  const editMapScreenRef = useRef();
  const filterScreenRef = useRef();
  const bottomSheetModalRef = useRef();

  useEffect(() => {
    
    const unsubscribeAuth = auth.onAuthStateChanged(curUser => {

      setUser(curUser);

      if(curUser){
        console.log(curUser.displayName);
      } else {
        console.log("user is not logged in");
      }

      // try {
      //   await (authenticatedUser ? setUser(authenticatedUser) : setUser(null));
      //   setIsLoading(false);
      // } catch (error) {
      //   console.log(error);
      // }
    });

    return unsubscribeAuth;

  }, []);

  useEffect(() => {

    console.log("in useeffect for bookmarks");

    if(user && user.uid){
      const userBookmarksDocRef = db.collection("bookmarks").doc(user.uid);

      const unsubscribe = userBookmarksDocRef.onSnapshot((updatedDoc) => {

        console.log("new update for bookmarks");
        const updatedDocData = updatedDoc.data();
        if(updatedDocData){
          const updatedBookmarkIds = updatedDocData.bookmarkedLandmarkIds;

          if(updatedBookmarkIds && updatedBookmarkIds.length > 0){
            const newBmIdSet = new Set(updatedBookmarkIds);
            const curBmIdSet = new Set(bookmarkedLandmarkIds);

            if(newBmIdSet.size != curBmIdSet.size || [...newBmIdSet].every(value => curBmIdSet.has(value))){
              console.log("jkfdjsl;kjj");
              setBookmarkedLandmarkIds(updatedBookmarkIds);
              console.log(updatedBookmarkIds);
            } 

          } else {

            if(bookmarkedLandmarkIds.length > 0){
              setBookmarkedLandmarkIds([]);
            }
          }
        } else {
          console.log("no bookmark doc data");
        }
      });

      return unsubscribe;
    } else {
      console.log("doing nothing");
    }

    return;
    
    // const unsubscribe = 

  }, [user]);

  useEffect(() => {

    async function getLocation(){

        console.log("getting user location");

        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
            setWasLocationPermissionDenied(true);
            return;
        }

        const userLocation = await Location.getCurrentPositionAsync({});

        const initialRegion = {
            latitude: userLocation.coords.latitude || 37.78825,
            longitude: userLocation.coords.longitude || -122.4324,
            latitudeDelta: 0.015684156756595513,
            longitudeDelta: 0.008579808767251507,
        };

        setLocation(userLocation);
        setRegion(initialRegion);
    }
    
      getLocation();
    
}, []);


  return (
    <AppProvider value={{filterQuery, setFilterQuery, filterScreenRef, landmarkUnderEdit, setLandmarkUnderEdit, 
                         curLandmarkHopData, setCurLandmarkHopData, editHoursOfOppRef, editMapScreenRef, editedMapLocation, 
                         setEditedMapLocation, location, region, bottomSheetModalRef, signInToContinueSheetRef, user, setUser,
                         isAppWideLoading, setIsAppWideLoading, selectedLandmark, setSelectedLandmark, needsToShowReviewScreen, 
                         setNeedsToShowReviewScreen, bookmarkedLandmarkIds, cachedBookmarkedLandmarks, setCachedBookmarkedLandmarks,
                         needsToFetchBookmarks, setNeedsToFetchBookmarks}}>
      <>
      {location ? 
      (<NavigationContainer>
          <Stack.Navigator
              screenOptions={({route, navigation}) => {
                
                // console.log(route.name);
                // console.log(navigation.getState());
                // if(route.name != "Main App Flow"){

                // }

                return { 
                  safeAreaInsets: { top: 0 },
                  headerStyle: {
                      // backgroundColor: '#202020',
                      // shadowOpacity: 0,
                      // borderBottomColor: '#404040',
                      // borderBottomWidth: 1,
                  },
                  headerTitleStyle: {
                      // color: 'white'
                  },
                  // cardStyleInterpolator: ({ current, next }) => {
                  //   console.log("-------------------------------------");
                  //   console.log("in stack navigator");
                  //   console.log(route.name);
                  //   console.log("-------------------------------------");
                  //   return {};
                  // }
          }
              }}>
            <Stack.Screen
              name="Main App Flow" 
              component={MainAppFlow}
              options={{
                headerShown: false
              }}
            />

            <Stack.Screen 
                name="Filter Screen" 
                component={FilterScreen}
                // ref={backRef}
                ref={filterScreenRef}
                options={{
                    headerBackTitle: "Back",
                    headerBackTitleStyle: {color: "#007bff"},
                    headerLeftContainerStyle: {paddingLeft: 5},
                    headerRight: () => (
                        <Button
                            onPress={() => filterScreenRef.current.resetFilters()}
                            title="Reset"
                            color="#007bff"
                  
                        />
                    ), 
                    headerRightContainerStyle: {paddingRight: 5}
                }}
              />

              <Stack.Screen 
                name="Report Issue" 
                component={ReportIssueNestedStack} 
                options={{ 
                  headerStatusBarHeight: 0,
                  gestureEnabled: false, 
                  headerShown: false, 
                  presentation: 'modal' 
                }} 
              />
                

              <Stack.Screen 
                name="Hours of Operation" 
                component={EditHoursOfOperationScreen} 
                options={{ 
                  presentation: 'modal', 
                  gestureEnabled: false,
                  headerBackImage: () => <></>,
                  headerBackTitle: "Cancel",
                  headerBackTitleStyle: {marginLeft: 20},
                  headerRight: () => (
                    <Pressable 
                        style={{paddingRight: 20}}
                        onPress={() => {
                            console.log("Submit hours button pressed");
                            editHoursOfOppRef.current.addEditedHoursOfOpp();

                        }}
                    >
                        {({ pressed }) => (
                            <Text style={{opacity: pressed ? 0.25 : 1, elevation: 3, fontWeight: '600', color: "#007bff", fontSize: 17}}>
                                Add
                            </Text>
                        )}             
                    </Pressable>
                  ), 
                  // headerRightContainerStyle: {paddingRight: 20}
                }} 
              />

              
              <Stack.Screen 
                name="Login modal" 
                component={LoginToContinuePopup} 
                options={{ 
                  headerStatusBarHeight: 0,
                  gestureEnabled: false, 
                  headerShown: false, 
                  presentation: 'transparentModal',
                  cardOverlayEnabled: false,
                  cardStyle: {
                    backgroundColor: 'transparent',
                    opacity: 0.99
                  }
                }} 
              />


              <Stack.Screen 
                name="Sign in Screen" 
                component={SignInScreen}
                options={({navigation, route}) => ({
                    headerBackTitle: "Account",
                    // headerBackTitleStyle: {color: "#007bff"},
                    headerLeftContainerStyle: {paddingLeft: 5},
                    headerLeft: (props) => (
                      <HeaderBackButton
                      {...props}
                      onPress={() => {
                          navigation.setOptions({
                            cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS, 
                            transitionSpec: {
                              open: TransitionSpecs.TransitionIOSSpec,
                              close: TransitionSpecs.TransitionIOSSpec,
                            }
                          });

                          setTimeout(() => {
                            console.log("here");
                            navigation.goBack();
                          }, 10);

                      }}
                    />

                  ), 
                  headerLeftContainerStyle: {paddingLeft: 5},
                })}
              />
              
              <Stack.Screen 
                name="Create Account Screen" 
                component={SignUpScreen}
                options={({navigation}) => ({
                    headerBackTitle: "Account",
                    headerBackTitleStyle: {color: "#007bff"},
                    headerLeftContainerStyle: {paddingLeft: 5},
            
                    headerLeft: (props) => (
                      <HeaderBackButton
                        {...props}
                        onPress={() => {
                          
                            navigation.setOptions({
                              cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS, 
                              transitionSpec: {
                                open: TransitionSpecs.TransitionIOSSpec,
                                close: TransitionSpecs.TransitionIOSSpec,
                              }
                            });

                            setTimeout(() => {
                              console.log("here");
                              navigation.goBack();
                            }, 10);

                        }}
                      />

                      // <Button
                      //     onPress={() => {
                      //       navigation.setOptions({
                      //         cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS, 
                      //         transitionSpec: {
                      //           open: TransitionSpecs.TransitionIOSSpec,
                      //           close: TransitionSpecs.TransitionIOSSpec,
                      //         }
                      //       });

                      //       setTimeout(() => {
                      //         console.log("here");
                      //         navigation.goBack();
                      //       }, 10);

                      //       // navigation.goBack();
                      //     }}
                      //     title={"Back"}
                      //     color="#007bff"
                      // />
                    )
                })}
              />

      
              <Stack.Screen 
                name="Leave Review" 
                component={LeaveReviewScreen} 
                options={({navigation}) => ({ 
                  presentation: 'modal', 
                  gestureEnabled: false,
                  headerBackImage: () => <></>,
                  headerBackTitle: "Cancel",
                  headerBackTitleStyle: {marginLeft: 20},
                  // headerRight: () => (
                  //   <Pressable 
                  //       style={{paddingRight: 20}}
                  //       onPress={() => {
                  //           console.log("Submit hours button pressed");
                  //           navigation.goBack();
                  //           // editHoursOfOppRef.current.addEditedHoursOfOpp();
                  //       }}
                  //   >
                  //       {({ pressed }) => (
                  //           <Text style={{opacity: pressed ? 0.25 : 1, elevation: 3, fontWeight: '600', color: "#007bff", fontSize: 17}}>
                  //               Submit
                  //           </Text>
                  //       )}             
                  //   </Pressable>
                  // ), 
                  // headerRightContainerStyle: {paddingRight: 20}
                })} 
              />  


              <Stack.Screen 
                name="Bookmark Map View" 
                component={BookmarkMapView} 
                options={({navigation}) => ({ 
                  // headerBackImage: () => <></>,
                  headerBackTitle: "Back",
                  // headerBackTitleStyle: {marginLeft: 20},
                })} 
              /> 


          </Stack.Navigator>
          <StatusBar style="dark" />
      </NavigationContainer>)

        : (<View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
            {wasLocationPermissionDenied ?
              <Text>Location Permission was denied</Text> :
              <Text>Loading</Text>
            }
            </View>
          )
      }
      { isAppWideLoading &&
      <>
        <View style={{backgroundColor: 'black', opacity: 0.1, position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, alignItems: 'center', justifyContent: 'center'}}/>
        <View style={{flex: 1, backgroundColor: 'transparent', position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, alignItems: 'center', justifyContent: 'center'}}>
          <View style={{width: 120, height: 120, backgroundColor: 'transparent', alignItems: 'center', justifyContent: 'center', borderRadius: 10}}>
            <ActivityIndicator size='large'/> 
          </View>
        </View>
      </>
      }
      </>
    </AppProvider>
  );
}

function MainAppFlow({navigation}){

  const Tab = createBottomTabNavigator();

  const {signInToContinueSheetRef} = useContext(AppContext);

  return (
    <>
    <Tab.Navigator 
      screenOptions={{
        tabBarStyle: { 
          // backgroundColor: '#202020',
          // borderTopColor: '#404040',
          // borderTopWidth: 1,

        },
      }}>
      <Tab.Screen 
          name="Search" 
          component={LandmarkMapScreen} 
          options={{
            headerShown: false,
            tabBarLabel: "Search",
            tabBarIcon: ({ focused }) => (
              <Ionicons name={focused ? "search" : "search-outline"} size={24} color="black" />
            ),
            tabBarActiveTintColor: "black"
          }}
      />
      <Tab.Screen 
          name="Saved Landmarks" 
          component={BookmarksScreen} 
          options={{
            tabBarLabel: "Saved Landmarks",
            tabBarIcon: ({ focused }) => (
              <Ionicons name={focused ? "bookmarks" : "bookmarks-outline"} size={24} color="black" />
              // <MaterialCommunityIcons name={focused ? "account" : "account-outline"} size={24} color="black" />
            ),
            tabBarActiveTintColor: "black"
          }}
      />
      <Tab.Screen 
          name="Account" 
          component={AccountScreen} 
          options={{
            tabBarLabel: "Account",
            tabBarIcon: ({ focused }) => (
              <Ionicons name={focused ? "person" : "person-outline"} size={24} color="black" />
            ),
            tabBarActiveTintColor: "black"
          }}
      />
  </Tab.Navigator>
    
    <SignInToContinueBottomSheet navigation={navigation} signInToContinueSheetRef={signInToContinueSheetRef}/>

  </>
  );

}


function BookmarkMapView({navigation}){
  return (
    <View style={{flex: 1, justifyContent:'center', alignItems: 'center'}}>
      <Text>Here</Text>
    </View>
  );
}

// function  TestLoginModal({navigation}){

//   return (
//     <View opacity={1} style={{flex: 1, backgroundColor: 'transparent', justifyContent: 'flex-end'}}>
//         <Pressable style={{backgroundColor: 'black', flexGrow: 1, width: '100%', opacity: 0.2}}
//           onPress={() => navigation.goBack()}
//         >
//         </Pressable>
//         <View style={{backgroundColor: 'red', height: '40%', width: '80%', borderRadius: 25, borderWidth: 1}}>
//       </View>
//     </View>
//   )
// }

// function  TestLoginModal({navigation}){

//   return (
//     <View opacity={1} style={{flex: 1, backgroundColor: 'transparent', justifyContent: 'flex-end'}}>
//       <Pressable 
//         style={{backgroundColor: 'black', flexGrow: 1, width: '100%', opacity: 0.2}}
//         onPress={() => navigation.goBack()} 
//       />
//       <View style={{flex: 1, alignItems: 'center', backgroundColor: 'white', position: 'absolute', top: Dimensions.get("window").height * 0.6, bottom: 0, left: 0, right: 0, borderRadius: 15 }}>
        
//         <View style={{width: '100%', marginTop: 25}}>
//           <Text style={{textAlign: 'center', fontSize: 18}}>Create an account or log in to leave a review</Text>
//         </View>

//         <View style={styles.loginButtonsContainer}>

//                 <Pressable 
//                     style={({pressed}) => [styles.button, {backgroundColor: pressed ? 'gold' : 'gold', borderColor: 'gold', opacity: pressed ? 0.5 : 1}]}
//                     onPress={() => console.log("sign in button pressed")}
//                 >
//                     {({pressed}) => (
//                         <Text style={[styles.signInButtonText, {color: 'black'}]}>Sign In</Text>
//                     )}
//                 </Pressable>

//                 <Pressable 
//                     style={({pressed}) => [styles.button, {backgroundColor: pressed ? 'black' : 'black', borderColor: 'black', opacity: pressed ? 0.5 : 1}]}
//                     onPress={() => console.log("create account button pressed")}
//                 >
//                     {({pressed}) => (
//                         <Text style={[styles.createAccountButtonText,{color: 'white'}]}>Create Account</Text>
//                     )}
//                 </Pressable>


//                 <View>
                    
//                 </View>

//             </View>

        
//       </View>
//     </View>
//   )
// }

// export default function App() {

//   const Tab = createBottomTabNavigator();
  
//   const [docData, setDocData] = useState(null);
//   // const [imgUrl, setImgUrl] = useState(null);


//   // useEffect(() => {

//   //   (async () => {

//   //     const storageRef = firebase.storage().ref();
//   //     const fileRef = storageRef.child("IMG_2818.jpg");
//   //     const url = await fileRef.getDownloadURL();
//   //     console.log(url);

//   //     setImgUrl(url);

//   //     const doc = await firebase.firestore().collection("landmark_locations_data").doc("jCE0NA1qmArZ4HLHNjOe").get();

//   //     if(doc.exists){
//   //       console.log(doc.data());
//   //       setDocData(doc.data());
//   //     } else {
//   //       console.log("doc doesnt exist");
//   //     }

//   //   })();

//   // }, []);


//   // return (

//   //   <>
//   //     {imgUrl ?

//   //       <View style={styles.container}>

//   //         <CachedImage 
//   //           source={{ uri: imgUrl }}
//   //           cacheKey={`img_test`}
//   //           resizeMode="contain"
//   //           style={
//   //             styles.imageContainer
//   //           }
//   //         />

//   //       </View>
          
      
//   //     : <View><Text style={styles.paragraph}>Loading</Text></View>}
//   //   </>


//   // );

//   return (
//     <AppProvider>
//       <NavigationContainer>
        

//         <Tab.Navigator 
//           screenOptions={{
//             tabBarStyle: { 
//               // backgroundColor: '#202020',
//               // borderTopColor: '#404040',
//               // borderTopWidth: 1,
    
//             },
//           }}>
//           <Tab.Screen 
//               name="Search" 
//               component={LandmarkMapScreen} 
//               options={{
//                 headerShown: false,
//                 tabBarLabel: "Search",
//                 tabBarIcon: ({ focused }) => (
//                   <Ionicons name={focused ? "search" : "search-outline"} size={24} color="black" />
//                 ),
//                 tabBarActiveTintColor: "black"
//               }}
//           />
//           <Tab.Screen 
//               name="Saved Landmarks" 
//               component={TestStackScreen} 
//               options={{
//                 tabBarLabel: "Saved Landmarks",
//                 tabBarIcon: ({ focused }) => (
//                   <Ionicons name={focused ? "bookmarks" : "bookmarks-outline"} size={24} color="black" />
//                   // <MaterialCommunityIcons name={focused ? "account" : "account-outline"} size={24} color="black" />
//                 ),
//                 tabBarActiveTintColor: "black"
//               }}
//           />
//           <Tab.Screen 
//               name="Account" 
//               component={TestStackScreen} 
//               options={{
//                 tabBarLabel: "Account",
//                 tabBarIcon: ({ focused }) => (
//                   <Ionicons name={focused ? "person" : "person-outline"} size={24} color="black" />
//                 ),
//                 tabBarActiveTintColor: "black"
//               }}
//           />
//         </Tab.Navigator>
        
//         <StatusBar style="dark" />
//       </NavigationContainer>
//     </AppProvider>
//   );
// }

function TestStackScreen(){

  return (
    <View style={styles.container}>
     <Text>
        Second screen
      </Text> 
    </View>
  );
}


function ReportIssueNestedStack({navigation}){

  const Stack = createStackNavigator();

  const {editMapScreenRef} = useContext(AppContext);

  return (
    <Stack.Navigator>
      <Stack.Screen 
          name="Edit Bathroom Details" 
          component={ReportIssueScreen} 
          options={{ 
            headerStatusBarHeight: 0,
            // cardOverlayEnabled: true,
            cardStyle: {
              backgroundColor: 'transparent',
              // opacity:0.99
              // height: 400
            },
            cardStyleInterpolator: ({ current: { progress } }) => ({
              cardStyle: {
                opacity: progress.interpolate({
                  inputRange: [0, 0.5, 0.9, 1],
                  outputRange: [0, 0.25, 0.7, 1],
                }),
            }}),
            presentation: 'transparentModal', 
            gestureEnabled: false,
            // headerShown: false,
            headerBackImage: () => <></>,
            headerStyle: {backgroundColor: 'transparent'},
            headerBackTitle: "Cancel",
            headerBackTitleStyle: {marginLeft: 20},
            headerRight: () => (
              // <Button
              //     onPress={() => console.log("Here")}
              //     title="Submit"
              //     color="#007bff"
                
              // />
              <Pressable 
                  disabled={true}
                  onPress={() => {
                      console.log("Submit button pressed");
                  }}
              >
                  {({ pressed }) => (
                      <Text style={{opacity: pressed ? 0.25 : 1, elevation: 3, fontWeight: '600', color: "#007bff", fontSize: 17}}>
                          Submit
                      </Text>
                  )}
                              
              </Pressable>
            ), 
            headerRightContainerStyle: {paddingRight: 20}
          }} 
      />

      <Stack.Screen 
          name="Edit Location" 
          component={AdjustLocationScreen} 
          options={{ 
            gestureEnabled: false, 
            headerBackTitle: "Edit Details", 
            headerRight: () => (
              <Pressable 
                  style={{paddingRight: 20}}
                  onPress={() => {
                      console.log("Map Location Edit Submit button pressed");
                      editMapScreenRef.current.setEditedLocation();
                  }}
              >
                  {({ pressed }) => (
                      <Text style={{opacity: pressed ? 0.25 : 1, elevation: 3, fontWeight: '600', color: "#007bff", fontSize: 17}}>
                          Done
                      </Text>
                  )}             
              </Pressable>
            ), 
            // headerRightContainerStyle: {paddingRight: 20}
          }} />
        
    </Stack.Navigator>
  );
}

// function ModalScreen({ navigation }) {

//   return (
//     <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
//       <Text style={{ fontSize: 30 }}>This is a modal</Text>
//       <Button onPress={() => navigation.navigate("Edit Location")} title="Go to 2nd modal" />
//       <Button onPress={() => navigation.navigate("MyModal3")} title="Go to 3rd modal" />
//       <Button onPress={() => navigation.goBack()} title="Dismiss" />
//     </View>
//   );
// }

// function MyModal2({ navigation }) {
//   return (
//     <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
//       <Text style={{ fontSize: 30 }}>This is a modal 2</Text>
//       <Button onPress={() => navigation.goBack()} title="Dismiss" />
//     </View>
//   );
// }


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageContainer: {
    flex: 1,
    width: Dimensions.get('window').width / 2,
  }
});
