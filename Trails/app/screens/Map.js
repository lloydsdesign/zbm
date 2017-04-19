import React, {
  Component,
} from 'react';

import { STYLE_URL } from '../const';
import { Screen } from '@shoutem/ui';
import { NavigationBar } from '@shoutem/ui/navigation';
import Mapbox from 'react-native-mapbox-gl';
import { MapView } from 'react-native-mapbox-gl';
import _ from 'lodash';

const DOMParser = require('xmldom').DOMParser;

export default class Map extends Component {

  static propTypes = {
    title: React.PropTypes.string,
    gpsurl: React.PropTypes.string
  };

  constructor(props)
  {
    super(props);

    this.state = {
      markers: [],
      isReady: false
    };
  }

  componentWillMount()
  {
    const { gpsurl } = this.props;
    this.fetchMarkers(gpsurl);
  }

  fetchMarkers(xmlUrl) {
    return fetch(xmlUrl)
      .then((response) => response.text())
      .then((responseXML) => {
        const markers = parseXMLData(responseXML);
        const initialRegion = this.resolveInitialRegion(_.head(markers));
		
        this.setState({
			markers,
			initialRegion,
			isReady: true
		});
      })
      .catch((error) => {
        console.error(error);
      });
  }

  resolveInitialRegion(marker)
  {
    return {
      latitude: _.head(marker),
      longitude: _.last(marker)
    };
  }

  resolveMapmarkers(markers) {

    const startingPoint = {
      coordinates: _.head(markers),
      type: 'point',
      title: 'Start',
      subtitle: 'Track starting point',
      id: 'start'
    };

    const polyline = {
      coordinates: markers,
      type: 'polyline',
      strokeColor: '#ff0000',
      strokeWidth: 3,
      id: 'line'
    };

    return [
      startingPoint,
      polyline
    ];
  }

  render() {
    const { title } = this.props;
    const { markers, initialRegion, isReady } = this.state;
    const mapMarkers = this.resolveMapmarkers(markers);
	
    if(!isReady) return null;

    return (
      <Screen styleName="full-screen">
        <NavigationBar
          styleName="no-border"
          title={title.toUpperCase()}
        />
		
        <MapView
          initialCenterCoordinate={initialRegion}
          initialZoomLevel={13}
          annotations={mapMarkers}
		  logoIsHidden
          showsUserLocation
		  userTrackingMode={Mapbox.userTrackingMode.followWithCourse}
		  styleURL={STYLE_URL}
		  style={{ flex: 1 }}
        />
      </Screen>
    );
  }
}

function parseXMLData(gpxData)
{
	var i, markers = [];
	gpxData = new DOMParser().parseFromString(gpxData).getElementsByTagName('trkpt');

	for (i = 0; i < gpxData.length; i += 10)
	{
		markers[markers.length] = [
			parseFloat(gpxData[i].getAttribute('lat')),
			parseFloat(gpxData[i].getAttribute('lon'))
		];
	}

	return markers;
}
