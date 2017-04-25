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
	Title,
	Subtitle,
	Text,
	Row,
	View,
	Screen,
	Button,
	Icon,
	TouchableOpacity,
	Spinner
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


class TrailsList extends Component
{
	constructor(props)
	{
		super(props);
		
		this.state = {
			trails: [],
			trailType: '',
			trailTypeColor: '#fff',
			isConnected: null,
			sortOrders: [1, 1, 1, 1],
			sortIcons: [sortAsc, sortAsc, sortAsc, sortAsc]
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
			if(isConnected)
			{
				this.storeTrails();
				this.setState({ trails });
			}
			else this.getTrails();
			
			this.setState({ isConnected });
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
		var { trails, sortOrders, sortIcons } = this.state;
		this.setState({ trails: [] });
		
		trails.sort(function(a, b)
		{
			return (a[mode] - b[mode]) * sortOrders[order];
		});
		
		var i;
		for(i = 0; i < sortOrders.length; i++)
		{
			if(i != order)
			{
				sortOrders[i] = 1;
				sortIcons[i] = sortAsc;
			}
		}
		
		sortOrders[order] *= -1;
		if(sortOrders[order] > 0) sortIcons[order] = sortDesc;
		else sortIcons[order] = sortAsc;
		
		this.setState({
			trails,
			sortOrders,
			sortIcons
		});
	}
	
	sortByNearestTrail()
	{
		var { trails, sortOrders, sortIcons } = this.state;
		this.setState({ trails: [] });
		
		navigator.geolocation.getCurrentPosition((position) => {
				trails.sort(function(a, b)
				{
					if(!("startlocation" in a) || !("startlocation" in b)) return 0;
					else return haversine(position.coords, a.startlocation) - haversine(position.coords, b.startlocation);
				});
				
				var i;
				for(i = 0; i < sortOrders.length; i++)
				{
					sortOrders[i] = 1;
					sortIcons[i] = sortAsc;
				}
				
				this.setState({
					trails,
					sortOrders,
					sortIcons
				});
			},
			(error) => console.error(JSON.stringify(error)),
			{enableHighAccuracy: true}
		);
	}
	
	storeTrails()
	{
		const { trails } = this.props;
		
		AsyncStorage.removeItem('TrailsDB').then(() => {
			if(trails && trails.length) AsyncStorage.setItem('TrailsDB', JSON.stringify(trails));
		});
	}
	
	getTrails()
	{
		AsyncStorage.getItem('TrailsDB').then((trails) => {
			if(trails) trails = JSON.parse(trails);
			
			if(!trails) trails = [];
			this.setState({ trails });
		});
	}
	
	renderListView()
	{
		const { trails } = this.state;
		if(!trails.length) return (<Spinner style={{ size: 'large', color: '#fff' }} />);
		
		return (
			<ListView
			  dataSource={ds.cloneWithRows(trails)}
			  renderRow={trail => this.renderRow(trail)}
			  enableEmptySections
			/>
		);
	}
  
  renderRow(trail)
  {
	const { trailType, trailTypeColor } = this.state;
	trail.type = trail.type.trim().toUpperCase();
	
	if(trailType != trail.type) return null;
	const { navigateTo } = this.props;
	
	trail.number = parseInt(trail.number, 10);
	if(trail.number < 10) trail.number = '0'+ trail.number;
	
	var flexValue = 0.25, tech_icon = null;
	const techDiff = trailType.indexOf('MTB');
	const batt_icon = battIcons[trail.phydiff - 1];
	
	if(techDiff > -1)
	{
		flexValue = 0.17;
		tech_icon = techIcons[trail.techdiff - 1];
	}
	
    return (
		<TouchableOpacity onPress={() => navigateTo({
			screen: ext('TrailDetails'),
			props: { trail }
		})}>
		  <Image styleName="large-banner" source={{ uri: trail.image && trail.image.url ? trail.image.url : undefined }} />
		  
		  <Row style={{padding: 0, marginBottom: 0, backgroundColor: '#000'}}>		
			<View styleName="horizontal h-center" style={{marginLeft: 20, marginRight: 20, paddingTop: 10, paddingBottom: 10, bottom: 20, backgroundColor: trailTypeColor, marginTop: 0}}>
			  <Title style={{color: '#FFF'}}>{trail.type} {trail.number} - {trail.title.toUpperCase()}</Title>
			</View>
		  </Row>
		  
		  <Row style={{backgroundColor: '#000', marginTop: 0, paddingTop: 0, paddingBottom:16}}>
			<View styleName="horizontal">
				<View style={{flex: 0.08}}>
					<Image source={require('../assets/icons/elevation.png')} style={{width: 18, height: 18}} />
				</View>
				<View style={{flex: flexValue, marginBottom: -4}}>
					<Subtitle style={{fontSize: 14, color: '#fff'}}>{trail.altitude} m</Subtitle>
				</View>
				
				<View style={{flex: 0.08}}>
					<Image source={require('../assets/icons/length.png')} style={{width: 18, height: 18}} />
				</View>
				<View style={{flex: flexValue, marginBottom: -4}}>
					<Subtitle style={{fontSize: 14, color: '#fff'}}>{trail.length} km</Subtitle>
				</View>
				
				<View style={{flex: 0.08}}>
					<Image source={batt_icon} style={{width: 18, height: 18}} />
				</View>
				<View style={{flex: flexValue, marginBottom: -4}}>
					<Subtitle style={{fontSize: 14, color: '#fff'}}>{trail.phydiff}/3</Subtitle>
				</View>
				
				{techDiff > -1 &&
					<View style={{flex: 0.08}}>
						<Image source={tech_icon} style={{width: 18, height: 18}} />
					</View>
					&&
					<View style={{flex: flexValue, marginBottom: -4}}>
						<Subtitle style={{fontSize: 14, color: '#fff'}}>{trail.techdiff}/3</Subtitle>
					</View>
				}
			</View>
		</Row>
		</TouchableOpacity>
    );
  }

  render()
  {
	const { sortIcons, trailType } = this.state;
	
	var flexValue = 0.33;
	const techDiff = trailType.indexOf('MTB');
	
	if(techDiff > -1) flexValue = 0.25;
	  
    return (
      <Screen>
        <NavigationBar title={trailType +' TRAILS'} />
		
		<View styleName="vertical h-center v-center" style={{ flex: 1 }}>
			{this.renderListView()}
		</View>
		
		<View styleName="horizontal" style={{backgroundColor: '#FFF', shadowColor: '#000', shadowOpacity: 0.3, shadowOffset: {width: 0, height: -5}}}>
			
			<View style={{flex: flexValue}} styleName="v-center">
				<Button style={{paddingTop: 0, backgroundColor: '#FFF', borderRadius: 0, borderWidth: 0}}styleName="clear" onPress={() => this.sortTrails('altitude', 0)}>
					<Image source={sortIcons[0]} style={{width: 10, height: 10, marginRight: 5, marginBottom: 4}} />
					<Text style={{fontSize: 8, color: '#555', paddingBottom: 5}}>ALTITUDE</Text>
				</Button>
			</View>
			
			<View style={{flex: flexValue}} styleName="v-center">
				<Button style={{marginTop: 0, paddingTop: 0, backgroundColor: '#FFF', borderRadius: 0, borderWidth: 0}} onPress={() => this.sortTrails('length', 1)}>
					<Image source={sortIcons[1]} style={{width: 10, height: 10, marginRight: 5, marginBottom: 4}} />
					<Text style={{fontSize: 8, color: '#555', paddingBottom: 5}}>LENGTH</Text>
				</Button>
			</View>
			
			<View style={{flex: flexValue}} styleName="v-center">
				<Button style={{paddingTop: 0, backgroundColor: '#FFF', borderRadius: 0, borderWidth: 0}} onPress={() => this.sortTrails('phydiff', 2)}>
					<Image source={sortIcons[2]} style={{width: 10, height: 10, marginRight: 5}} />
					<Text style={{fontSize: 8, color: '#555'}}>PHYSICAL DIFFICULTY</Text>
				</Button>
			</View>
			
			{techDiff > -1 &&
				<View style={{flex: flexValue}} styleName="v-center">
					<Button style={{paddingTop: 0, backgroundColor: '#FFF', borderRadius: 0, borderWidth: 0}} onPress={() => this.sortTrails('techdiff', 3)}>
						<Image source={sortIcons[3]} style={{width: 10, height: 10, marginRight: 5}} />
						<Text style={{fontSize: 8, color: '#555'}}>TECHNICAL DIFFICULTY</Text>
					</Button>
				</View>
			}
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
