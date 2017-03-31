import React, {
  Component
} from 'react';

import { connect } from 'react-redux';

import {
  ScrollView,
  Linking
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
  Tile,
  TouchableOpacity
} from '@shoutem/ui';

import { find } from '@shoutem/redux-io';
import { InlineMap } from '@shoutem/ui-addons';
import { NavigationBar } from '@shoutem/ui/navigation';
import { navigateTo } from '@shoutem/core/navigation';
import { ext } from '../const';


class TrailDetails extends Component
{
	componentDidMount()
	{
		const { find } = this.props;
		
		find(ext('Trails'), 'all', {
			include: ['image', 'graph']
		});
	}
	
	
  render()
  {
	const { navigateTo, trail } = this.props;
	var batt_icon = null;
	
	switch(trail.phydiff)
	{
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
		<ScrollView style={{marginTop: -1}}>
			<NavigationBar title={trail.title.toUpperCase()} />
			
			<View styleName="horizontal">
				<View styleName="h-center" style={{flex: 0.2}}>
				  <Title styleName="h-center" style={{backgroundColor: '#000', color: '#FFF', paddingHorizontal: 5, fontSize: 12}}>{trail.type.toUpperCase()}</Title>
				  <Title styleName="h-center" style={{backgroundColor: 'red', color: '#FFF', paddingHorizontal: 10, paddingVertical: 5}}>{trail.number}</Title>
				</View>
				<View styleName="h-center" style={{flex: 0.8}}>
					<Title styleName="h-center" style={{color: '#FFF', backgroundColor: '#000', padding: 17}}>{trail.title.toUpperCase()}</Title>      
				</View>
			</View>

			<Image styleName="large-banner" source={{ uri: trail.image && trail.image.url ? trail.image.url : undefined }} />

			<Row style={{backgroundColor: '#000', marginTop: -34, paddingTop: 0, paddingBottom: 10, shadowColor: '#000', shadowOpacity: 0.5, shadowRadius: 5}}>
				<View styleName="horizontal">
					<View style={{flex: 0.1}}>
						<Image source={require('../assets/icons/elevation.png')} style={{width: 24, height: 24}} />
					</View>
					<View style={{flex: 0.25, marginBottom: -2}}>
						<Subtitle style={{color: '#fff'}}>{trail.altitude} m</Subtitle>
					</View>
					<View style={{flex: 0.1}}>
						<Image source={require('../assets/icons/length.png')} style={{width: 24, height: 24}} />
					</View>
					<View style={{flex: 0.25, marginBottom: -2}}>
						<Subtitle style={{color: '#fff'}}>{trail.length} km</Subtitle>
					</View>
					<View style={{flex: 0.1}}>
						<Image source={batt_icon} style={{width: 24, height: 24}} />
					</View>
					<View style={{flex: 0.2, marginBottom: -2}}>
						<Subtitle style={{color: '#fff'}}>{trail.phydiff}/3</Subtitle>
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

			{trail.techdiff && trail.techdiff != "" &&
				<Divider styleName="line" />
			&&
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
			}

			<Image styleName="large-banner" source={{ uri: trail.graph && trail.graph.url ? trail.graph.url : undefined }} />

			<Row>
				<View style={{flex: 1}}>
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
						style={{height: 160}}
					/>
				</TouchableOpacity>
			</View>

			 <Row>
				<Button styleName="full-width" style={{backgroundColor: '#000'}} onPress={() => Linking.openURL(trail.gps)}>
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
