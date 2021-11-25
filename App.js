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

import AppLoading from 'expo-app-loading';
// import firebase from 'firebase/app';



// import * as firebase from 'firebase';
// import { firestore } from 'firebase'; 
// import { doc, getDoc } from "firebase/firestore";
// import {firebaseConfig} from './firebase-config';
// import CachedImage from 'expo-cached-image';

// import BookmarksScreen from './screens/BookmarksScreen';
import ViewOnMapScreen from './screens/ViewOnMapScreen';
import BookmarksTab from './screens/BookmarksTab';

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

import ReportIssueStackContext, {ReportIssueStackProvider} from './contexts/ReportIssueStackContext';

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

  const [isAppReady, setIsAppReady] = useState(false);

  const [filterQuery, setFilterQuery] = useState({});
  const [location, setLocation] = useState(null);
  const [region, setRegion] = useState(null);
  const [wasLocationPermissionDenied, setWasLocationPermissionDenied] = useState(false);

  const [landmarkUnderEdit, setLandmarkUnderEdit] = useState(null);
  const [curLandmarkHopData, setCurLandmarkHopData] = useState(null);
  const [editedMapLocation, setEditedMapLocation] = useState(null);
  const [selectedLandmark, setSelectedLandmark] = useState(null);
  const [selectedBookmarkedLandmark, setSelectedBookmarkedLandmark] = useState(null);

  const [needsToShowReviewScreen, setNeedsToShowReviewScreen] = useState(false);
  const [didComeFromReviewButtonPress, setDidComeFromReviewButtonPress] = useState(false);

  const [user, setUser] = useState(null);
  const [isAppWideLoading, setIsAppWideLoading] = useState(false);

  const [bookmarkedLandmarkIds, setBookmarkedLandmarkIds] = useState([]);
  const [cachedBookmarkedLandmarks, setCachedBookmarkedLandmarks] = useState(null);
  const [needsToFetchBookmarks, setNeedsToFetchBookmarks] = useState(false);

  // const [reviewsCache, setReviewsCache] = useState([]);

  const signInToContinueSheetRef = useRef();
  const editHoursOfOppRef = useRef();
  const reportIssueScreenRef = useRef();
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

    });

    return unsubscribeAuth;

  }, []);

  // useEffect(() => {

  //   console.log("bookmark ids changed: ", bookmarkedLandmarkIds);

  // }, [bookmarkedLandmarkIds]);

  useEffect(() => {

    // console.log("in useeffect for bookmarks");

    if(user && user.uid){
      const userBookmarksDocRef = db.collection("bookmarks").doc(user.uid);

      const unsubscribe = userBookmarksDocRef.onSnapshot((updatedDoc) => {

        // console.log("new update for bookmarks");
        const updatedDocData = updatedDoc.data();
        if(updatedDocData){
          const updatedBookmarkIds = updatedDocData.bookmarkedLandmarkIds;

          if(updatedBookmarkIds && updatedBookmarkIds.length > 0){
            const newBmIdSet = new Set(updatedBookmarkIds);
            const curBmIdSet = new Set(bookmarkedLandmarkIds);

            if(newBmIdSet.size != curBmIdSet.size || !([...newBmIdSet].every(value => curBmIdSet.has(value)))){
              // console.log("jkfdjsl;kjj");
              // console.log(updatedBookmarkIds);
              setBookmarkedLandmarkIds(updatedBookmarkIds);
              
            } else {
              // console.log("&&&&&&&&&&&&& in here for some reason &&&&&&&&&&&&");
            }

          } else {
            // console.log("----------------- right before if ---------------");
            // console.log("bmlIDs: ", bookmarkedLandmarkIds);
            // console.log("cachedBmlIDs: ", cachedBookmarkedLandmarks);
            // console.log("--------------------------------------------------");
            setBookmarkedLandmarkIds([]);
            // if(bookmarkedLandmarkIds.length > 0){
            //   console.log("############ in if ################");
            //   setBookmarkedLandmarkIds([]);
            // }
          }
        } else {
          console.log("no bookmark doc data");
        }
      });

      return unsubscribe;
    } else {
      console.log("doing nothing");
      return;
    }

  }, [user]);

//   useEffect(() => {

//     async function getLocation(){

//         console.log("getting user location");

//         let { status } = await Location.requestForegroundPermissionsAsync();
//         if (status !== 'granted') {
//             setWasLocationPermissionDenied(true);
//             return;
//         }

//         const userLocation = await Location.getCurrentPositionAsync({});

//         const initialRegion = {
//             latitude: userLocation.coords.latitude || 37.78825,
//             longitude: userLocation.coords.longitude || -122.4324,
//             latitudeDelta: 0.015684156756595513,
//             longitudeDelta: 0.008579808767251507,
//         };

//         setLocation(userLocation);
//         setRegion(initialRegion);
//     }
    
//       getLocation();
    
// }, []);

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


  return (
    <AppProvider value={{filterQuery, setFilterQuery, filterScreenRef, landmarkUnderEdit, setLandmarkUnderEdit, 
                         curLandmarkHopData, setCurLandmarkHopData, editHoursOfOppRef, editMapScreenRef, editedMapLocation, 
                         setEditedMapLocation, location, region, bottomSheetModalRef, signInToContinueSheetRef, user, setUser,
                         isAppWideLoading, setIsAppWideLoading, selectedLandmark, setSelectedLandmark, needsToShowReviewScreen, 
                         setNeedsToShowReviewScreen, bookmarkedLandmarkIds, cachedBookmarkedLandmarks, setCachedBookmarkedLandmarks,
                         needsToFetchBookmarks, setNeedsToFetchBookmarks, reportIssueScreenRef, selectedBookmarkedLandmark, 
                         setSelectedBookmarkedLandmark, didComeFromReviewButtonPress, setDidComeFromReviewButtonPress}}>
      <>
      {location && isAppReady ? 
      (<NavigationContainer>
          <Stack.Navigator
              screenOptions={({route, navigation}) => {
                

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
                    headerBackTitle: "Back",
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
                    headerBackTitle: "Back",
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
                              navigation.goBack();
                            }, 10);

                        }}
                      />
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
                })} 
              />  


              <Stack.Screen 
                name="Bookmark Map View" 
                component={ViewOnMapScreen} 
                options={({navigation}) => ({ 
                  // headerBackImage: () => <></>,
                  headerBackTitle: "Back",
                  // headerBackTitleStyle: {marginLeft: 20},
                })} 
              /> 


          </Stack.Navigator>
          <StatusBar style="dark" />
      </NavigationContainer>)

        : 
        // (<View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        //     {wasLocationPermissionDenied ?
        //       <Text>Location Permission was denied</Text> :
        //       <Text>Loading</Text>
        //     }
        //     </View>
        //   )
        (<>
          {wasLocationPermissionDenied ? (
            <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
              <Text>Location Permission was denied</Text> :
            </View>
          ) : (
          <AppLoading
            startAsync={getLocation}
            onFinish={() => setIsAppReady(true)}
            onError={() => {
              console.warn("error getting location");
            }}
          />
          )
          } 
        
        </>)
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
          component={BookmarksTab} 
          options={{
            // title: "Saved Bathrooms",
            headerShown: false,
            tabBarLabel: "Saved",
            tabBarIcon: ({ focused }) => (
              <Ionicons name={focused ? "bookmarks" : "bookmarks-outline"} size={24} color="black" />
              // <MaterialCommunityIcons name={focused ? "account" : "account-outline"} size={24} color="black" />
            ),
            tabBarActiveTintColor: "black"
          }}
      />
      {/* <Tab.Screen 
          name="Saved Landmarks" 
          component={BookmarksScreen} 
          options={{
            title: "Saved Bathrooms",
            tabBarLabel: "Saved",
            tabBarIcon: ({ focused }) => (
              <Ionicons name={focused ? "bookmarks" : "bookmarks-outline"} size={24} color="black" />
              // <MaterialCommunityIcons name={focused ? "account" : "account-outline"} size={24} color="black" />
            ),
            tabBarActiveTintColor: "black"
          }}
      /> */}
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



function ReportIssueNestedStack({navigation}){

  const Stack = createStackNavigator();

  const {editMapScreenRef, reportIssueScreenRef} = useContext(AppContext);

  const [isReportIssueSubmitDisabled, setIsReportIssueSubmitDisabled] = useState(true);


  const [hasNameBeenEdited, setHasNameBeenEdited] = useState(false);
  const [hasLocationBeenEdited, setHasLocationBeenEdited] = useState(false);
  const [hasHopBeenEdited, setHasHopBeenEdited] = useState(false);

  // useEffect(() => {
  //   console.log("report issue nested stack mounted");
  // }, []);

  useEffect(() => {
    if(hasNameBeenEdited || hasLocationBeenEdited || hasHopBeenEdited){
      setIsReportIssueSubmitDisabled(false);
    } else {
      setIsReportIssueSubmitDisabled(true);
    }

  },[hasNameBeenEdited, hasLocationBeenEdited, hasHopBeenEdited]);


  return (
    <ReportIssueStackProvider value={{setHasNameBeenEdited, setHasLocationBeenEdited, setHasHopBeenEdited}}>
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
                  disabled={isReportIssueSubmitDisabled}
                  onPress={() => {
                      console.log("Report issue submit button pressed");
                      reportIssueScreenRef.current.submitLandmarkIssue();
                  }}
              >
                  {({ pressed }) => (
                      <Text style={{opacity: pressed || isReportIssueSubmitDisabled  ? 0.25 : 1, elevation: 3, fontWeight: '600', color: isReportIssueSubmitDisabled ? "gray": "#007bff", fontSize: 17}}>
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
    </ReportIssueStackProvider>
  );
}


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