import React, {
  Component
} from 'react';

import {
  find,
  isBusy,
  shouldRefresh,
  getCollection
} from '@shoutem/redux-io';

import _ from 'lodash';

import {
  Image,
  ListView,
  Tile,
  Title,
  Subtitle,
  Text,
  Row,
  View,
  Overlay,
  Screen,
  Button
} from '@shoutem/ui';

import { NavigationBar } from '@shoutem/ui/navigation';
import { TouchableOpacity } from 'react-native';
import { navigateTo } from '@shoutem/core/navigation';
import { ext } from '../const';
import { connect } from 'react-redux';


class TrailsList extends Component {
	componentDidMount() {
    const { find, trails } = this.props;
    if (shouldRefresh(trails)) {
      _.defer(() =>
        find(ext('Trails'), 'all', {
            include: 'image'
        })
      );
    }
  }
	
	constructor(props) {
    super(props);

    this.renderRow = this.renderRow.bind(this);
	this.state = {
      dataSource: []
    };
  }
  
  componentWillMount() {
	const { trails } = this.props;
	this.setState({ dataSource: trails });
  }
  
	sortTrails(trails, mode, order)
	{
		trails.sort(function(a, b)
		{
			var value = 0;
			
			if(mode == 'altitude') value = a.altitude - b.altitude;
			else if(mode == 'length') value = a.length - b.length;
			else if(mode == 'phydiff') value = a.phydiff - b.phydiff;
			
			return value * order;
		});
		
		this.setState({
			dataSource: trails
		});
		
		//console.dir(trails);
	}
  
  renderRow(trail) {
	const { navigateTo } = this.props;
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
	
    return (
		<TouchableOpacity onPress={() => navigateTo({
        screen: ext('TrailDetails'),
        props: { trail }
		})}>
		  <Image styleName="large-banner" source={{ uri: trail.image &&
			trail.image.url ? trail.image.url : undefined }}>
			<Tile>
			  <Title>{trail.title}</Title>
			  <Subtitle>{trail.header}</Subtitle>
			</Tile>
		  </Image>
		  
		  <Row style={{backgroundColor: 'rgba(255,255,255,1)', marginTop: -34, paddingTop: 0, paddingBottom: 10}}>
			<View styleName="horizontal">
				<View style={{flex: 0.1}}>
					<Image source={require('../assets/icons/elevation.png')} style={{width: 24, height: 24}} />
				</View>
				<View style={{flex: 0.25, marginBottom: -2}}>
					<Subtitle>{trail.altitude} m</Subtitle>
				</View>
				<View style={{flex: 0.1}}>
					<Image source={require('../assets/icons/length.png')} style={{width: 24, height: 24}} />
				</View>
				<View style={{flex: 0.25, marginBottom: -2}}>
					<Subtitle>{trail.length} km</Subtitle>
				</View>
				<View style={{flex: 0.1}}>
					<Image source={batt_icon} style={{width: 24, height: 24}} />
				</View>
				<View style={{flex: 0.2, marginBottom: -2}}>
					<Subtitle>{trail.phydiff}/3</Subtitle>
				</View>
			</View>
		</Row>
		</TouchableOpacity>
    );
  }

  render() {
	const { trails } = this.props;
	  
    return (
      <Screen>
        <NavigationBar title="TRAILS" />
		
        <ListView
          data={this.state.dataSource}
          loading={isBusy(trails)}
          renderRow={trail => this.renderRow(trail)}
        />
		
		<View styleName="horizontal">
			<View style={{flex: 0.33}} styleName="h-center">
				<Button onPress={() => this.sortTrails(trails, 'altitude', 1)}>
					<Text>ALTITUDE</Text>
				</Button>
			</View>
			
			<View style={{flex: 0.33}} styleName="h-center">
				<Button onPress={() => this.sortTrails(trails, 'length', 1)}>
					<Text>LENGTH</Text>
				</Button>
			</View>
			
			<View style={{flex: 0.33}} styleName="h-center">
				<Button onPress={() => this.sortTrails(trails, 'phydiff', 1)}>
					<Text>DIFFICULTY</Text>
				</Button>
			</View>
		</View>
      </Screen>
    );
  }
}

export default connect(
  (state) => ({
    trails: getCollection(state[ext()].allTrails, state)
  }),
  { navigateTo, find }
)(TrailsList);
