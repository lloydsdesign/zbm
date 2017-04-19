import React, {
  Component,
} from 'react';

import { STYLE_URL } from '../const';
import { Screen } from '@shoutem/ui';
import { NavigationBar } from '@shoutem/ui/navigation';
import Mapbox from 'react-native-mapbox-gl';
import { MapView } from 'react-native-mapbox-gl';
import _ from 'lodash';


export default class Map extends Component {

  static propTypes = {
    title: React.PropTypes.string,
    markers: React.PropTypes.array
  };

  constructor(props)
  {
    super(props);

    this.state = {
      isReady: false
    };
  }

  componentWillMount()
  {
	const { markers } = this.props;
	
	this.setState({
		initialRegion: this.resolveInitialRegion(_.head(markers)),
		isReady: true
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
    const { title, markers } = this.props;
    const { initialRegion, isReady } = this.state;
	
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
		  userTrackingMode={Mapbox.userTrackingMode.followWithHeading}
		  styleURL={STYLE_URL}
		  style={{ flex: 1 }}
        />
      </Screen>
    );
  }
}
