import React, {
  Component,
} from 'react';
import {
  Platform,
  Linking,
} from 'react-native';

import {
  Screen,
  Text,
  Button,
  View,
} from '@shoutem/ui';
import { NavigationBar } from '@shoutem/ui/navigation';

import { MapView } from '@shoutem/ui-addons';
//import { MapView } from 'react-native-maps';

export default class Map extends Component {
  static propTypes = {
    markers: React.PropTypes.array,
    title: React.PropTypes.string,
  };

  constructor(props) {
    super(props);

    this.renderNavigateButton = this.renderNavigateButton.bind(this);
    this.openMaps = this.openMaps.bind(this);
  }

  openMaps() {
    const { markers } = this.props;
    const geoURL = `geo:${markers[0].latitude},${markers[0].longitude}`;

    Linking.canOpenURL(geoURL).then(supported => {
      if (supported) {
        Linking.openURL(geoURL);
      } else {
        Linking.openURL(`http://maps.apple.com/?ll=${markers[0].latitude},${markers[0].longitude}`);
      }
    });
  }

  renderNavigateButton() {
    if (Platform.OS === 'ios') {
      return (
        <View virtual styleName="container">
          <Button styleName="clear" onPress={this.openMaps}>
            <Text>Open in Maps</Text>
          </Button>
        </View>
      );
    }
    return null;
  }

  render() {
    const { markers, title } = this.props;

    return (
      <Screen styleName="full-screen">
        <NavigationBar
          styleName="no-border"
          title={title.toUpperCase()}
          renderRightComponent={this.renderNavigateButton}
        />
		
        <MapView
          initialRegion={{
            latitude: markers[0].latitude,
            longitude: markers[0].longitude,
            latitudeDelta: 0.03,
            longitudeDelta: 0.03
          }}
          markers={markers}
          //selectedMarker={markers[0]}
		  loadingEnabled={true}
		  showsUserLocation={true}
		  followsUserLocation={true}
        />
      </Screen>
    );
  }
}
