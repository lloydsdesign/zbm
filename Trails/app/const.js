import React, {
	Component
} from 'react';

import { Alert } from 'react-native';
import pack from './package.json';

const jsonGuard = String.fromCharCode(0);
const CMS_BASE = 'http://zbm.lloyds-design.hr/';
const CMS_REST = CMS_BASE +'manage.php';
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

function parseJSON(value)
{
	const startPos = value.indexOf(jsonGuard);
	const endPos = value.lastIndexOf(jsonGuard);
	if(startPos > -1 && endPos > startPos) value = value.substring(startPos + jsonGuard.length, endPos);
	
	try
	{
		value = JSON.parse(value);
	}
	catch(SyntaxError)
	{
		return false;
	}
	
	return value;
}


export {
	CMS_BASE,
	CMS_REST,
	MGL_TOKEN,
	STYLE_URL,
	OFFLINE_PACK_CONFIG,
	parseJSON,
	showAlert,
	ext
};