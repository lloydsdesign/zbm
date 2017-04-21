import React, {
  Component
} from 'react';

import {
  ScrollView,
  Linking,
  NetInfo,
  AsyncStorage
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
  TouchableOpacity,
  Spinner
} from '@shoutem/ui';

import Mapbox from 'react-native-mapbox-gl';
import { connect } from 'react-redux';
import { InlineMap } from '@shoutem/ui-addons';
import { NavigationBar } from '@shoutem/ui/navigation';
import { navigateTo } from '@shoutem/core/navigation';
import { ext, MGL_TOKEN, OFFLINE_PACK_CONFIG } from '../const';

const DOMParser = require('xmldom').DOMParser;


class TrailDetails extends Component {
  constructor(props)
  {
    super(props);
    this.saveOfflinePack = this.saveOfflinePack.bind(this);
    this.getOfflinePack = this.getOfflinePack.bind(this);
    this.deleteOfflinePack = this.deleteOfflinePack.bind(this);
	
	this.state = {
		isConnected: null,
		markers: [],
		offlinePacks: [],
		packDownloading: false,
		packProgress: 0,
		packBytesCompleted: 0
	};
  }

  componentWillMount()
  {
    Mapbox.setAccessToken(MGL_TOKEN);
	Mapbox.setOfflinePackProgressThrottleInterval(1000);
	
	this.getOfflinePack();
	
	NetInfo.isConnected.addEventListener('change', (isConnected) => {
		this.setState({ isConnected });
	});
	
	NetInfo.isConnected.fetch().done((isConnected) => {
		const { trail } = this.props;
		
		if(isConnected) this.fetchMarkers(trail.gps);
		else this.getMarkers();
		
		this.setState({ isConnected });
	});

    this.offlineProgressSubscription = Mapbox.addOfflinePackProgressListener((progress) => {
	  this.setState({
		  packDownloading: progress.maximumResourcesExpected - progress.countOfResourcesCompleted,
		  packProgress: Math.floor((100 * progress.countOfResourcesCompleted) / progress.maximumResourcesExpected),
		  packBytesCompleted: progress.countOfBytesCompleted
		});
    });
	
    this.offlineMaxTilesSubscription = Mapbox.addOfflineMaxAllowedTilesListener((tiles) => {
      console.log('offline max allowed tiles', tiles);
	  this.deleteOfflinePack();
    });

    this.offlineErrorSubscription = Mapbox.addOfflineErrorListener((error) => {
      console.log('offline error', error);
	  this.deleteOfflinePack();
    });
  }

  componentWillUnmount() {
    this.offlineProgressSubscription.remove();
    this.offlineMaxTilesSubscription.remove();
    this.offlineErrorSubscription.remove();
	NetInfo.isConnected.removeEventListener('change', this.handleConnectivityChange);
  }
  
  fetchMarkers(xmlUrl) {
    return fetch(xmlUrl)
      .then((response) => response.text())
      .then((responseXML) => {
		const markers = parseXMLData(responseXML);
		this.storeMarkers(markers);
        this.setState({ markers });
      })
      .catch((error) => {
        console.error(error);
      });
  }
  
  async storeMarkers(markers)
  {
	  const { trail } = this.props;
	  const key = 'trail_'+ trail.id;
	  
	  await AsyncStorage.removeItem(key);
	  await AsyncStorage.setItem(key, JSON.stringify(markers));
  }
  
  async getMarkers()
  {
	  const { trail } = this.props;
	  const key = 'trail_'+ trail.id;
	  
	  var markers = await AsyncStorage.getItem(key);
	  if(markers) markers = JSON.parse(markers);
	  
	  if(!markers) markers = [];
	  this.setState({ markers });
  }

  getOfflinePack() {
    return Mapbox.getOfflinePacks()
      .then((packs) => {
        this.setState({ offlinePacks: packs });
      })
      .catch((err) => {
      });
  }

  async saveOfflinePack() {
	await this.deleteOfflinePack();
    Mapbox.addOfflinePack(OFFLINE_PACK_CONFIG).then(() => {
      this.setState({ packDownloading: true });
    }).catch((err) => {
      console.log(err);
    });
  }

  deleteOfflinePack() {
    Mapbox.removeOfflinePack('MainMap')
      .then((info) => {
        this.setState({ packDownloading: false });
      })
      .catch((err) => {
        console.log(err);
      });
  }
  
	renderOfflineButton()
	{
		const { offlinePacks, packDownloading } = this.state;
		
		if(offlinePacks.length)
		{
			return (
				<View styleName="h-center v-center">
					<Text>OFFLINE MAPS UP TO DATE</Text>
				</View>
			);
		}
		
		if(!packDownloading)
		{
			return (
				<Button styleName="full-width" style={{ backgroundColor: '#009245' }} onPress={() => this.saveOfflinePack()}>
					<Icon name="down-arrow" />
					<Text>DOWNLOAD OFFLINE MAPS</Text>
				</Button>
			);
		}
		
		var { packProgress, packBytesCompleted } = this.state;
		
		packBytesCompleted /= 1024 * 1024;
		packBytesCompleted = packBytesCompleted.toFixed(2);
		packProgress = '('+ packProgress +'% - '+ packBytesCompleted +' MB)';
		
		return (
			<Button styleName="full-width" style={{ backgroundColor: '#FF2222' }} onPress={() => this.deleteOfflinePack()}>
				<Icon name="close" />
				<Text>CANCEL {packProgress}</Text>
				<Spinner style={{color: '#fff'}} />
			</Button>
		);
	}


  render() {
	const { markers } = this.state;
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
                markers: markers
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
		
		<Row>{this.renderOfflineButton()}</Row>

        <Row>
          <Button styleName="full-width" style={{ backgroundColor: '#000' }} onPress={() => Linking.openURL(trail.gps)}>
            <Icon name="down-arrow" />
            <Text>DOWNLOAD GPS DATA</Text>
          </Button>
        </Row>
      </ScrollView>
    );
  }
}

export default connect(
  undefined,
  { navigateTo }
)(TrailDetails);

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