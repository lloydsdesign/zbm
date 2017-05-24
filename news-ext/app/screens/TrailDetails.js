import React, {
  Component
} from 'react';

import {
  Icon,
  Row,
  Subtitle,
  Text,
  Title,
  View,
  Image,
  Divider
} from '@shoutem/ui';

import { InlineMap } from '@shoutem/ui-addons';
import { NavigationBar } from '@shoutem/ui/navigation';
import { ScrollView } from 'react-native';

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


export default class TrailDetails extends Component
{
  render()
  {
    const { trail } = this.props;
	
	const batt_icon = battIcons[trail.phydiff - 1];
	var tech_icon = null;
	
	if(trail.techdiff && trail.techdiff != "") tech_icon = techIcons[trail.techdiff - 1];
	const headerColor = trailTypeColors[trailTypes.indexOf(trail.type)];
	
	const marker = {
		latitude: trail.startlocation.latitude,
		longitude: trail.startlocation.longitude
	};

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

		<View styleName="large-banner">
			<InlineMap
				initialRegion={{
					latitude: marker.latitude,
					longitude: marker.longitude,
					latitudeDelta: 0.03,
					longitudeDelta: 0.03
				}}
				markers={[marker]}
				selectedMarker={marker}
				style={{ height: 150 }}
			/>
		</View>
        
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