// import db from './db';
import Firebase from "./Firebase";

const db = Firebase.firestore();
// import { query, where, collection } from "firebase/firestore";

// const geofire = require('geofire-common');

export default function createBathroomQuery(filters){

    // const bathroomsRef = collection(db, 'landmark_locations_data');
    const bathroomsRef = db.collection("landmark_locations_data");

    // let queryConstraints = [];
    let query = null;
    let postFetchFilter = null;
    let hasGenderFilter = false;
    let hasFloorsFilter = false;

    if(filters.minStalls && filters.minStalls != 0){
        // queryConstraints.push(where("numMinStalls", ">=", filters.minStalls));
        console.log("minStalls");
        
        if(query == null){
            query = bathroomsRef.where("num_stalls", ">=", filters.minStalls);
        } else {
            query = query.where("num_stalls", ">=", filters.minStalls);
        }

        // queryConstraints.push(bathroomsRef.where("numMinStalls", ">=", filters.minStalls));
    }


    if(filters.showAccessibleBathroomsOnly){
        // queryConstraints.push(where("isHandicapAccessible", "==", true));
        // queryConstraints.push(bathroomsRef.where("isHandicapAccessible", "==", true));
        console.log("handicap");
        if(query == null){
            query = bathroomsRef.where("isHandicapAccessible", "==", true);
        } else {
            query = query.where("isHandicapAccessible", "==", true);
        }
    }

    let genders = [];

    if(filters.showMaleBathrooms){
        genders.push("male");
    }

    if(filters.showFemaleBathrooms){
        genders.push("female");
    }

    if(filters.showUnisexBathrooms){
        genders.push("both");
    }

    if(genders.length > 0 && genders.length != 3){
        // queryConstraints.push(where("gender", "in", genders));
        // queryConstraints.push(bathroomsRef.where("gender", "in", genders));
        hasGenderFilter = true;

        console.log("genders");
        if(query == null){
            query = bathroomsRef.where("gender", "in", genders);
        } else {
            query = query.where("gender", "in", genders);
        }
    }


    if(filters.floors && filters.floors.length > 0 && !filters.floors.includes(0)){
        // queryConstraints.push(where("floor", "in", filters.selectedFloors));
        // queryConstraints.push(bathroomsRef.where("floor", "in", filters.selectedFloors));
        console.log("floors");
        hasFloorsFilter = true;

        if(!hasGenderFilter){

            if(query == null){
                query = bathroomsRef.where("floor", "in", filters.floors);
            } else {
                query = query.where("floor", "in", filters.floors);
            }
        }
    }

    // if(queryConstraints.length > 0){
    //     // return query(bathroomsRef, queryConstraints);
    //     return bathroomsRef.
    // } 

    if(query != null){
        return {query: query, postFetchFilter: hasFloorsFilter && hasGenderFilter ? "floors": null};
    }

    // if(filters.showOpenBathroomsOnly || filters.maxRadiusInFeet < 5600){
    //     return bathroomsRef;
    // }

    return {query: bathroomsRef, postFetchFilter: null};

    // if(userLocation && filters.maxRadiusInFeet){

    //     const maxRadiusInMeters = filters.maxRadiusInFeet / 3.2808;

    //     // const bounds = geofire.geohashQueryBounds(center, radiusInM);
    //     // const promises = [];
    //     // for (const b of bounds) {
    //     //   const q = db.collection('cities')
    //     //     .orderBy('geohash')
    //     //     .startAt(b[0])
    //     //     .endAt(b[1]);
        
    //     //   promises.push(q.get());
    //     // }




    // }
}

