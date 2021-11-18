import React, { useEffect, useRef, useState } from "react";
import { Alert, Image, View, ActivityIndicator, ImageBackground } from "react-native";
import * as FileSystem from "expo-file-system";
// import cancellablePromise from "../utils/cancellablePromise";

function getImgXtension(uri) {
  var basename = uri.split(/[\\/]/).pop();
  return /[.]/.exec(basename) ? /[^.]+$/.exec(basename) : undefined;
}

async function findImageInCache(uri) {
  try {
    let info = await FileSystem.getInfoAsync(uri);
    return { ...info, err: false };
  } catch (error) {
    return {
      exists: false,
      err: true,
      msg: error,
    };
  }
}

async function cacheImage(uri, cacheUri, callback) {
  try {
    const downloadImage = FileSystem.createDownloadResumable(
      uri,
      cacheUri,
      {},
      callback
    );
    const downloaded = await downloadImage.downloadAsync();
    return {
      cached: true,
      err: false,
      path: downloaded.uri,
    };
  } catch (error) {
    return {
      cached: false,
      err: true,
      msg: error,
    };
  }
}

const CustomFastImage = (props) => {

  const {
    source: { uri },
    cacheKey,
    style,
    children
  } = props;

  const isMounted = useRef(true);
  const [imgUri, setUri] = useState("");

  useEffect(() => {

    isMounted.current = true;

    async function getImage(){

      let imgXt = getImgXtension(uri);

      if (!imgXt || !imgXt.length) {
        console.log("couldnt load image 1");
        Alert.alert(`Couldn't load Image 1!`);
        return;
      }

      const cacheFileUri = `${FileSystem.cacheDirectory}${cacheKey}.${imgXt[0]}`;
      let imgXistsInCache = await findImageInCache(cacheFileUri);

      if (isMounted.current && imgXistsInCache.exists) {
        console.log("cached!");
        setUri(cacheFileUri);
      } 
      else {
        let cached = await cacheImage(uri, cacheFileUri, () => {});

        if (isMounted.current && cached.cached) {
          console.log("cached new!");
          setUri(cached.path);
        } else {
          console.log("couldnt load image 2");
          Alert.alert(`Couldn't load Image 2!`);
        }
      }
    }
     
    getImage();

    return () => (isMounted.current = false);

  }, [cacheKey]);

  return (
    <>
      {imgUri ? (
        children ? <ImageBackground source={{ uri: imgUri }} style={style}>{children}</ImageBackground> :
        <Image source={{ uri: imgUri }} style={style} />
      ) : (
        <View
          style={{ ...style, alignItems: "center", justifyContent: "center" }}
        >
          <ActivityIndicator size={33} />
        </View>
      )}
    </>
  );
};

export default CustomFastImage;


// import React, { useEffect, useRef, useState } from "react";
// import { Alert, Image, View, ActivityIndicator } from "react-native";
// import * as FileSystem from "expo-file-system";
// // import cancellablePromise from "../utils/cancellablePromise";

// function getImgXtension(uri) {
//   var basename = uri.split(/[\\/]/).pop();
//   return /[.]/.exec(basename) ? /[^.]+$/.exec(basename) : undefined;
// }

// async function findImageInCache(uri) {
//   try {
//     let info = await FileSystem.getInfoAsync(uri);
//     return { ...info, err: false };
//   } catch (error) {
//     return {
//       exists: false,
//       err: true,
//       msg: error,
//     };
//   }
// }

// async function cacheImage(uri, cacheUri, callback) {
//   try {
//     const downloadImage = FileSystem.createDownloadResumable(
//       uri,
//       cacheUri,
//       {},
//       callback
//     );
//     const downloaded = await downloadImage.downloadAsync();
//     return {
//       cached: true,
//       err: false,
//       path: downloaded.uri,
//     };
//   } catch (error) {
//     return {
//       cached: false,
//       err: true,
//       msg: error,
//     };
//   }
// }

// const CustomFastImage = (props) => {

//   const {
//     source: { uri },
//     cacheKey,
//     style,
//   } = props;

//   const isMounted = useRef(true);
//   const [imgUri, setUri] = useState("");

//   useEffect(() => {

//     isMounted.current = true;

//     async function getImage(){

//       let imgXt = getImgXtension(uri);

//       if (!imgXt || !imgXt.length) {
//         console.log("couldnt load image 1");
//         Alert.alert(`Couldn't load Image 1!`);
//         return;
//       }

//       const cacheFileUri = `${FileSystem.cacheDirectory}${cacheKey}.${imgXt[0]}`;
//       let imgXistsInCache = await findImageInCache(cacheFileUri);

//       if (isMounted.current && imgXistsInCache.exists) {
//         console.log("cached!");
//         setUri(cacheFileUri);
//       } 
//       else {
//         let cached = await cacheImage(uri, cacheFileUri, () => {});

//         if (isMounted.current && cached.cached) {
//           console.log("cached new!");
//           setUri(cached.path);
//         } else {
//           console.log("couldnt load image 2");
//           Alert.alert(`Couldn't load Image 2!`);
//         }
//       }
//     }
     
//     getImage();

//     return () => (isMounted.current = false);

//   }, [cacheKey]);

//   return (
//     <>
//       {imgUri ? (
//         <Image source={{ uri: imgUri }} style={style} />
//       ) : (
//         <View
//           style={{ ...style, alignItems: "center", justifyContent: "center" }}
//         >
//           <ActivityIndicator size={33} />
//         </View>
//       )}
//     </>
//   );
// };

// export default CustomFastImage;