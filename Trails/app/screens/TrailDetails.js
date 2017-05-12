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
  Tile,
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

import {
	ext,
	MGL_TOKEN,
	OFFLINE_PACK_CONFIG
} from '../const';

const battIcons = [
	require('../assets/icons/batt-1.png'),
	require('../assets/icons/batt-2.png'),
	require('../assets/icons/batt-3.png')
];

const techIcons = [
	require('../assets/icons/tech-1.png'),
	require('../assets/icons/tech-2.png'),
	require('../assets/icons/tech-3.png')
];

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
	
	NetInfo.isConnected.addEventListener('change', this.handleConnectivityChange);
	NetInfo.isConnected.fetch().done((isConnected) => {
		const { trail } = this.props;
		
		this.getMarkers().then((markers) => {
			if(isConnected && !markers.length) this.fetchMarkers(trail.gps);
			
			this.setState({
				markers,
				isConnected
			});
		});
	});

    this.offlineProgressSubscription = Mapbox.addOfflinePackProgressListener((progress) => {
		const resourcesLeft = progress.maximumResourcesExpected - progress.countOfResourcesCompleted;
		if(!resourcesLeft) this.getOfflinePack();
		
		this.setState({
			packDownloading: resourcesLeft,
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
  
	handleConnectivityChange = (isConnected) => {
		this.setState({ isConnected });
	};
  
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
  
  storeMarkers(markers)
  {
	  const { trail } = this.props;
	  const key = 'trail_'+ trail.id;
	  
	  AsyncStorage.removeItem(key).then(() => {
		  AsyncStorage.setItem(key, JSON.stringify(markers));
	  });
  }
  
  getMarkers()
  {
	  const { trail } = this.props;
	  const key = 'trail_'+ trail.id;
	  
	  return AsyncStorage.getItem(key).then((markers) => {
		  if(markers) markers = JSON.parse(markers);
		  if(!markers) markers = [];
		  return markers;
	  });
  }

  getOfflinePack() {
    return Mapbox.getOfflinePacks()
      .then((packs) => {
        this.setState({ offlinePacks: packs });
      });
  }

  saveOfflinePack() {
	return this.deleteOfflinePack().then(() => {
		Mapbox.addOfflinePack(OFFLINE_PACK_CONFIG).then(() => {
		  this.setState({ packDownloading: true });
		});
	});
  }

  deleteOfflinePack() {
    return Mapbox.removeOfflinePack('MainMap')
      .then((info) => {
        this.setState({ packDownloading: false });
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
				<Button styleName="full-width" style={{ backgroundColor: '#FF2222' }} onPress={() => this.saveOfflinePack()}>
					<Icon name="down-arrow" />
					<Text>DOWNLOAD OFFLINE MAPS</Text>
				</Button>
			);
		}
		
		var { packProgress, packBytesCompleted } = this.state;
		
		packBytesCompleted /= 1024 * 1024;
		packBytesCompleted = parseFloat(packBytesCompleted.toFixed(2));
		packProgress = '('+ packProgress +'% - '+ packBytesCompleted +' MB)';
		
		return (
			<Button styleName="full-width" style={{ backgroundColor: '#FF2222' }} onPress={() => this.deleteOfflinePack()}>
				<Icon name="close" />
				<Text>CANCEL {packProgress}</Text>
				<Spinner style={{color: '#fff'}} />
			</Button>
		);
	}
	
	renderInlineMap()
	{
		const { markers } = this.state;
		if(!markers.length)
		{
			return (
				<Tile styleName="clear text-centric">
					<Spinner style={{ size: 'large', color: '#fff' }} />
				</Tile>
			);
		}
		
		const { navigateTo, trail } = this.props;
		
		const marker = {
			latitude: markers[0][0],
			longitude: markers[0][1]
		};
		
		return (
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
						latitude: marker.latitude,
						longitude: marker.longitude,
						latitudeDelta: 0.03,
						longitudeDelta: 0.03
					}}
					markers={[marker]}
					selectedMarker={marker}
					style={{ height: 300 }}
				/>
			</TouchableOpacity>
		);
	}


  render() {
    const { trail } = this.props;
	const batt_icon = battIcons[trail.phydiff - 1];
	const tech_icon = techIcons[trail.techdiff - 1];

    return (
      <ScrollView style={{ marginTop: -1 }}>
        <NavigationBar title={trail.title.toUpperCase()} />

        <Image styleName="large-banner" source={{ uri: trail.image && trail.image.url ? trail.image.url : undefined }} />

        <Row>
          <View styleName="horizontal h-center" style={{bottom: 35, paddingTop: 12, paddingBottom: 12, backgroundColor: '#e60005'}}>
            <Subtitle style={{color: '#FFF', fontSize: 16, paddingLeft: 20, paddingRight: 20, textAlign: 'center'}}>{trail.header}</Subtitle>
          </View>
        </Row>

    	<Row>
          <View styleName="horizontal">
            <View style={{ flex: 0.5 }}>
              <Subtitle>Start / Finishing point</Subtitle>
            </View>
            <View style={{ flex: 0.5 }}>
              <Text styleName="h-right">{trail.start}</Text>
            </View>
          </View>
        </Row>

        <Divider styleName="line" />

        <Row>
          <View styleName="horizontal">
            <View style={{ flex: 0.5 }}>
              <Subtitle>Via</Subtitle>
            </View>
            <View style={{ flex: 0.5 }}>
              <Text styleName="h-right">{trail.via}</Text>
            </View>
          </View>
        </Row>


        <Divider styleName="line" />

        <Row>
          <View styleName="horizontal">
            <View style={{ flex: 0.5 }}>
              <Subtitle>Length</Subtitle>
            </View>
            <View style={{ paddingRight: 10,flex: 0.4 }}>
              <Text styleName="h-right">{trail.length} km</Text>
            </View>
             <View style={{ flex: 0.1 }}>
              <Image source={require('../assets/icons/arrow.png')} style={{width: 24, height: 24}} />
            </View>
          </View>
        </Row>

        <Divider styleName="line" />

        <Row>
          <View styleName="horizontal">
            <View style={{ flex: 0.5 }}>
              <Subtitle>Physical difficulty</Subtitle>
            </View>
            <View style={{ flex: 0.4 }}>
              <Text styleName="h-right">{trail.phydiff}/3</Text>
            </View>
              <View style={{ paddingLeft: 10, flex: 0.1 }}>
              	<Image source={batt_icon} style={{width: 24, height: 24}} />
              </View>
          </View>
        </Row>

		<Divider styleName="line" />

        {trail.techdiff && trail.techdiff != "" &&
          <Divider styleName="line" />
          &&
          <Row>
            <View styleName="horizontal">
              <View style={{ flex: 0.5 }}>
                <Subtitle>Technical difficulty</Subtitle>
              </View>
              <View style={{ flex: 0.4 }}>
                <Text styleName="h-right">{trail.techdiff}/3</Text>
              </View>
              <View style={{ paddingLeft: 10, flex: 0.1 }}>
              	<Image source={tech_icon} style={{width: 24, height: 24}} />
              </View>
            </View>
          </Row>
        }
        
        <Divider styleName="line" />

        <Row style={{paddingTop: 10}}>
          <View styleName="horizontal">
            <View style={{ flex: 0.5 }}>
              <Subtitle>Elevation</Subtitle>
            </View>
            <View style={{ paddingRight: 10, flex: 0.4 }}>
              <Text styleName="h-right">{trail.altitude} m</Text>
            </View>
            <View style={{flex: 0.1 }}>
             <Image source={require('../assets/icons/elev.png')} style={{width: 24, height: 24}} />
            </View>
          </View>
        </Row>

        <View styleName="h-center v-center" style={{ height: 300 }}>
			{this.renderInlineMap()}
        </View>
		
		<Row>{this.renderOfflineButton()}</Row>

		<Row style={{paddingTop: 0}}>
          <Button styleName="full-width" style={{ backgroundColor: '#FFF', borderWidth: 2, borderColor: '#FF0000' }} onPress={() => Linking.openURL(trail.pdf)}>
            <Icon name="down-arrow" style={{color: '#FF0000'}} />
            <Text style={{color: '#FF0000'}}>MAP DOWNLOAD</Text>
          </Button>
        </Row>

        <Row style={{paddingTop: 0}}>
          <Button styleName="full-width" style={{ backgroundColor: '#000' }} onPress={() => Linking.openURL(trail.gps)}>
            <Icon name="down-arrow" />
            <Text>DOWNLOAD GPS DATA</Text>
          </Button>
        </Row>
        
        <Row>
          <View style={{ flex: 1, paddingTop: 20}}>
            <Subtitle>ROUTE DESCRIPTION</Subtitle>
          </View>
        </Row>
        
        <Image styleName="large-banner" style={{height: 100}}source={{ uri: trail.graph && trail.graph.url ? trail.graph.url : undefined }} />
        
        <Row>
          <View style={{ flex: 1, paddingTop: 20}}>
            <Subtitle>TRAIL DESCRIPTION</Subtitle>
            <Text />
            <Text style={{fontSize: 14}}>{trail.description}</Text>
          </View>
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