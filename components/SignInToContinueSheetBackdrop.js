import React, { useMemo } from "react";
import { BottomSheetBackdropProps } from "@gorhom/bottom-sheet";
import Animated, {
  Extrapolate,
  interpolate,
  useAnimatedStyle,
} from "react-native-reanimated";
import { Dimensions } from "react-native";

export default function SignInToContinueSheetBackdrop({ animatedIndex, style }){


//   const containerAnimatedStyle = useAnimatedStyle(() => ({
//     opacity: interpolate(
//       animatedIndex.value,
//       [0, 1],
//       [0, 1],
//       Extrapolate.CLAMP
//     ),
//   }));

  const containerStyle = useMemo(
    () => [
      style,
      {
        backgroundColor: "#a8b5eb",
        height: Dimensions.get("window").height,
        position: 'absolute',
        top: 0,
        bottom: 0,
        right: 0,
        left: 0
      },
      
    ],
    [style]
  );

  return <Animated.View style={containerStyle} />;
};