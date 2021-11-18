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
  
// function convertRangesArrToHopArr(rangesArr) {

//     const rangesStrArr = rangesArr.filter((range) => range != null).map((range) => range.etRangeStr);
//     const uniqueRangeStrs = Array.from(new Set(rangesStrArr));

//     let hopArr = [];

//     for (const uniqueRangeStr of uniqueRangeStrs) {
//         const rangeDays = rangesArr.map((rangeObj, i) => rangeObj != null && rangeObj.etRangeStr === uniqueRangeStr ? i : -1)
//                                    .filter((index) => index !== -1);

//         if (uniqueRangeStr === "allday") {
//             hopArr.push({
//                 days: convertDaysArrToRangeStrings(rangeDays),
//                 daysInNum: rangeDays,
//                 isAllDay: true
//             });

//             continue;

//         } else {

//             const etRangeComps = uniqueRangeStr.split("-");
//             const etStartComps = etRangeComps[0].split(":");
//             const etEndComps = etRangeComps[1].split(":");
//             const {stdHour: etStartHour, dayTimeType: etStartDayTimeType} = getStandardHourDT(parseInt(etStartComps[0], 10));
//             const {stdHour: etEndHour, dayTimeType: etEndDayTimeType} = getStandardHourDT(parseInt(etEndComps[0], 10));

//             hopArr.push({
//                 days: convertDaysArrToRangeStrings(rangeDays),
//                 daysInNum: rangeDays,
//                 isAllDay: false,
//                 startEtHour: etStartHour,
//                 startEtMin: parseInt(etStartComps[1], 10),
//                 startEtDayTime: etStartDayTimeType,
//                 endEtHour: etEndHour,
//                 endEtMin: parseInt(etEndComps[1], 10),
//                 endEtDayTime: etEndDayTimeType
//             });
//         }
//     }

//     return hopArr;
// }

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

            // const etRangeComps = uniqueRangeStr.split("-");
            // const etStartComps = etRangeComps[0].split(":");
            // const etEndComps = etRangeComps[1].split(":");
            // const {stdHour: etStartHour, dayTimeType: etStartDayTimeType} = getStandardHourDT(parseInt(etStartComps[0], 10));
            // const {stdHour: etEndHour, dayTimeType: etEndDayTimeType} = getStandardHourDT(parseInt(etEndComps[0], 10));

            hopArr.push({
                days: convertDaysArrToRangeStrings(rangeDays),
                daysInNum: rangeDays,
                isAllDay: false,
                // startEtHour: etStartHour,
                // startEtMin: parseInt(etStartComps[1], 10),
                // startEtDayTime: etStartDayTimeType,
                // endEtHour: etEndHour,
                // endEtMin: parseInt(etEndComps[1], 10),
                // endEtDayTime: etEndDayTimeType,
                etRangeStr: uniqueRangeStr
            });
        }
    }

    return hopArr;
}
  
function getStandardHourDT(milHour) {
    if (milHour > 12) {
        return { stdHour: milHour - 12, dayTimeType: "PM" };
    }

    if (milHour === 12) {
        return { stdHour: 12, dayTimeType: "PM" };
    }

    if (milHour === 0) {
        return { stdHour: 12, dayTimeType: "AM" };
    }

    return { stdHour: milHour, dayTimeType: "AM" };
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

// export default function getTimeslotUpdates(curRangesArr, updatedTimeslotData) {

//     const startUtcInMilli = updatedTimeslotData.startUtcInMilli;
//     const endUtcInMilli = updatedTimeslotData.endUtcInMilli;
//     const etRangeStrComps = updatedTimeslotData.etRangeStr.split("-");

//     let newRangesArr = cloneDeep(curRangesArr);

//     if (updatedTimeslotData.isAllDay) {
//         for (const day of updatedTimeslotData.days) {
//             newRangesArr[day] = {
//                 startUtcInMilli: null,
//                 endUtcInMilli: null,
//                 etRangeStr: "allday",
//                 isAllDay: true
//             };
//         }
//     } else {

//         for (const day of updatedTimeslotData.days) {

//             const curRange = curRangesArr[day];

//             if (curRange == null) {
//                 newRangesArr[day] = {
//                 startUtcInMilli: startUtcInMilli,
//                 endUtcInMilli: endUtcInMilli,
//                 etRangeStr: updatedTimeslotData.etRangeStr,
//                 isAllDay: false
//                 };
//                 continue;
//             }

//             let curEtRangeComps = curRangesArr[day].etRangeStr.split("-");
//             let newEtStart = curEtRangeComps[0];
//             let newEtEnd = curEtRangeComps[1];

//             if (startUtcInMilli < curRange.startUtcInMilli) {
//                 newRangesArr[day].startUtcInMilli = startUtcInMilli;
//                 newEtStart = etRangeStrComps[0];
//             }

//             if (endUtcInMilli > curRange.endUtcInMilli) {
//                 newRangesArr[day].endUtcInMilli = endUtcInMilli;
//                 newEtEnd = etRangeStrComps[1];
//             }

//             newRangesArr[day].isAllDay = false;
//             newRangesArr[day].etRangeStr = newEtStart + "-" + newEtEnd;
//         }
//     }

//     const newHOPs = convertRangesArrToHopArr(newRangesArr);

//     return [newRangesArr, newHOPs];
// }
  
// function getUTCDateFromHoursAndMins(hour, min, dayTimeType) {

//     let hourMilTime = dayTimeType === "PM" ? (hour % 12) + 12 : hour % 12;

//     let utcDate = new Date();
//     utcDate.setUTCMonth(0);
//     utcDate.setUTCDate(1);
//     utcDate.setUTCFullYear(2021);
//     utcDate.setUTCMilliseconds(0);
//     utcDate.setUTCSeconds(0);
//     utcDate.setUTCMinutes(min);
//     utcDate.setUTCHours(hourMilTime);

//     return utcDate.getTime();
// }
  
// const testRangesArr = [
//     {
//         startUtcInMilli: getUTCDateFromHoursAndMins(12, 15, "PM"),
//         endUtcInMilli: getUTCDateFromHoursAndMins(4, 0, "PM"),
//         etRangeStr: "12:15-16:00",
//         isAllDay: false
//     },
//     {
//         startUtcInMilli: getUTCDateFromHoursAndMins(9, 0, "AM"),
//         endUtcInMilli: getUTCDateFromHoursAndMins(5, 0, "PM"),
//         etRangeStr: "9:00-17:00",
//         isAllDay: false
//     },
//     null,
//     null,
//     null,
//     { etRangeStr: "allday", isAllDay: true },
//     null
// ];
  
// const updatedTimeslotDataTest = {
//     startUtcInMilli: getUTCDateFromHoursAndMins(9, 0, "AM"),
//     endUtcInMilli: getUTCDateFromHoursAndMins(7, 0, "PM"),
//     etRangeStr: "9:15-15:00",
//     isAllDay: true,
//     days: [0, 1, 3]
// };
  
// const [updatedRangesArr, updatedHopsArr] = applyTimeslotUpdates(testRangesArr, updatedTimeslotDataTest);
  