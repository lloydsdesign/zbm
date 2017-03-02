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
  Tile
} from '@shoutem/ui';

import {
  InlineMap
} from '@shoutem/ui-addons';

import { navigateTo } from '@shoutem/core/navigation';
import { ext } from '../const';


class TrailDetails extends Component {
  render() {
    const { trail } = this.props;
	const { navigateTo } = this.props;
	
	const markers = [
		{
			latitude: parseFloat(45.088645),
			longitude: parseFloat(14.119623),
			title: trail.title
		},
		{
			latitude: parseFloat(45.090109),
			longitude: parseFloat(14.123096),
			title: trail.title
		},
		{
			latitude: parseFloat(45.090900),
			longitude: parseFloat(14.114427),
			title: trail.title
		}
	];
	
	const openMap = () => navigateTo({
		screen: ext('Map'),
		props: {
			markers: markers.length ? markers : undefined,
			title: trail.title ? trail.title : ""
		}
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
		
		<Row>
			<View styleName="collapsed">
				<Divider styleName="section-header">
					<Caption>MAP</Caption>
				</Divider>
				
				<TouchableOpacity onPress={openMap}>
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

export default connect(
  undefined,
  { navigateTo }
)(TrailDetails);
