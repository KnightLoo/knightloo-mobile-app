import React, { useState, useRef, useCallback, useContext, useEffect, useLayoutEffect, useMemo } from 'react';
import { StyleSheet, Dimensions, View, Text, FlatList, SafeAreaView, StatusBar, Pressable, Easing, ActivityIndicator} from 'react-native';
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
    const {landmarks, isFetchingBathrooms} = useContext(LandmarkMapContext);


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



    const RenderItem = useCallback(({item, index}) => {
        return (
          <Pressable 
              style={({pressed}) => [
                  styles.bathroomItemContainer, 
                  { opacity: pressed ? 0.7 : 1}
                ]
              } 
              onPress={() => handleListItemPress(index)}>
                <BathroomListItem navigation={navigation} landmark={item} />
            </Pressable>
        );
      },[landmarks],
    );

    return (

        <SafeAreaView style={styles.screen}>
            <FlatList
                style={{width: '100%', flex: 1}}
                ItemSeparatorComponent={() => <View style={styles.listItemSeparator} />}
                contentContainerStyle={{flexGrow: 1, borderTopWidth: 1, borderBottomWidth: 0, borderColor: '#C8C8C8'}}
                // ListHeaderComponent={<LandmarkDetailScreenHeader selectedLandmark={selectedLandmark} setModalVisible={setModalVisible} navigation={navigation} />}
                ListHeaderComponentStyle={styles.headerComponentStyle}
                ListEmptyComponent={isFetchingBathrooms ? <LoadingLandmarksView /> : <NoLandmarksView />}
                data={landmarks}
                initialNumToRender={7} 
                renderItem={RenderItem}
            
            />    
        </SafeAreaView>
    );
}

function NoLandmarksView(){
    return (
      <View style={{flexGrow: 1, justifyContent: 'flex-start', alignItems: 'center', borderWidth: 0}}>
        <Text style={{fontSize: 24, fontWeight: '500', color: '#484848', marginTop: '30%'}}>No Bathrooms Found.</Text>
        <Text style={{fontSize: 18, fontWeight: '400', color: '#696969', textAlign: 'center', marginHorizontal: 20, marginTop: 10}}>
        Try broadening your filters to find more bathrooms.
        </Text>
      </View>
    );
}

function LoadingLandmarksView(){
    return (
      <View style={{flexGrow: 1, justifyContent: 'center', alignItems: 'center'}}>
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
        // marginTop: StatusBar.currentHeight || 0,
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
        // marginTop: 10
    }
});


