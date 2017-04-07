import React, {
  Component,
} from 'react';
import { STYLE_URL } from '../const';
import { Screen } from '@shoutem/ui';
import { NavigationBar } from '@shoutem/ui/navigation';
import { MapView } from 'react-native-mapbox-gl';
import _ from 'lodash';

const DOMParser = require('xmldom').DOMParser;

export default class Map extends Component {

  static propTypes = {
    title: React.PropTypes.string,
    gpsurl: React.PropTypes.string,
  };

  constructor(props) {
    super(props);

    this.state = {
      markers: [],
      isReady: false,
    };
  }



  componentWillMount() {
    const { gpsurl } = this.props;
    this.fetchMarkers(gpsurl);
  }

  fetchMarkers(xmlUrl) {
    return fetch(xmlUrl)
      .then((response) => response.text())
      .then((responseXML) => {
        const markers = parseXMLData(responseXML);
        const initialRegion = this.resolveInitialRegion(_.head(markers));
        this.setState({ markers, initialRegion, isReady: true });
      })
      .catch((error) => {
        console.error(error);
      });
  }

  resolveInitialRegion(marker) {
    console.log(marker);
    return {
      latitude: _.head(marker),
      longitude: _.last(marker),
    };
  }

  resolveMapmarkers(markers) {

    const startingPoint = {
      coordinates: _.head(markers),
      type: 'point',
      title: 'Start',
      subtitle: 'Track starting point',
      id: 'start',
    };

    const lastPoint = {
      coordinates: _.last(markers),
      type: 'point',
      title: 'Finish',
      subtitle: 'Track finish point',
      id: 'finish',
    };

    const polyline = {
      coordinates: markers,
      type: 'polyline',
      strokeColor: '#00FB00',
      strokeWidth: 4,
      strokeAlpha: 0.5,
      id: 'line',
    };

    return [
      startingPoint,
      lastPoint,
      polyline,
    ];
  }

  /*renderPolyLine() {
    const { markers } = this.state;
    if (!markers.length) return null;

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

  fitToCoordinates() {
    const { markers, hasLoaded } = this.state;
    if (hasLoaded || !markers.length) return;

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

    this.setState({ hasLoaded: true });
  }*/


  render() {
    const { title } = this.props;
    const { markers, initialRegion, isReady } = this.state;

    const mapMarkers = this.resolveMapmarkers(markers);

    if (!isReady) return null;

    return (
      <Screen styleName="full-screen">
        <NavigationBar
          styleName="no-border"
          title={title.toUpperCase()}
        />
        <MapView
          initialCenterCoordinate={initialRegion}
          style={{ flex: 1 }}
          initialZoomLevel={13}
          styleURL={STYLE_URL}
          annotations={mapMarkers}
          showsUserLocation
          logoIsHidden
          compassIsHidden
        />
      </Screen>
    );
  }
}

function parseXMLData(gpxData) {
  var i, markers = [];
  gpxData = new DOMParser().parseFromString(gpxData).getElementsByTagName('trkpt');

  for (i = 0; i < gpxData.length; i += 10) {
    markers[markers.length] = [
      parseFloat(gpxData[i].getAttribute('lat')),
      parseFloat(gpxData[i].getAttribute('lon')),
    ];
  }

  return markers;
}
