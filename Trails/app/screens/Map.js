import React, {
  Component
} from 'react';

import { Dimensions } from 'react-native';
import MapView from 'react-native-maps';
import { Screen } from '@shoutem/ui';
import { NavigationBar } from '@shoutem/ui/navigation';

const DOMParser = require('xmldom').DOMParser;

export default class Map extends Component
{
	constructor(props)
	{
		super(props);
		
		this.state = {
			markers: [],
			hasLoaded: false
		};
	}
	
	static propTypes = {
		title: React.PropTypes.string,
		gpsurl: React.PropTypes.string
	};
	
	componentWillMount()
	{
		const { gpsurl } = this.props;
		this.fetchMarkers(gpsurl);
	}
	
	fetchMarkers(xmlUrl)
	{
		return fetch(xmlUrl)
			.then((response) => response.text())
			.then((responseXML) =>
			{
				const markers = parseXMLData(responseXML);
				this.setState({ markers });
			})
			.catch((error) => {
				console.error(error);
			});
	}
	
	renderPolyLine()
	{
		const { markers } = this.state;
		if(!markers.length) return null;
		
		return (
			<MapView.Marker
				coordinate={markers[0]}
				title="Start / Finish"
			/>
			&&
			<MapView.Polyline
				coordinates={markers}
				geodesic
				strokeColor="#f00"
				strokeWidth={3}
			/>
		);
	}

	fitToCoordinates()
	{
		const { markers, hasLoaded } = this.state;
		if(hasLoaded || !markers.length) return;
		
		this.refs.map.fitToCoordinates(markers, {
			options:
			{
				edgePadding:
				{
					top: 10,
					right: 10,
					bottom: 10,
					left: 10
				},
				animated: true
			}
		});
		
		this.setState({hasLoaded: true});
	}


	render()
	{
		const { marker, title } = this.props;
		const { width, height } = Dimensions.get('window');

		return (
		  <Screen styleName="full-screen">
			<NavigationBar
			  styleName="no-border"
			  title={title.toUpperCase()}
			/>
			
			<MapView
				ref="map"
				onRegionChangeComplete={() => this.fitToCoordinates()}
				loadingEnabled
				showsUserLocation
				followsUserLocation
				style={{width: width, height: height}}
			>	
				{this.renderPolyLine()}
			</MapView>
		  </Screen>
		);
	}
}

function parseXMLData(gpxData)
{
	var i, markers = [];
	gpxData = new DOMParser().parseFromString(gpxData).getElementsByTagName('trkpt');
	
	for(i = 0; i < gpxData.length; i += 10)
	{
		markers[markers.length] = {
			latitude: parseFloat(gpxData[i].getAttribute('lat')),
			longitude: parseFloat(gpxData[i].getAttribute('lon'))
		};
	}
	
	return markers;
}
