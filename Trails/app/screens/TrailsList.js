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

const trailTypes = ['MTB', 'ROAD', 'FAMILY'];
const trailTypeColors = ['#e60005', '#3d99d5', '#37a829'];


class TrailsList extends Component
{
	constructor(props)
	{
		super(props);
		
		this.renderRow = this.renderRow.bind(this);
		this.state = {
			trails: [],
			trailType: '',
			trailTypeColor: '#fff',
			isConnected: null,
			dataSource: ds.cloneWithRows([]),
			sortOrders: [1, 1, 1],
			sortIcons: [sortAsc, sortAsc, sortAsc]
		};
	}
	
	componentWillMount()
	{
		const { find, trails } = this.props;
		
		if(shouldRefresh(trails))
		{
			find(ext('Trails'), 'all', {
				include: ['image', 'graph']
			});
		}
		
		this.setTrailType();
		
		NetInfo.isConnected.addEventListener('change', this.handleConnectivityChange);
		NetInfo.isConnected.fetch().done((isConnected) => {
			this.setState({ isConnected });
			this.refreshData();
		});
	}
	
	componentWillUnmount()
	{
		NetInfo.isConnected.removeEventListener('change', this.handleConnectivityChange);
	}
	
	handleConnectivityChange = (isConnected) => {
		this.setState({ isConnected });
	};
	
	setTrailType()
	{
		var i;
		const screenName = this.props.shortcut.canonicalName.toUpperCase();
		
		for(i = 0; i < trailTypes.length; i++)
		{
			if(screenName.indexOf(trailTypes[i]) != -1)
			{
				this.setState({
					trailType: trailTypes[i],
					trailTypeColor: trailTypeColors[i]
				});
				break;
			}
		}
	}
  
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
	
	sortByNearestTrail()
	{
		navigator.geolocation.getCurrentPosition((position) => {
				var trails = this.state.trails;
				
				trails.sort(function(a, b)
				{
					if(!("startlocation" in a) || !("startlocation" in b)) return 0;
					return haversine(position.coords, a.startlocation) - haversine(position.coords, b.startlocation);
				});
				
				this.setState({
					dataSource: ds.cloneWithRows(trails)
				});
			},
			(error) => console.log(JSON.stringify(error)),
			{enableHighAccuracy: true}
		);
	}
	
	async refreshData()
	{
		var { trails } = this.props;
		
		if(this.state.isConnected)
		{
			await AsyncStorage.removeItem('TrailsDB');
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
	const { trailType, trailTypeColor } = this.state;
	trail.type = trail.type.trim().toUpperCase();
	
	if(trailType != trail.type) return null;
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
			
		  </Image>
		  <Row style={{height: 10, backgroundColor: '#000'}}>
		  </Row>
		  <Row>		
			<View styleName="horizontal h-center" style={{paddingTop: 10, paddingBottom: 10, backgroundColor: trailTypeColor, marginTop: -85}}>
			  <Title style={{color: '#FFF'}}>{trail.type} {trail.number} - {trail.title.toUpperCase()}</Title>
			</View>
		  </Row>
		  
		  <Row style={{backgroundColor: '#000', marginTop: -34, paddingTop: 0, paddingBottom: 20}}>
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
	const { dataSource, sortIcons, trailType } = this.state;
	  
    return (
      <Screen>
        <NavigationBar title={trailType +' TRAILS'} />
		
        <ListView
          dataSource={dataSource}
          renderRow={trail => this.renderRow(trail)}
		  enableEmptySections
        />
		
		<View styleName="horizontal" style={{backgroundColor: '#FFF', shadowColor: '#000', shadowOpacity: 0.3, shadowOffset: {width: 0, height: -5}}}>
			<View style={{flex: 0.3}} styleName="v-center">
				<Button style={{backgroundColor: '#FFF', borderRadius: 0, borderWidth: 0}}styleName="clear" onPress={() => this.sortTrails('altitude', 0)}>
					<Text style={{fontSize: 10, color: '#555'}}>ALTITUDE</Text>
					<Image source={sortIcons[0]} style={{width: 14, height: 14}} />
				</Button>
			</View>
			
			<View style={{flex: 0.3}} styleName="v-center">
				<Button style={{backgroundColor: '#FFF', borderRadius: 0, borderWidth: 0}} onPress={() => this.sortTrails('length', 1)}>
					<Text style={{fontSize: 10, color: '#555'}}>LENGTH</Text>
					<Image source={sortIcons[1]} style={{width: 14, height: 14}} />
				</Button>
			</View>
			
			<View style={{flex: 0.4}} styleName="v-center">
				<Button style={{backgroundColor: '#FFF', borderRadius: 0, borderWidth: 0}} onPress={() => this.sortTrails('phydiff', 2)}>
					<Text style={{fontSize: 10, color: '#555'}}>DIFFICULTY</Text>
					<Image source={sortIcons[2]} style={{width: 14, height: 14}} />
				</Button>
			</View>
		</View>
		
		<View styleName="h-center" style={{backgroundColor: '#FFF'}}>
			<Button styleName="h-center" style={{backgroundColor: '#FF2222', borderWidth: 0, marginTop: 0, marginLeft: 10, marginRight: 10, marginBottom: 10}} onPress={() => this.sortByNearestTrail()}>
				<Icon name="search" style={{color: '#FFF'}} />
				<Text style={{color: '#FFF'}}>SORT BY NEAREST TRAIL START</Text>
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
