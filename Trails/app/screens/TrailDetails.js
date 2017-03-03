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
				const markers = makeMarkers(parseXMLData(responseXML));
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
					markers={markers}
					selectedMarker={markers[0]}
					style={{height: 240}}
				/>
			</TouchableOpacity>
		);
	}
	
	
  render() {
	  
	const { trail } = this.props;
	const { navigateTo } = this.props;
	
	trail.title = trail.title ? trail.title : 'Test trail';
	  
    return (
      <ScrollView style={{marginTop: -70}}>
        <Image styleName="featured" source={{ uri: trail.image &&
        trail.image.url ? trail.image.url : undefined }}>
          <Overlay styleName="fill-parent">
            <Title>{trail.title}</Title>
            <Subtitle>{trail.header}</Subtitle>
          </Overlay>
        </Image>
		
		<Row>
			<View styleName="collapsed">
				<Divider styleName="section-header">
					<Caption>MAP</Caption>
				</Divider>
				
				{this.renderMap(trail.title)}
			</View>
		</Row>

        <Row>
          <Text>{trail.description}</Text>
        </Row>

        <Divider styleName="line" />
		
		<Row>
          <Icon name="pin" />
          <View styleName="horizontal">
			<View style={{flex: 0.5}}>
				<Subtitle>Location</Subtitle>
			</View>
			<View style={{flex: 0.5}}>
				<Text>{trail.location}</Text>
			</View>
          </View>
        </Row>

        <Divider styleName="line" />

        <Row>
          <Icon name="pin" />
          <View styleName="horizontal">
			<View style={{flex: 0.5}}>
				<Subtitle>Start / Finish</Subtitle>
			</View>
			<View style={{flex: 0.5}}>
				<Text>{trail.start}</Text>
			</View>
          </View>
        </Row>

        <Divider styleName="line" />
		
		<Row>
          <Icon name="pin" />
          <View styleName="horizontal">
			<View style={{flex: 0.5}}>
				<Subtitle>Via</Subtitle>
			</View>
			<View style={{flex: 0.5}}>
				<Text>{trail.via}</Text>
			</View>
          </View>
        </Row>

        <Divider styleName="line" />
		
		<Row>
          <Icon name="about" />
          <View styleName="horizontal">
			<View style={{flex: 0.5}}>
				<Subtitle>Altitude</Subtitle>
			</View>
			<View style={{flex: 0.5}}>
				<Text>{trail.altitude} m</Text>
			</View>
          </View>
        </Row>

        <Divider styleName="line" />
		
		<Row>
          <Icon name="about" />
          <View styleName="horizontal">
			<View style={{flex: 0.5}}>
				<Subtitle>Length</Subtitle>
			</View>
			<View style={{flex: 0.5}}>
				<Text>{trail.length} km</Text>
			</View>
          </View>
        </Row>

        <Divider styleName="line" />
		
		<Row>
          <Icon name="about" />
          <View styleName="horizontal">
			<View style={{flex: 0.5}}>
				<Subtitle>Physical difficulty</Subtitle>
			</View>
			<View style={{flex: 0.5}}>
				<Text>{trail.phydiff}/3</Text>
			</View>
          </View>
        </Row>

        <Divider styleName="line" />
		
		<Row>
          <Icon name="about" />
          <View styleName="horizontal">
			<View style={{flex: 0.5}}>
				<Subtitle>Technical difficulty</Subtitle>
			</View>
			<View style={{flex: 0.5}}>
				<Text>{trail.techdiff}/3</Text>
			</View>
          </View>
        </Row>

        <Divider styleName="line" />
		
		 <Row>
			<Button styleName="full-width" onPress={() => Linking.openURL(trail.gps)}>
				<Icon name="web" />
				<Text>GPS DATA</Text>
			</Button>
		</Row>
		
		<Divider styleName="line" />
      </ScrollView>
    );
  }
}


function parseXMLData(xmlData)
{
	const parser = new DOMParser();
	return parser.parseFromString(xmlData).getElementsByTagName('trkpt');
}

function makeMarkers(gpxData)
{
	var i = 0, markers = [];
	
	for(i = 0; i < gpxData.length; i += 10)
	{
		markers[markers.length] = {
			latitude: parseFloat(gpxData[i].getAttribute('lat')),
			longitude: parseFloat(gpxData[i].getAttribute('lon')),
			title: ''
		};
	}
	
	return markers;
}

export default connect(
  undefined,
  { navigateTo }
)(TrailDetails);
