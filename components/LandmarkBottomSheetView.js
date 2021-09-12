import { useRef, useMemo, useCallback } from 'react';
import { BottomSheetModal, BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { StyleSheet, Text, View, Button, SafeAreaView, Pressable, Dimensions } from 'react-native';

export default function BottomSheetModalView() {

    const handleHomeScreenPress = () => {
      bottomSheetModalRef.current.dismiss();
      console.log("hereee");  
    }
  
    // ref
    const bottomSheetModalRef = useRef(null);
  
    // variables
    const snapPoints = useMemo(() => ['25%', '50%'], []);
  
    // callbacks
    const handlePresentModalPress = useCallback(() => {
      bottomSheetModalRef.current?.present();
    }, []);
    const handleSheetChanges = useCallback((index) => {
      console.log('handleSheetChanges', index);
    }, []);
  
    // renders
    return (
      <BottomSheetModalProvider>
  
        <Pressable onPress={handleHomeScreenPress} style={btmSheetModalStyles.container}>
          <View >
  
            <Button
              onPress={handlePresentModalPress}
              title="Open Modal"
            />
  
  
            <BottomSheetModal
              ref={bottomSheetModalRef}
              index={1}
              snapPoints={snapPoints}
              onChange={handleSheetChanges}
            >
              <View style={btmSheetModalStyles.contentContainer}>
                <Text>Awesome 🎉</Text>
              </View>
            </BottomSheetModal>
  
          </View>
        </Pressable>
      </BottomSheetModalProvider >
    );
  };
  
  const btmSheetModalStyles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 24,
      justifyContent: 'center',
      backgroundColor: 'red',
    },
    contentContainer: {
      flex: 1,
      alignItems: 'center',
    },
  });
  