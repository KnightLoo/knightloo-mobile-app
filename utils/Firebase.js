// import * as firebase from 'firebase';
import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';

import {firebaseConfig} from '../firebase-config';

let Firebase;

if(firebase.apps.length === 0){
    Firebase = firebase.initializeApp(firebaseConfig);
    console.log("heree");
}


// export const db = firebase.firestore();

export default Firebase;

// export const auth = Firebase.auth();

// export const db = Firebase.firestore();