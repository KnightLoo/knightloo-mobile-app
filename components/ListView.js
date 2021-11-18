import React, { useState, useRef, useCallback, useContext, useEffect, useLayoutEffect } from 'react';
import { StyleSheet, Dimensions, View, Text, FlatList, SafeAreaView, StatusBar, Pressable, Easing} from 'react-native';
import AppContext from '../contexts/AppContext';
import LandmarkMapContext from '../contexts/LandmarkMapContext';
import { CardStyleInterpolators, TransitionSpecs } from '@react-navigation/stack';

import BathroomListItem from './BathroomListItem';

const flipOptions = {
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






export default function ListView({navigation, route}){

    const {setSelectedLandmark} = useContext(AppContext);
    const {landmarks} = useContext(LandmarkMapContext);


    const handleListItemPress = (index) => {
        setSelectedLandmark(landmarks[index]);
        navigation.navigate("Details View");
    }


    useLayoutEffect(() => {
        // console.log("Sign in screen:::prev screen: ", route.params.prevScreen);

        if(route.params && route.params.prevScreen == "Map"){
            console.log("yes...");
            navigation.setOptions(flipOptions);
        } else {
            console.log("no:: ", route.params);
            navigation.setOptions({});
        }

    }, []);




    return (

        <SafeAreaView style={styles.screen}>
            <FlatList
                style={{width: '100%', flex: 1}}
                ItemSeparatorComponent={() => <View style={styles.listItemSeparator} />}
                contentContainerStyle={{borderTopWidth: 1, borderBottomWidth: 1, borderColor: 'gray'}}
                // ListHeaderComponent={<LandmarkDetailScreenHeader selectedLandmark={selectedLandmark} setModalVisible={setModalVisible} navigation={navigation} />}
                ListHeaderComponentStyle={styles.headerComponentStyle}
                ListEmptyComponent={landmarks != null ? <NoLandmarksView /> : <LoadingLandmarksView landmarks={landmarks}/> }
                data={landmarks}
                renderItem={({item, index}) => (
                    <Pressable style={styles.bathroomItemContainer} onPress={() => handleListItemPress(index)}>
                        <BathroomListItem navigation={navigation} landmark={item} />
                    </Pressable>
                )}
            />    
        </SafeAreaView>
    );
}

function NoLandmarksView(){
    return (
        <View>
            <Text>No Bathrooms Found. Try broadening your filters.</Text>
        </View>
    );
}

function LoadingLandmarksView({landmarks}){
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
        flex: 1
    },
    listItemSeparator: {
        borderTopColor: 'gray',
        borderTopWidth: 1,

    }
});


