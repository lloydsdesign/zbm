import React, {
	Component
} from 'react';

import { Alert } from 'react-native';
import pack from './package.json';

const MGL_TOKEN = 'pk.eyJ1IjoibGxveWRzIiwiYSI6ImNqMG1mazJmNTAwOTkyeGwxejZwcnE0MWoifQ.enbLnUURo6x0a-BUbrnNww';
const STYLE_URL = 'mapbox://styles/lloyds/cj0mh15k900ah2rt878b3l4da';

const OFFLINE_PACK_CONFIG = {
	name: 'MainMap',
	type: 'bbox',
	bounds: [43.82935658485809, 14.89413461455638, 44.56000257018692, 15.89849111614171],
	minZoomLevel: 11,
	maxZoomLevel: 13,
	styleURL: STYLE_URL
};

function ext(resourceName) {
	return resourceName ? `${pack.name}.${resourceName}` : pack.name;
}

function showAlert(message)
{
	Alert.alert('Message', message, [{text: 'OK'}]);
}

export {
	MGL_TOKEN,
	STYLE_URL,
	OFFLINE_PACK_CONFIG,
	showAlert,
	ext
};