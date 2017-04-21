import pack from './package.json';

export function ext(resourceName) {
	return resourceName ? `${pack.name}.${resourceName}` : pack.name;
}

export const MGL_TOKEN = 'pk.eyJ1IjoibGxveWRzIiwiYSI6ImNqMG1mazJmNTAwOTkyeGwxejZwcnE0MWoifQ.enbLnUURo6x0a-BUbrnNww';
export const STYLE_URL = 'mapbox://styles/lloyds/cj0mh15k900ah2rt878b3l4da';

export const OFFLINE_PACK_CONFIG = {
	name: 'MainMap',
	type: 'bbox',
	bounds: [43.82935658485809, 14.89413461455638, 44.56000257018692, 15.89849111614171],
	minZoomLevel: 11,
	maxZoomLevel: 13,
	styleURL: STYLE_URL
};
