import React, {
  Component
} from 'react';

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
  Tile
} from '@shoutem/ui';

import {
  InlineMap
} from '@shoutem/ui-addons';

import { navigateTo } from '@shoutem/core/navigation';
import { ext } from '../const';


export default class TrailDetails extends Component {
  render() {
    const { trail } = this.props;
	
	const marker = [
		{
			latitude: parseFloat(43),
			longitude: parseFloat(16),
			title: trail.title
		},
		{
			latitude: parseFloat(44),
			longitude: parseFloat(17),
			title: trail.title
		},
		{
			latitude: parseFloat(43.14258),
			longitude: parseFloat(17),
			title: trail.title
		},
		{
			latitude: parseFloat(44),
			longitude: parseFloat(16),
			title: trail.title
		}
	];
	
	const openMap = () => navigateTo({
		screen: ext('Map'),
		props: {marker: markers[0], title: trail.title }
	});

    return (
      <ScrollView style={{marginTop: -70}}>
        <Image styleName="featured" source={{ uri: trail.image &&
        trail.image.url ? trail.image.url : undefined }}>
          <Overlay styleName="fill-parent">
            <Title>{trail.title}</Title>
            <Subtitle>{trail.header}</Subtitle>
          </Overlay>
        </Image>
		
		<Divider styleName="section-header">
			<Caption>MAP</Caption>
		</Divider>
		
		<Row>
			<View styleName="collapsed">
				<TouchableOpacity onPress={openMap}>
					<InlineMap
						initialRegion={{
							longitude: markers[0].longitude,
							latitude: markers[0].latitude,
							latitudeDelta: 0.03,
							longitudeDelta: 0.03
						}}
						markers={markers}
						selectedMarker={markers[0]}
						style={{height: 240}}
					/>
				</TouchableOpacity>
			</View>
        </Row>

        <Divider styleName="line" />

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
