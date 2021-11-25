import React, { useState, useEffect, useCallback, useRef, useContext, useMemo, useLayoutEffect } from 'react';
import AppContext from '../contexts/AppContext';
import DetailScreen from './DetailScreen';

export default function BookmarkedLandmarkDetailScreen({navigation, route}) {

    const {selectedBookmarkedLandmark} = useContext(AppContext);

    return (
        <DetailScreen navigation={navigation} route={route} selectedLandmark={selectedBookmarkedLandmark} /> 
    );
}
