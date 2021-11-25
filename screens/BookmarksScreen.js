import React, { useState, useEffect, useRef, useContext } from 'react';
import { StyleSheet, Text, View, Dimensions, SafeAreaView, StatusBar, FlatList, ActivityIndicator, Pressable, LayoutAnimation} from 'react-native';
import LandmarkMapContext from '../contexts/LandmarkMapContext';
import AppContext from '../contexts/AppContext';
// import { useFocusEffect } from '@react-navigation/native';
// import CachedImage from 'expo-cached-image';
import * as Haptics from 'expo-haptics';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import BathroomListItem from '../components/BathroomListItem';

// import firebase from 'firebase/app';
// import 'firebase/firestore';

import firebase from 'firebase/app';
import 'firebase/firestore';
import Firebase from '../utils/Firebase';
// const db = Firebase.firestore();
// import Firebase from '../utils/Firebase';

const db = Firebase.firestore();

export default function BookmarksScreen({navigation}){

    const {user, setSelectedBookmarkedLandmark, cachedBookmarkedLandmarks, setCachedBookmarkedLandmarks, bookmarkedLandmarkIds, setIsAppWideLoading} = useContext(AppContext);

    const [isFetchingBookmarks, setIsFetchingBookmarks] = useState(false);

    const handleListItemPress = (index) => {
        setSelectedBookmarkedLandmark(cachedBookmarkedLandmarks[index]);
        navigation.navigate("Bookmarked Details View");
    }


    // const handleToggleBookmark = (isBookmarked, landmark, useRemoveBookmarkAnimation) => {

    //     const newIsBookmarked = !isBookmarked;
  
    //     Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  
    //     if(user && landmark && landmark.id){
    //       const userBookmarkDocRef = db.collection("bookmarks").doc(user.uid);
  
    //       if(useRemoveBookmarkAnimation && !newIsBookmarked){
    //         console.log(".............gonna use animationnnnnnnnn........");
    //         LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    //         // LayoutAnimation.configureNext(
    //         //   LayoutAnimation.create(
    //         //     500,
    //         //     LayoutAnimation.Types.linear,
    //         //     LayoutAnimation.Properties.scaleY
    //         //   )
    //         // );
    //       }
  
    //     //   setIsBookmarked(newIsBookmarked);
  
    //       userBookmarkDocRef.set({
    //         bookmarkedLandmarkIds: newIsBookmarked ? firebase.firestore.FieldValue.arrayUnion(landmark.id) : firebase.firestore.FieldValue.arrayRemove(landmark.id)
    //       }, { merge: true })
    //       .then(() => {
    //         console.log("Bookmarks updated successfully");
    //       })
    //       .catch((error) => {
    //           console.error("Error updating bookmark ", error);
    //       });
    //     }
    //     else {
    //       console.log("nothing happening");
    //     }
        
    //   };





    useEffect(() => {

        console.log("bm useeffect");

        if(!user || !user.uid){
            return;
        }

        if(!bookmarkedLandmarkIds || bookmarkedLandmarkIds.length == 0){
            console.log("righttttttttt.................");
            setCachedBookmarkedLandmarks(null);
            return;
        }

        async function getUpdateCachedBookmarks(){

            let idsNotInCache = [];

            if(cachedBookmarkedLandmarks){
                const cacheIds = cachedBookmarkedLandmarks.map(bm => bm.id);
                idsNotInCache = bookmarkedLandmarkIds.filter(bid => !cacheIds.includes(bid));
            } else {
                idsNotInCache = [...bookmarkedLandmarkIds];
            }
            

            // we need to fetch the other bookmarks from db
            if(idsNotInCache && idsNotInCache.length > 0){

                const landmarksRef = db.collection("landmark_locations_data");

                // setIsAppWideLoading(true);
                setIsFetchingBookmarks(true);

                try {

                    const querySnapshot = await landmarksRef.where("id", "in", idsNotInCache).get();

                    if(querySnapshot.empty){
                        console.log("no bookmarked landmarks found");
                        setCachedBookmarkedLandmarks([]);
                        
                    } else {
                        const newlyFetchedBookmarkedLandmarks = querySnapshot.docs.map(doc => doc.data());
        
                        console.log("adding ", newlyFetchedBookmarkedLandmarks.length, " bookmarks to cache!");
        
                        if(cachedBookmarkedLandmarks){
                            console.log("%%%%%%%%%%%%%%%%%%%");
                            setCachedBookmarkedLandmarks(cachedBookmarkedLandmarks.filter(cbl => bookmarkedLandmarkIds.includes(cbl.id)).concat(newlyFetchedBookmarkedLandmarks));
                        } else {
                            console.log("!!!!!!!!!!!!!!!!!!!!!");
                            setCachedBookmarkedLandmarks(newlyFetchedBookmarkedLandmarks);
                        }
                    }

                    // setIsAppWideLoading(false);
                    setIsFetchingBookmarks(false);

                } catch(error){
                    console.log("error getting landmarks for bookmarks", error);
                    setIsFetchingBookmarks(false);
                }  
                
            } else {
                
                setCachedBookmarkedLandmarks(cachedBookmarkedLandmarks.filter(cbl => bookmarkedLandmarkIds.includes(cbl.id)));

                console.log("we already have all the landmarks we need for bookmarks");
            }
        }

        getUpdateCachedBookmarks();

    }, [bookmarkedLandmarkIds]);

    return (
        <>
        {user && user.uid ?
        
            (<SafeAreaView style={styles.screen}>
                <FlatList
                    style={{width: '100%', flex: 1}}
                    // ItemSeparatorComponent={() => <View style={styles.listItemSeparator} />}
                    contentContainerStyle={{flexGrow: 1, borderTopWidth: 1, borderBottomWidth: 0, borderColor: '#C8C8C8'}}
                    // ListHeaderComponent={<LandmarkDetailScreenHeader selectedLandmark={selectedLandmark} setModalVisible={setModalVisible} navigation={navigation} />}
                    ListHeaderComponentStyle={styles.headerComponentStyle} // cachedBookmarkedLandmarks != null  landmarks={cachedBookmarkedLandmarks}
                    ListEmptyComponent={ isFetchingBookmarks ? <LoadingBookmarksView /> : <NoBookmarksView /> }
                    data={cachedBookmarkedLandmarks}
                    renderItem={({item, index}) => (
                        <Pressable style={[styles.bathroomItemContainer, {marginTop: index == 0 ? 0 : 20, borderTopWidth: index == 0 ? 0: 1}]} onPress={() => handleListItemPress(index)}>
                            <BathroomListItem navigation={navigation} landmark={item} useRemoveBookmarkAnimation={true} />
                            <Pressable 
                                style={({pressed}) => [styles.viewOnMapButton, {backgroundColor: pressed ? "#D0D0D0" : 'white'}]}
                                onPress={() => {
                                    setSelectedBookmarkedLandmark(cachedBookmarkedLandmarks[index]);
                                    navigation.navigate("Bookmark Map View");
                                }}
                            >
                                <Text style={styles.viewOnMapButtonText}>View on map</Text>
                            </Pressable>
                        </Pressable>
                    )}
                />    
            </SafeAreaView>) :

            <View style={{flexGrow: 1, justifyContent: 'center', alignItems: 'center', borderWidth: 0}}>
                <Text style={{fontSize: 17, fontWeight: '600', color: '#484848'}}>You must be signed in to view bookmarks</Text>
            </View>
        }
        </>
        

    );
}



function NoBookmarksView(){
    return (
        <View style={{flexGrow: 1, justifyContent: 'center', alignItems: 'center', borderWidth: 0}}>
            <Text style={{fontSize: 18, fontWeight: '600', color: '#484848'}}>No Saved bathrooms found.</Text>
            <Text style={{fontSize: 16, fontWeight: '400', color: '#696969', textAlign: 'center', marginHorizontal: 20, marginTop: 10}}>
                Tap the bookmark icon on a bathroom to add it to your saved bathrooms list.
            </Text>
        </View>
    );
}

function LoadingBookmarksView(){
    return (
        <View style={{flexGrow: 1, justifyContent: 'center', alignItems: 'center'}}>
            {/* <ActivityIndicator animating={landmarks == null} /> */}
            <ActivityIndicator animating={true}/>
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
    },
    headerComponentStyle: {
        width: '100%',
        flex: 1
    },
    bathroomItemContainer: {
        flex: 1,
        borderTopColor: '#C8C8C8',
        borderTopWidth: 1,
        borderBottomColor: '#C8C8C8',
        borderBottomWidth: 1,
    },
    listItemSeparator: {
        borderTopColor: '#C8C8C8',
        borderTopWidth: 1,
        marginTop: 20
    },
    viewOnMapButton: {
        width: '100%',
        paddingVertical: 10,
        borderTopColor: '#C8C8C8',
        borderTopWidth: 1,
        paddingLeft: 10
    },
    viewOnMapButtonText: {
        fontSize: 16,
        fontWeight: 'normal',
        color: '#007bff'
    }
});


