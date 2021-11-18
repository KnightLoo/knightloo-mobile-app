import React, { useState, useEffect, useRef, useContext } from 'react';
import { StyleSheet, Text, View, Dimensions, SafeAreaView, StatusBar, FlatList, ActivityIndicator, Pressable} from 'react-native';
import LandmarkMapContext from '../contexts/LandmarkMapContext';
import AppContext from '../contexts/AppContext';
// import { useFocusEffect } from '@react-navigation/native';
// import CachedImage from 'expo-cached-image';
import * as Haptics from 'expo-haptics';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import BathroomListItem from '../components/BathroomListItem';

// import firebase from 'firebase/app';
// import 'firebase/firestore';
import Firebase from '../utils/Firebase';

const db = Firebase.firestore();

export default function BookmarksScreen({navigation}){

    const {user, setSelectedLandmark, cachedBookmarkedLandmarks, setCachedBookmarkedLandmarks, bookmarkedLandmarkIds, setIsAppWideLoading} = useContext(AppContext);


    const handleListItemPress = (index) => {
        setSelectedLandmark(cachedBookmarkedLandmarks[index]);
        navigation.navigate("Details View");
    }


    useEffect(() => {

        console.log("bm useeffect");

        if(!user || !user.uid){
            return;
        }

        if(!bookmarkedLandmarkIds || bookmarkedLandmarkIds.length == 0){
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

                setIsAppWideLoading(true);

                try {

                    const querySnapshot = await landmarksRef.where("id", "in", idsNotInCache).get();

                    if(querySnapshot.empty){
                        console.log("no bookmarked landmarks found");
                    } else {
                        const newlyFetchedBookmarkedLandmarks = querySnapshot.docs.map(doc => doc.data());
        
                        console.log("adding ", newlyFetchedBookmarkedLandmarks.length, " bookmarks to cache!");
        
                        if(cachedBookmarkedLandmarks){
                            setCachedBookmarkedLandmarks(cachedBookmarkedLandmarks.filter(cbl => bookmarkedLandmarkIds.includes(cbl.id)).concat(newlyFetchedBookmarkedLandmarks));
                        } else {
                            setCachedBookmarkedLandmarks(newlyFetchedBookmarkedLandmarks);
                        }
                    }

                    setIsAppWideLoading(false);

                } catch(error){
                    console.log("error getting landmarks for bookmarks", error);
                    setIsAppWideLoading(false);
                }  
                
            } else {
                console.log(cachedBookmarkedLandmarks);
                setCachedBookmarkedLandmarks(cachedBookmarkedLandmarks.filter(cbl => bookmarkedLandmarkIds.includes(cbl.id)));

                console.log("we already have all the landmarks we need for bookmarks")
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
                    ItemSeparatorComponent={() => <View style={styles.listItemSeparator} />}
                    contentContainerStyle={{borderTopWidth: 1, borderBottomWidth: 0, borderColor: '#C8C8C8'}}
                    // ListHeaderComponent={<LandmarkDetailScreenHeader selectedLandmark={selectedLandmark} setModalVisible={setModalVisible} navigation={navigation} />}
                    ListHeaderComponentStyle={styles.headerComponentStyle}
                    ListEmptyComponent={cachedBookmarkedLandmarks != null ? <NoBookmarksView /> : <LoadingBookmarksView landmarks={cachedBookmarkedLandmarks}/> }
                    data={cachedBookmarkedLandmarks}
                    renderItem={({item, index}) => (
                        <Pressable style={styles.bathroomItemContainer} onPress={() => handleListItemPress(index)}>
                            <BathroomListItem navigation={navigation} landmark={item} />
                            <Pressable 
                                style={({pressed}) => [styles.viewOnMapButton, {backgroundColor: pressed ? "#D0D0D0" : 'white'}]}
                                onPress={() => navigation.navigate("Bookmark Map View")}
                            >
                                <Text style={styles.viewOnMapButtonText}>View on map</Text>
                            </Pressable>
                        </Pressable>
                    )}
                />    
            </SafeAreaView>) :

            <View style={{flex: 1, justifyContent: 'center'}}><Text>You must be signed in to view bookmarks</Text></View>
        }
        </>
        

    );
}



function NoBookmarksView(){
    return (
        <View>
            <Text>No Bookmarks found.</Text>
        </View>
    );
}

function LoadingBookmarksView({landmarks}){
    return (
        <View style={styles.spinnerContainer}>
            <ActivityIndicator animating={landmarks == null} />
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


