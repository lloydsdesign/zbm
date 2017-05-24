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
const DOMParser = require('xmldom').DOMParser;

import {
	ext,
	MGL_TOKEN,
	OFFLINE_PACK_CONFIG
} from '../const';

const trailTypes = ['MTB', 'ROAD', 'FAMILY'];
const trailTypeColors = ['#e60005', '#3d99d5', '#37a829'];

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


class TrailDetails extends Component
{
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

  componentDidMount()
  {
    Mapbox.setAccessToken(MGL_TOKEN);
	Mapbox.setOfflinePackProgressThrottleInterval(1000);
	
	this.getOfflinePack();
	
	NetInfo.isConnected.addEventListener('change', this.handleConnectivityChange);
	NetInfo.isConnected.fetch().done((isConnected) => {
		const { trail } = this.props;
		
		this.getMarkers().then((markers) => {
			if(isConnected && !markers.length)
			{
				this.fetchMarkers(trail.gps).then((markers) => {
					this.storeMarkers(markers);
					
					this.setState({
						markers,
						isConnected
					});
				});
			}
			else
			{
				this.setState({
					markers,
					isConnected
				});
			}
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

	componentWillUnmount()
	{
		this.offlineProgressSubscription.remove();
		this.offlineMaxTilesSubscription.remove();
		this.offlineErrorSubscription.remove();
		NetInfo.isConnected.removeEventListener('change', this.handleConnectivityChange);
	}
  
	handleConnectivityChange = (isConnected) => {
		const { trail } = this.props;
		
		this.getMarkers().then((markers) => {
			if(isConnected && !markers.length)
			{
				this.fetchMarkers(trail.gps).then((markers) => {
					this.storeMarkers(markers);
					
					this.setState({
						markers,
						isConnected
					});
				});
			}
			else
			{
				this.setState({
					markers,
					isConnected
				});
			}
		});
	};
  
	fetchMarkers(xmlUrl)
	{
		return fetch(xmlUrl)
			.then((response) => response.text())
			.then((responseXML) => parseXMLData(responseXML))
			.catch((error) => console.error(error));
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

	getOfflinePack()
	{
		return Mapbox.getOfflinePacks()
			.then((packs) => {
				this.setState({ offlinePacks: packs });
			});
	}

	saveOfflinePack()
	{
		return this.deleteOfflinePack().then(() => {
			Mapbox.addOfflinePack(OFFLINE_PACK_CONFIG).then(() => {
			  this.setState({ packDownloading: true });
			});
		});
	}

	deleteOfflinePack()
	{
		return Mapbox.removeOfflinePack('MainMap')
			.then((info) => {
				this.setState({ packDownloading: false });
			});
	}
  
	renderOfflineButton()
	{
		const { offlinePacks, packDownloading, isConnected } = this.state;
		if(!isConnected) return null;
		
		if(offlinePacks.length)
		{
			return (
				<View styleName="vertical h-center v-center" style={{ height: 24 }}>
					<Text style={{ color: '#fff' }}>OFFLINE MAPS UP TO DATE</Text>
				</View>
			);
		}
		
		if(!packDownloading)
		{
			return (
				<Row>
					<Button styleName="full-width" style={{ backgroundColor: '#FF2222' }} onPress={() => this.saveOfflinePack()}>
						<Image source={require('../assets/icons/download.png')} style={{ width: 24, height: 24, marginRight: 10}} />
						<Text>RIDE IN OFFLINE MODE</Text>
					</Button>
				</Row>
			);
		}
		
		var { packProgress, packBytesCompleted } = this.state;
		
		packBytesCompleted /= 1024 * 1024;
		packBytesCompleted = parseFloat(packBytesCompleted.toFixed(2));
		packProgress = '('+ packProgress +'% - '+ packBytesCompleted +' MB)';
		
		return (
			<Row>
				<Button styleName="full-width" style={{ backgroundColor: '#FF2222' }} onPress={() => this.deleteOfflinePack()}>
					<Icon name="close" />
					<Text>CANCEL {packProgress}</Text>
					<Spinner style={{color: '#fff'}} />
				</Button>
			</Row>
		);
	}
	
	renderExtraButtons()
	{
		const { isConnected } = this.state;
		if(!isConnected) return null;
		
		const { trail } = this.props;
		
		return (
			<View>
				<Row style={{ paddingTop: 0 }}>
				  <Button styleName="full-width" style={{ backgroundColor: '#FFF', borderWidth: 2, borderColor: '#FF0000' }} onPress={() => Linking.openURL(trail.pdf)}>
					<Image source={require('../assets/icons/pdf.png')} style={{ width: 24, height: 24, marginRight: 10 }} />
					<Text style={{color: '#FF0000'}}>DOWNLOAD MAP (PDF)</Text>
				  </Button>
				</Row>
				
				<Row style={{ paddingTop: 0 }}>
				  <Button styleName="full-width" style={{ backgroundColor: '#000' }} onPress={() => Linking.openURL(trail.gps)}>
					<Image source={require('../assets/icons/compass.png')} style={{ width: 24, height: 24, marginRight: 10 }} />
					<Text>USE GPS DATA IN 3RD PARTY APP</Text>
				  </Button>
				</Row>
			</View>
		);
	}
	
	renderInlineMap()
	{
		const { navigateTo, trail } = this.props;
		const { markers, isConnected } = this.state;
		
		if(isConnected)
		{
			if(!markers.length)
			{
				return (
					<View styleName="vertical h-center v-center" style={{ height: 300 }}>
						<Spinner style={{ size: 'large', color: '#fff' }} />
					</View>
				);
			}
			
			const marker = {
				latitude: markers[0][0],
				longitude: markers[0][1]
			};
			
			return (
				<View style={{ height: 300 }}>
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
				</View>
			);
		}
		
		if(!markers.length)
		{
			return (
				<View styleName="vertical h-center v-center" style={{ height: 24 }}>
					<Text style={{ color: '#fff' }}>OFFLINE MAP NOT PRESENT</Text>
				</View>
			);
		}
		
		return (
			<Row style={{ paddingTop: 0 }}>
				<Button styleName="full-width" onPress={() => navigateTo({
					screen: ext('Map'),
					props: {
						title: trail.title,
						markers: markers
					}
				})}>
					<Icon name="pin" />
					<Text>OPEN TRAIL MAP</Text>
				</Button>
			</Row>
		);
	}


  render()
  {
    const { trail } = this.props;
	
	const batt_icon = battIcons[trail.phydiff - 1];
	var tech_icon = null;
	
	if(trail.techdiff && trail.techdiff != "") tech_icon = techIcons[trail.techdiff - 1];
	const headerColor = trailTypeColors[trailTypes.indexOf(trail.type)];

    return (
      <ScrollView style={{ marginTop: -1 }}>
        <NavigationBar title={trail.title.toUpperCase()} />

        <Image styleName="large-banner" source={{ uri: trail.image }} />

        <Row>
          <View styleName="horizontal h-center" style={{ bottom: 20, paddingTop: 20, paddingBottom: 15, backgroundColor: headerColor }}>
            <Subtitle style={{ color: '#FFF', fontSize: 16, paddingLeft: 20, paddingRight: 20, textAlign: 'center' }}>{trail.header}</Subtitle>
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
            <View style={{ paddingRight: 10, flex: 0.4 }}>
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

        {tech_icon && (
			<View styleName="vertical">
				<Divider styleName="line" />

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
			</View>
        )}
        
        <Divider styleName="line" />

        <Row style={{ paddingTop: 10 }}>
          <View styleName="horizontal">
            <View style={{ flex: 0.5 }}>
              <Subtitle>Elevation</Subtitle>
            </View>
            <View style={{ paddingRight: 10, flex: 0.4 }}>
              <Text styleName="h-right">{trail.altitude} m</Text>
            </View>
            <View style={{ flex: 0.1 }}>
             <Image source={require('../assets/icons/elev.png')} style={{ width: 24, height: 24 }} />
            </View>
          </View>
        </Row>

		{this.renderInlineMap()}
		{this.renderOfflineButton()}
		{this.renderExtraButtons()}
        
        <Row>
          <View style={{ flex: 1, paddingTop: 20}}>
            <Subtitle>ROUTE DESCRIPTION</Subtitle>
          </View>
        </Row>
        
        <Image styleName="large-banner" style={{ height: 100 }} source={{ uri: trail.graph }} />
        
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
	gpxData = new DOMParser().parseFromString(gpxData, 'text/xml').getElementsByTagName('trkpt');
	
	if(!gpxData) return [];
	var i, markers = [];

	for(i = 0; i < gpxData.length; i += 10)
	{
		markers[markers.length] = [
			parseFloat(gpxData[i].getAttribute('lat')),
			parseFloat(gpxData[i].getAttribute('lon'))
		];
	}

	return markers;
}