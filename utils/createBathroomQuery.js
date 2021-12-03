import Firebase from "./Firebase";

const db = Firebase.firestore();

export default function createBathroomQuery(filters){

    const bathroomsRef = db.collection("landmark_locations_data");

    let query = null;
    let hasGenderFilter = false;
    let hasFloorsFilter = false;

    if(filters.minStalls && filters.minStalls != 0){

        if(query == null){
            query = bathroomsRef.where("num_stalls", ">=", filters.minStalls);
        } else {
            query = query.where("num_stalls", ">=", filters.minStalls);
        }
    }


    if(filters.showAccessibleBathroomsOnly){

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

        hasGenderFilter = true;

        if(query == null){
            query = bathroomsRef.where("gender", "in", genders);
        } else {
            query = query.where("gender", "in", genders);
        }
    }


    if(filters.floors && filters.floors.length > 0 && !filters.floors.includes(0)){

        hasFloorsFilter = true;

        if(!hasGenderFilter){

            if(query == null){
                query = bathroomsRef.where("floor", "in", filters.floors);
            } else {
                query = query.where("floor", "in", filters.floors);
            }
        }
    }

    if(query != null){
        return {query: query, postFetchFilter: hasFloorsFilter && hasGenderFilter ? "floors": null};
    }

    return {query: bathroomsRef, postFetchFilter: null};
}

