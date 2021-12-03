import cloneDeep from 'lodash/cloneDeep';

function convertDaysArrToRangeStrings(daysInNum) {
    let daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    let dayFilledArr = ["#", "#", "#", "#", "#", "#", "#"];

    for (let dayNum of daysInNum) {
        dayFilledArr[dayNum] = "" + dayNum;
    }

    let ranges = dayFilledArr.join("").split("#").filter((str) => str !== "");

    let rangeStrs = ranges.map((rangeNumStr) => {
        if (rangeNumStr.length === 1) {
            return daysOfWeek[parseInt(rangeNumStr, 10)];
        }

        return (
                daysOfWeek[parseInt(rangeNumStr.charAt(0), 10)] +
                "-" +
                daysOfWeek[parseInt(rangeNumStr.charAt(rangeNumStr.length - 1), 10)]
        );
    });

    return rangeStrs;
}

function convertRangesArrToHopArr(rangesArr) {

    const rangesStrArr = rangesArr.filter((range) => range != null).map((range) => range.etRangeStr);
    const uniqueRangeStrs = Array.from(new Set(rangesStrArr));

    let hopArr = [];

    for (const uniqueRangeStr of uniqueRangeStrs) {
        const rangeDays = rangesArr.map((rangeObj, i) => rangeObj != null && rangeObj.etRangeStr === uniqueRangeStr ? i : -1)
                                   .filter((index) => index !== -1);

        if (uniqueRangeStr === "allday") {
            hopArr.push({
                days: convertDaysArrToRangeStrings(rangeDays),
                daysInNum: rangeDays,
                isAllDay: true
            });

            continue;

        } else {

            hopArr.push({
                days: convertDaysArrToRangeStrings(rangeDays),
                daysInNum: rangeDays,
                isAllDay: false,
                etRangeStr: uniqueRangeStr
            });
        }
    }

    return hopArr;
}
    

export default function getTimeslotUpdates(curHopData, updatedTimeslotData) {

    const startUtcInMilli = updatedTimeslotData.startUtcInMilli;
    const endUtcInMilli = updatedTimeslotData.endUtcInMilli;
    const etRangeStrComps = updatedTimeslotData.etRangeStr.split("-");

    let newRangesArr = cloneDeep(curHopData.flattenedHopDataForFilteringAndMutating);
    const curRangesArr = curHopData.flattenedHopDataForFilteringAndMutating;
    let didUpdateData = false;

    if (updatedTimeslotData.isAllDay) {
        for (const day of updatedTimeslotData.days) {

            if(curRangesArr[day] == null || !curRangesArr[day].isAllDay){

                didUpdateData = true;

                newRangesArr[day] = {
                    startUtcInMilli: null,
                    endUtcInMilli: null,
                    etRangeStr: "allday",
                    isAllDay: true
                };
            }
        }
    } else {

        for (const day of updatedTimeslotData.days) {

            const curRange = curRangesArr[day];

            if (curRange == null) {

                didUpdateData = true;

                newRangesArr[day] = {
                startUtcInMilli: startUtcInMilli,
                endUtcInMilli: endUtcInMilli,
                etRangeStr: updatedTimeslotData.etRangeStr,
                isAllDay: false
                };
                continue;
            }

            if(curRange.isAllDay){
                continue;
            }

            let curEtRangeComps = curRangesArr[day].etRangeStr.split("-");
            let newEtStart = curEtRangeComps[0];
            let newEtEnd = curEtRangeComps[1];

            if (startUtcInMilli < curRange.startUtcInMilli) {
                didUpdateData = true;
                newRangesArr[day].startUtcInMilli = startUtcInMilli;
                newEtStart = etRangeStrComps[0];
            }

            if (endUtcInMilli > curRange.endUtcInMilli) {
                didUpdateData = true;
                newRangesArr[day].endUtcInMilli = endUtcInMilli;
                newEtEnd = etRangeStrComps[1];
            }

            newRangesArr[day].isAllDay = false;
            newRangesArr[day].etRangeStr = newEtStart + "-" + newEtEnd;
        }
    }

    if(didUpdateData){
        const newHopData = {displayableHopData: convertRangesArrToHopArr(newRangesArr),flattenedHopDataForFilteringAndMutating: newRangesArr};
        return {didDataChange: true, newHopData: newHopData};
    }
    

    return {didDataChange: false, newHopData: null};
}