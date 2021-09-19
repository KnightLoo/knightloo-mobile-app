import React, { useMemo } from 'react';
import BottomSheet from '@gorhom/bottom-sheet';
import { StyleSheet, Text, View, Button, SafeAreaView, Pressable, Dimensions } from 'react-native';


export default function LandmarkBottomSheetView({sheetRef, handleSheetChanges, landmark}){
  
    const snapPoints = useMemo(() => ['50%'], []);

    return (
        <BottomSheet
        ref={sheetRef}
        index={-1}
        snapPoints={snapPoints}
        onChange={i => handleSheetChanges(i)}
        enablePanDownToClose={true}
        >
          <View style={styles.container}>
            {landmark && 
              <Text>{landmark.name}</Text>
            }
            
          </View>
      </BottomSheet>
    );
}
  
const styles = StyleSheet.create({
  container: {
      flex: 1,
      // backgroundColor: 'red',
      alignItems: 'center',
      justifyContent: 'center',
  }
});