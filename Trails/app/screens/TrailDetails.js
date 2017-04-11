import React, {
  Component
} from 'react';
import Mapbox from 'react-native-mapbox-gl';
import { connect } from 'react-redux';

import {
  ScrollView,
  Linking,
} from 'react-native';

import {
  Icon,
  Button,
  Row,
  Subtitle,
  Text,
  Title,
  View,
  Image,
  Divider,
  TouchableOpacity
} from '@shoutem/ui';

import { find } from '@shoutem/redux-io';
import { InlineMap } from '@shoutem/ui-addons';
import { NavigationBar } from '@shoutem/ui/navigation';
import { navigateTo } from '@shoutem/core/navigation';
import { ext, MGL_TOKEN, OFFLINE_PACK_CONFIG } from '../const';


class TrailDetails extends Component {
  constructor(props) {
    super(props);
    this.saveOfflinePack = this.saveOfflinePack.bind(this);
    this.getOfflinePack = this.getOfflinePack.bind(this);
    this.deleteOfflinePack = this.deleteOfflinePack.bind(this);
  }

  componentWillMount() {
    Mapbox.setAccessToken(MGL_TOKEN);

    this.offlineProgressSubscription = Mapbox.addOfflinePackProgressListener((progress) => {
      console.log('offline pack progress', progress);
      // progress object will have the following shape :
      // {
      // 	name: 'test', // The name this pack was registered with
      // 	metadata, // The value that was previously passed as metadata
      // 	countOfBytesCompleted: 0, // The number of bytes downloaded for this pack
      // 	countOfResourcesCompleted: 0, // The number of tiles that have been downloaded for this pack
      // 	countOfResourcesExpected: 0, // The estimated minimum number of total tiles in this pack
      // 	maximumResourcesExpected: 0 // The estimated maximum number of total tiles in this pack
      // }
      // you can make use of these progress parameters to display download progress in real time,
      // as the difference between countOfResourcesCompleted and countOfResourcesExpected, displayed
      // in percentage, for example. Instead of logging, you can just return the object and use it elsewhere
    });
    this.offlineMaxTilesSubscription = Mapbox.addOfflineMaxAllowedTilesListener((tiles) => {
      console.log('offline max allowed tiles', tiles);
    });

    this.offlineErrorSubscription = Mapbox.addOfflineErrorListener((error) => {
      console.log('offline error', error);
    });
  }

  componentDidMount() {
    const { find } = this.props;

    find(ext('Trails'), 'all', {
      include: ['image', 'graph']
    });
  }

  componentWillUnmount() {
    this.offlineProgressSubscription.remove();
    this.offlineMaxTilesSubscription.remove();
    this.offlineErrorSubscription.remove();
  }

  // You can call this method in componentWillMount lifecycle method, to see
  // if there's an offline pack already dowloaded. If you save this to state for example,
  // you can get a clear condition to show the download button or not
  getOfflinePack() {
    return Mapbox.getOfflinePacks()
      .then((packs) => {
        return packs;
      })
      .catch((err) => {
      });
  }

  // You can expand this method to bring up your UI component that shows the download progress
  // in addition to logging the action
  saveOfflinePack() {
    Mapbox.addOfflinePack(OFFLINE_PACK_CONFIG).then(() => {
      console.log('Download started');
    }).catch((err) => {
      console.log(err);
    });
  }

  // Similar to above, you can use this to delete previously saved pack
  deleteOfflinePack() {
    Mapbox.removeOfflinePack('MainMap')
      .then((info) => {
        if (info.deleted) {
          console.log(info.deleted);
        } else {
          console.log('No packs to delete');
        }
      })
      .catch((err) => {
        console.log(err);
      });
  }


  render() {
    const { navigateTo, trail } = this.props;
    var batt_icon = null;

    switch (trail.phydiff) {
      case 1:
        {
          batt_icon = require('../assets/icons/batt-1.png');
          break;
        }
      case 2:
        {
          batt_icon = require('../assets/icons/batt-2.png');
          break;
        }
      case 3:
        {
          batt_icon = require('../assets/icons/batt-3.png');
          break;
        }
    }

    const startMarker = {
      latitude: parseFloat(trail.startlocation.latitude),
      longitude: parseFloat(trail.startlocation.longitude),
      title: trail.startlocation.formattedAddress
    };

    return (
      <ScrollView style={{ marginTop: -1 }}>
        <NavigationBar title={trail.title.toUpperCase()} />

        <View styleName="horizontal">
          <View styleName="h-center" style={{ flex: 0.2 }}>
            <Title styleName="h-center" style={{ backgroundColor: '#000', color: '#FFF', paddingHorizontal: 5, fontSize: 12 }}>{trail.type.toUpperCase()}</Title>
            <Title styleName="h-center" style={{ backgroundColor: 'red', color: '#FFF', paddingHorizontal: 10, paddingVertical: 5 }}>{trail.number}</Title>
          </View>
          <View styleName="h-center" style={{ flex: 0.8 }}>
            <Title styleName="h-center" style={{ color: '#FFF', backgroundColor: '#000', padding: 17 }}>{trail.title.toUpperCase()}</Title>
          </View>
        </View>

        <Image styleName="large-banner" source={{ uri: trail.image && trail.image.url ? trail.image.url : undefined }} />

        <Row style={{ backgroundColor: '#000', marginTop: -34, paddingTop: 0, paddingBottom: 10, shadowColor: '#000', shadowOpacity: 0.5, shadowRadius: 5 }}>
          <View styleName="horizontal">
            <View style={{ flex: 0.1 }}>
              <Image source={require('../assets/icons/elevation.png')} style={{ width: 24, height: 24 }} />
            </View>
            <View style={{ flex: 0.25, marginBottom: -2 }}>
              <Subtitle style={{ color: '#fff' }}>{trail.altitude} m</Subtitle>
            </View>
            <View style={{ flex: 0.1 }}>
              <Image source={require('../assets/icons/length.png')} style={{ width: 24, height: 24 }} />
            </View>
            <View style={{ flex: 0.25, marginBottom: -2 }}>
              <Subtitle style={{ color: '#fff' }}>{trail.length} km</Subtitle>
            </View>
            <View style={{ flex: 0.1 }}>
              <Image source={batt_icon} style={{ width: 24, height: 24 }} />
            </View>
            <View style={{ flex: 0.2, marginBottom: -2 }}>
              <Subtitle style={{ color: '#fff' }}>{trail.phydiff}/3</Subtitle>
            </View>
          </View>
        </Row>

        <Divider styleName="line" />

        <Row>
          <Subtitle style={{ fontSize: 18 }}>{trail.header}</Subtitle>
        </Row>

        <Divider styleName="line" />

        <Row>
          <View styleName="horizontal">
            <View style={{ flex: 0.4 }}>
              <Subtitle>Start / Finish</Subtitle>
            </View>
            <View style={{ flex: 0.6 }}>
              <Text styleName="h-right">{trail.start}</Text>
            </View>
          </View>
        </Row>

        <Divider styleName="line" />

        <Row>
          <View styleName="horizontal">
            <View style={{ flex: 0.4 }}>
              <Subtitle>Via</Subtitle>
            </View>
            <View style={{ flex: 0.6 }}>
              <Text styleName="h-right">{trail.via}</Text>
            </View>
          </View>
        </Row>

        <Divider styleName="line" />

        <Row>
          <View styleName="horizontal">
            <View style={{ flex: 0.4 }}>
              <Subtitle>Altitude</Subtitle>
            </View>
            <View style={{ flex: 0.6 }}>
              <Text styleName="h-right">{trail.altitude} m</Text>
            </View>
          </View>
        </Row>

        <Divider styleName="line" />

        <Row>
          <View styleName="horizontal">
            <View style={{ flex: 0.4 }}>
              <Subtitle>Length</Subtitle>
            </View>
            <View style={{ flex: 0.6 }}>
              <Text styleName="h-right">{trail.length} km</Text>
            </View>
          </View>
        </Row>

        <Divider styleName="line" />

        <Row>
          <View styleName="horizontal">
            <View style={{ flex: 0.4 }}>
              <Subtitle>Physical difficulty</Subtitle>
            </View>
            <View style={{ flex: 0.6 }}>
              <Text styleName="h-right">{trail.phydiff}/3</Text>
            </View>
          </View>
        </Row>

        {trail.techdiff && trail.techdiff != "" &&
          <Divider styleName="line" />
          &&
          <Row>
            <View styleName="horizontal">
              <View style={{ flex: 0.4 }}>
                <Subtitle>Technical difficulty</Subtitle>
              </View>
              <View style={{ flex: 0.6 }}>
                <Text styleName="h-right">{trail.techdiff}/3</Text>
              </View>
            </View>
          </Row>
        }

        <Image styleName="large-banner" source={{ uri: trail.graph && trail.graph.url ? trail.graph.url : undefined }} />

        <Row>
          <View style={{ flex: 1 }}>
            <Subtitle>TRAIL DESCRIPTION</Subtitle>
            <Text />
            <Text>{trail.description}</Text>
          </View>
        </Row>

        <View styleName="large-banner">
          <TouchableOpacity
            onPress={() => navigateTo({
              screen: ext('Map'),
              props: {
                title: trail.title,
                gpsurl: trail.gps
              }
            })}>
            <InlineMap
              initialRegion={{
                latitude: startMarker.latitude,
                longitude: startMarker.longitude,
                latitudeDelta: 0.03,
                longitudeDelta: 0.03
              }}
              markers={[startMarker]}
              selectedMarker={startMarker}
              style={{ height: 160 }}
            />
          </TouchableOpacity>
        </View>

        <Row>
          <Button styleName="full-width" style={{ backgroundColor: '#000' }} onPress={() => Linking.openURL(trail.gps)}>
            <Icon name="photo" />
            <Text>DOWNLOAD GPS DATA</Text>
          </Button>
        </Row>
      </ScrollView>
    );
  }
}

export default connect(
  undefined,
  { navigateTo, find }
)(TrailDetails);
