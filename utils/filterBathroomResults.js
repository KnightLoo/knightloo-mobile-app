const geofire = require('geofire-common');

function getUtcTimeInMilli(hours, mins){
    const utcDate = new Date();
    utcDate.setUTCMonth(0);
    utcDate.setUTCDate(1);
    utcDate.setUTCFullYear(2021);
    utcDate.setUTCMilliseconds(0);
    utcDate.setUTCSeconds(0);
    utcDate.setUTCMinutes(mins);
    utcDate.setUTCHours(hours);

    return utcDate.getTime();
}

function mod(n, m) {
    return ((n % m) + m) % m;
}

export default function filterBathroomResults(results, floorsFilter, openBathroomsOnly, maxDistanceInFeet, usersLatLong){

    let filteredResults = results;


    if(floorsFilter != null){
        filteredResults = filteredResults.filter(br => floorsFilter.includes(br.floor));
    }

    if(openBathroomsOnly){

        const curDayInd = mod(new Date().getDay() - 1, 7);

        const userLocatDt = new Date();
        const convertedUserTimeInMilli = getUtcTimeInMilli(userLocatDt.getHours(),userLocatDt.getMinutes());

        filteredResults = filteredResults.filter(br => {
            const curHopData = br.hopData.flattenedHopDataForFilteringAndMutating[curDayInd];

            if(curHopData.isAllDay){
                return true;
            }

            if(curHopData.etRangeStr == "closed"){
                return false;
            }

            if( convertedUserTimeInMilli >= curHopData.startUtcInMilli && convertedUserTimeInMilli <= curHopData.endUtcInMilli){
                return true;
            }

            return false;
        });
    }

    if(maxDistanceInFeet && maxDistanceInFeet < 5600){

        const radiusInM = maxDistanceInFeet / 3.2808;

        filteredResults = filteredResults.filter(br => {

            const distanceInKm = geofire.distanceBetween([br.latitude, br.longitude], usersLatLong);
            const distanceInM = distanceInKm * 1000;

            if (distanceInM <= radiusInM) {
                return true;
            }

            return false;
        });
    }

    return filteredResults;
}