import React, {
	Component
} from 'react';

import {
	find,
	shouldRefresh,
	getCollection
} from '@shoutem/redux-io';

import _ from 'lodash';

import {
	Image,
	Tile,
	Title,
	Subtitle,
	Text,
	Row,
	View,
	Overlay,
	Screen,
	Button,
	TouchableOpacity
} from '@shoutem/ui';

import { ListView } from 'react-native';
import { NavigationBar } from '@shoutem/ui/navigation';
import { navigateTo } from '@shoutem/core/navigation';
import { ext } from '../const';
import { connect } from 'react-redux';

const sortAsc = require('../assets/icons/sort-asc.png');
const sortDesc = require('../assets/icons/sort-desc.png');
const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});

class TrailsList extends Component
{
	constructor(props)
	{
		super(props);
		
		this.renderRow = this.renderRow.bind(this);
		this.state = {
			dataSource: ds.cloneWithRows([]),
			sortOrders: [1, 1, 1],
			sortIcons: [sortAsc, sortAsc, sortAsc]
		};
	}
	
	componentWillMount()
	{
		const { trails } = this.props;
		this.setState({ dataSource: ds.cloneWithRows(trails) });
	}
	
	componentDidMount()
	{
		const { find, trails } = this.props;
		
		if(shouldRefresh(trails))
		{
			_.defer(() =>
				find(ext('Trails'), 'all', {
					include: 'image'
				})
			);
		}
	}
  
	sortTrails(mode, order)
	{
		var { trails } = this.props;
		var newOrders = this.state.sortOrders;
		var newIcons = this.state.sortIcons;
		var i;
		
		trails.sort(function(a, b)
		{
			return (a[mode] - b[mode]) * newOrders[order];
		});
		
		for(i = 0; i < newOrders.length; i++)
		{
			if(i != order)
			{
				newOrders[i] = 1;
				newIcons[i] = sortAsc;
			}
		}
		
		newOrders[order] *= -1;
		if(newOrders[order] > 0) newIcons[order] = sortDesc;
		else newIcons[order] = sortAsc;
		
		this.setState({
			dataSource: ds.cloneWithRows(trails),
			sortOrders: newOrders,
			sortIcons: newIcons
		});
	}
  
  renderRow(trail)
  {
	const { navigateTo } = this.props;
	
	if(trail.number < 10) trail.number = '0'+ trail.number;
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
		  <Image styleName="large-banner" source={{ uri: trail.image && trail.image.url ? trail.image.url : undefined }}>
			<Tile style={{marginTop: -40}}>
			<View styleName="h-center">
			  <Title styleName="h-center" style={{backgroundColor: '#000', color: '#FFF', paddingHorizontal: 5, fontSize: 12}}>{trail.type.toUpperCase()}</Title>
			  <Title styleName="h-center" style={{backgroundColor: 'red', color: '#FFF', paddingHorizontal: 10, paddingVertical: 5}}>{trail.number}</Title>
			</View>
			  <Title>{trail.title.toUpperCase()}</Title>
			</Tile>
		  </Image>
		  
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
		</TouchableOpacity>
    );
  }

  render()
  {  
    return (
      <Screen>
        <NavigationBar title="TRAILS" />
		
        <ListView
          dataSource={this.state.dataSource}
          renderRow={trail => this.renderRow(trail)}
        />
		
		<View styleName="horizontal" style={{backgroundColor: '#ddd', shadowColor: '#000', shadowOpacity: 0.3, shadowOffset: {width: 0, height: -5} }}>
			<View style={{flex: 0.32}} styleName="v-center">
				<Button styleName="clear" onPress={() => this.sortTrails('altitude', 0)}>
					<Text style={{fontSize: 10, color: '#fff'}}>ALTITUDE</Text>
					<Image source={this.state.sortIcons[0]} style={{width: 24, height: 24}} />
				</Button>
			</View>
			
			<View style={{flex: 0.32}} styleName="v-center">
				<Button style={{backgroundColor: '#b1b1b1', borderRadius: 0, borderWidth: 0, borderTopColor: 'blue', borderTopWidth: 3}} onPress={() => this.sortTrails('length', 1)}>
					<Text style={{fontSize: 10, color: '#fff'}}>LENGTH</Text>
					<Image source={this.state.sortIcons[1]} style={{width: 24, height: 24}} />
				</Button>
			</View>
			
			<View style={{flex: 0.36}} styleName="v-center">
				<Button style={{backgroundColor: '#a6a6a6', borderRadius: 0, borderWidth: 0, borderTopColor: 'red', borderTopWidth: 3}} onPress={() => this.sortTrails('phydiff', 2)}>
					<Text style={{fontSize: 10, color: '#fff'}}>DIFFICULTY</Text>
					<Image source={this.state.sortIcons[2]} style={{width: 24, height: 24}} />
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
