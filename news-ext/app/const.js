import React, {
	Component
} from 'react';

import { Alert } from 'react-native';
import pack from './package.json';

const jsonGuard = String.fromCharCode(0);
const CMS_BASE = 'http://zbm.lloyds-design.hr/';
const CMS_REST = CMS_BASE +'manage.php';

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
	parseJSON,
	showAlert,
	ext
};