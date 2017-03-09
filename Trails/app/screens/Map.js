import React, {
  Component
} from 'react';

import {
  Dimensions
} from 'react-native';

import {
  Screen
} from '@shoutem/ui';

import MapView from 'react-native-maps';

export default class Map extends Component {
  static propTypes = {
    markers: React.PropTypes.array,
    title: React.PropTypes.string,
  };

  render() {
    const { markers, title } = this.props;
	const { width, height } = Dimensions.get('window');

    return (
      <Screen styleName="full-screen">
        <MapView
			initialRegion={{
				latitude: markers[0].latitude,
				longitude: markers[0].longitude,
				latitudeDelta: 0.03,
				longitudeDelta: 0.03
			}}
			loadingEnabled
			showsUserLocation
			followsUserLocation
			style={{width: width, height: height}}
		>
			<MapView.Polyline
				coordinates={markers}
				geodesic
				strokeColor="#f00"
				strokeWidth={3}
			/>
        </MapView>
      </Screen>
    );
  }
}
