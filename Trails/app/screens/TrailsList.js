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
	Screen,
	Button,
	Icon,
	TouchableOpacity
} from '@shoutem/ui';

import {
	ListView,
	NetInfo,
	AsyncStorage
} from 'react-native';

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
			trails: [],
			isConnected: null,
			dataSource: ds.cloneWithRows([]),
			sortOrders: [1, 1, 1],
			sortIcons: [sortAsc, sortAsc, sortAsc]
		};
	}
	
	componentWillMount()
	{
		NetInfo.isConnected.addEventListener('change', this.handleConnectivityChange);
		NetInfo.isConnected.fetch().done((isConnected) => {
			this.setState({ isConnected });
			this.refreshData();
		});
	}
	
	componentDidMount()
	{
		const { find, trails } = this.props;
		
		if(shouldRefresh(trails))
		{
			_.defer(() =>
				find(ext('Trails'), 'all', {
					include: ['image']
				})
			);
		}
	}
	
	componentWillUnmount()
	{
		NetInfo.isConnected.removeEventListener('change', this.handleConnectivityChange);
	}
	
	handleConnectivityChange = (isConnected) => {
		this.setState({ isConnected });
	};
  
	sortTrails(mode, order)
	{
		var trails = this.state.trails;
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
	
	getNearestTrail()
	{
		var trails = this.state.trails;
		var currPos;
		
		/*navigator.geolocation.getCurrentPosition((position) => {
				currPos = position.coords;
			},
			(error) => console.log(JSON.stringify(error)),
			{enableHighAccuracy: true}
		);*/
		
		currPos = {
			latitude: 44,
			longitude: 14
		};
		
		trails.sort(function(a, b)
		{
			if(!("startlocation" in a) || !("startlocation" in b)) return 0;
			return haversine(currPos, a.startlocation) - haversine(currPos, b.startlocation);
		});
		
		this.setState({
			dataSource: ds.cloneWithRows(trails)
		});
	}
	
	async refreshData()
	{
		var { trails } = this.props;
		
		if(this.state.isConnected)
		{
			await AsyncStorage.clear();
			if(trails && trails.length) await AsyncStorage.setItem('TrailsDB', JSON.stringify(trails));
		}
		else
		{
			trails = await AsyncStorage.getItem('TrailsDB');
			if(trails) trails = JSON.parse(trails);
		}
		
		if(!trails) trails = [];
		this.setState({
			trails: trails,
			dataSource: ds.cloneWithRows(trails)
		});
	}
  
  renderRow(trail)
  {
	const screenName = this.props.shortcut.canonicalName.toUpperCase();
	trail.type = trail.type.trim().toUpperCase();
	
	if(screenName.indexOf(trail.type) == -1) return null;
	const { navigateTo } = this.props;
	
	trail.number = parseInt(trail.number, 10);
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
			  <Title styleName="h-center" style={{backgroundColor: '#000', color: '#FFF', paddingHorizontal: 5, fontSize: 12}}>{trail.type}</Title>
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
		  enableEmptySections
        />
		
		<View styleName="horizontal" style={{backgroundColor: '#000', shadowColor: '#000', shadowOpacity: 0.3, shadowOffset: {width: 0, height: -5}}}>
			<View style={{flex: 0.32}} styleName="v-center">
				<Button style={{backgroundColor: '#000', borderRadius: 0, borderWidth: 0, borderTopColor: '#009245', borderTopWidth: 3}}styleName="clear" onPress={() => this.sortTrails('altitude', 0)}>
					<Text style={{fontSize: 10, color: '#009245'}}>ALTITUDE</Text>
					<Image source={this.state.sortIcons[0]} style={{width: 14, height: 14}} />
				</Button>
			</View>
			
			<View style={{flex: 0.32}} styleName="v-center">
				<Button style={{backgroundColor: '#000', borderRadius: 0, borderWidth: 0, borderTopColor: '#29ABE2', borderTopWidth: 3}} onPress={() => this.sortTrails('length', 1)}>
					<Text style={{fontSize: 10, color: '#29ABE2'}}>LENGTH</Text>
					<Image source={this.state.sortIcons[1]} style={{width: 14, height: 14}} />
				</Button>
			</View>
			
			<View style={{flex: 0.36}} styleName="v-center">
				<Button style={{backgroundColor: '#000', borderRadius: 0, borderWidth: 0, borderTopColor: '#FBB03B', borderTopWidth: 3}} onPress={() => this.sortTrails('phydiff', 2)}>
					<Text style={{fontSize: 10, color: '#FBB03B'}}>DIFFICULTY</Text>
					<Image source={this.state.sortIcons[2]} style={{width: 14, height: 14}} />
				</Button>
			</View>
		</View>
		
		<View styleName="horizontal">
			<Button styleName="full-width" onPress={() => this.getNearestTrail()}>
				<Text>NEAREST TRAILS</Text>
				<Icon name="search" />
			</Button>
		</View>
      </Screen>
    );
  }
}

function toRad(num)
{
	return num * Math.PI / 180;
}

function haversine(start, end, options)
{
	options = options || {};

	const radii = {
		km:    6371,
		mile:  3960,
		meter: 6371000,
		nmi:   3440
	};

	const R = options.unit in radii ? radii[options.unit] : radii.meter;

	const dLat = toRad(end.latitude - start.latitude);
	const dLon = toRad(end.longitude - start.longitude);
	const lat1 = toRad(start.latitude);
	const lat2 = toRad(end.latitude);

	const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
	const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

	return R * c;
}

export default connect(
  (state) => ({
    trails: getCollection(state[ext()].allTrails, state)
  }),
  { navigateTo, find }
)(TrailsList);
