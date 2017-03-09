import React, {
  Component
} from 'react';

import { connect } from 'react-redux';

import {
  ScrollView,
  Linking,
  TouchableOpacity
} from 'react-native';

import {
  Icon,
  Button,
  Row,
  Subtitle,
  Caption,
  Text,
  Title,
  View,
  Image,
  Divider,
  Overlay,
  Spinner,
  Tile
} from '@shoutem/ui';

import {
  InlineMap
} from '@shoutem/ui-addons';

import { navigateTo } from '@shoutem/core/navigation';
import { ext } from '../const';

const DOMParser = require('xmldom').DOMParser;


class TrailDetails extends Component {
	
	constructor(props)
	{
		super(props);
		this.state = {markers: []};
	}
	
	componentWillMount() {
		const { trail } = this.props;
		trail.gps = trail.gps ? trail.gps : 'http://www.zadarbikemagic.com/wp-content/uploads/2016/06/MTB-1-Veliko-Rujno-2.gpx';
		
		this.fetchMarkers(trail.gps);
	}
	
	fetchMarkers(xmlUrl) {
		
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

	renderMap(title) {
		const { markers } = this.state;
		const { navigateTo } = this.props;
		
		if(!markers.length)
		{
			return (
				<View styleName="h-center v-center">
					<Spinner />
				</View>
			);
		}
		
		return (
			<TouchableOpacity
				onPress={() => navigateTo({
					screen: ext('Map'),
					props: {
						markers: markers,
						title: title
					}
				})}>
				<InlineMap
					initialRegion={{
						latitude: markers[0].latitude,
						longitude: markers[0].longitude,
						latitudeDelta: 0.03,
						longitudeDelta: 0.03
					}}
					markers={[markers[0]]}
					selectedMarker={markers[0]}
					style={{height: 160}}
				/>
			</TouchableOpacity>
		);
	}
	
	
  render() {
	  
	const { trail } = this.props;
	const { navigateTo } = this.props;
	
	trail.title = trail.title ? trail.title : 'Test trail';
	  
    return (
      <ScrollView style={{marginTop: -1}}>
        <Image styleName="large-banner" source={{ uri: trail.image &&
        trail.image.url ? trail.image.url : undefined }}>
          <Overlay styleName="fill-parent">
            <Title style={{color: '#ffffff', fontSize: 24}}>{trail.title}</Title>
          </Overlay>
        </Image>
        <Row style={{backgroundColor: 'rgba(255,255,255,0.8)', marginTop: -43, paddingTop: 10, paddingBottom: 10}}>
			  <View styleName="horizontal">
			<View style={{flex: 0.1}}>
				 <Icon name="photo" style={{color: 'green'}} />
			</View>
			<View style={{flex: 0.25}}>
				 <Subtitle>{trail.altitude} m</Subtitle>
			</View>
			<View style={{flex: 0.1}}>
				 <Icon name="play" style={{color: 'blue'}} />
			</View>
			<View style={{flex: 0.25}}>
				 <Subtitle>{trail.length} km</Subtitle>
			</View>
			<View style={{flex: 0.1}}>
				 <Icon name="settings" style={{color: 'red'}} />
			</View>
			<View style={{flex: 0.2}}>
				 <Subtitle>{trail.phydiff}/3</Subtitle>
			</View>
          </View>
			</Row>

        <Divider styleName="line" />

		<Row>
			<Subtitle style={{fontSize: 18}}>{trail.header}</Subtitle>
		</Row>

        <Divider styleName="line" />		


        <Row>
          <View styleName="horizontal">
			<View style={{flex: 0.4}}>
				<Subtitle>Start / Finish</Subtitle>
			</View>
			<View style={{flex: 0.6}}>
				<Text styleName="h-right">{trail.start}</Text>
			</View>
          </View>
        </Row>

        <Divider styleName="line" />
		
		<Row>
          <View styleName="horizontal">
			<View style={{flex: 0.4}}>
				<Subtitle>Via</Subtitle>
			</View>
			<View style={{flex: 0.6}}>
				<Text styleName="h-right">{trail.via}</Text>
			</View>
          </View>
        </Row>

        <Divider styleName="line" />
		
		<Row>
          <View styleName="horizontal">
			<View style={{flex: 0.4}}>
				<Subtitle>Altitude</Subtitle>
			</View>
			<View style={{flex: 0.6}}>
				<Text styleName="h-right">{trail.altitude} m</Text>
			</View>
          </View>
        </Row>

        <Divider styleName="line" />
		
		<Row>
          <View styleName="horizontal">
			<View style={{flex: 0.4}}>
				<Subtitle>Length</Subtitle>
			</View>
			<View style={{flex: 0.6}}>
				<Text styleName="h-right">{trail.length} km</Text>
			</View>
          </View>
        </Row>

        <Divider styleName="line" />
		
		<Row>
          <View styleName="horizontal">
			<View style={{flex: 0.4}}>
				<Subtitle>Physical difficulty</Subtitle>
			</View>
			<View style={{flex: 0.6}}>
				<Text styleName="h-right">{trail.phydiff}/3</Text>
			</View>
          </View>
        </Row>

        <Divider styleName="line" />
		
		<Row>
          <View styleName="horizontal">
			<View style={{flex: 0.4}}>
				<Subtitle>Technical difficulty</Subtitle>
			</View>
			<View style={{flex: 0.6}}>
				<Text styleName="h-right">{trail.techdiff}/3</Text>
			</View>
          </View>
        </Row>
        <Image styleName="large-banner" source={{ uri: trail.graph &&
        trail.graph.url ? trail.graph.url : undefined }}>
        </Image>
        <Row>
        	<View style={{flex: 1}}>
              <Subtitle>TRAIL DESCRIPTION</Subtitle>
              <Text /> 
              <Text>{trail.description}</Text>
            </View>
        </Row>
        <View styleName="large-banner">
				{this.renderMap(trail.title)}
		</View>
		 <Row>
			<Button styleName="full-width" onPress={() => Linking.openURL(trail.gps)}>
					<Icon name="photo" />
				<Text>DOWLNLOAD GPS DATA</Text>
			</Button>
		</Row>
      </ScrollView>
    );
  }
}


function parseXMLData(gpxData)
{
	var i = 0, markers = [];
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

export default connect(
  undefined,
  { navigateTo }
)(TrailDetails);
