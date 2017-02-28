import React, {
  Component
} from 'react';

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
  Overlay,
  Tile,
} from '@shoutem/ui';

import styles from '../style/style';


export default class TrailDetails extends Component {
  render() {
    const { trail } = this.props;

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
          <Text>{trail.description}</Text>
        </Row>

        <Divider styleName="line" />
		
		<Row>
          <Icon name="pin" />
          <View styleName="horizontal" style={styles.flexView}>
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
          <View styleName="horizontal" style={styles.flexView}>
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
          <View styleName="horizontal" style={styles.flexView}>
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
          <Icon name="ic_about" />
          <View styleName="horizontal" style={styles.flexView}>
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
          <Icon name="ic_about" />
          <View styleName="horizontal" style={styles.flexView}>
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
          <Icon name="ic_about" />
          <View styleName="horizontal" style={styles.flexView}>
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
          <Icon name="ic_about" />
          <View styleName="horizontal" style={styles.flexView}>
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
