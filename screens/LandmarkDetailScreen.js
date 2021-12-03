import React, { useState, useEffect, useCallback, useRef, useContext, useMemo, useLayoutEffect } from 'react';
import AppContext from '../contexts/AppContext';
import DetailScreen from './DetailScreen';

export default function rLandmarkDetailScreen({navigation, route}) {

    const {selectedLandmark} = useContext(AppContext);

    return (
        <DetailScreen navigation={navigation} route={route} selectedLandmark={selectedLandmark} /> 
    );
}