import React, {
	Component
} from 'react';

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
import { connect } from 'react-redux';

import {
	CMS_BASE,
	CMS_REST,
	parseJSON,
	ext,
	showAlert
} from '../const';

const sortAsc = require('../assets/icons/sort-asc.png');
const sortDesc = require('../assets/icons/sort-desc.png');
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
			hasLoaded: false,
			trailType: '',
			trailTypeColor: '#fff',
			isConnected: null,
			sortOrders: [1, 1, 1, 1],
			sortIcons: [sortAsc, sortAsc, sortAsc, sortAsc]
		};
	}
	
	componentWillMount()
	{
		this.setTrailType();
	}
	
	componentDidMount()
	{
		NetInfo.isConnected.addEventListener('change', this.handleConnectivityChange);
		NetInfo.isConnected.fetch().done((isConnected) => {
			if(isConnected) this.fetchTrails();
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
	
	fetchTrails()
	{
		const { trailType } = this.state;
		
		var data = new FormData();
		data.append('get_trails', '');
		data.append('type', trailType);
		
		fetch(CMS_REST, {
			method: 'POST',
			body: data
		})
		.then((response) => response.text())
		.then((response) => {
			response = parseJSON(response);
			response.trails = adjustTrails(response.trails);
			
			this.setState({ trails: response.trails, hasLoaded: true });
			this.storeTrails();
		});
	}
	
	setTrailType()
	{
		var i;
		const screenName = this.props.shortcut.canonicalName.toUpperCase();
		
		for(i = 0; i < trailTypes.length; i++)
		{
			if(screenName.indexOf(trailTypes[i]) > -1)
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
					return haversine(position.coords, a.startlocation) - haversine(position.coords, b.startlocation);
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
			(error) => {
				showAlert('Unable to get current location. Are your geolocation services turned on?');
				this.setState({ trails });
			},
			{enableHighAccuracy: true}
		);
	}
	
	storeTrails()
	{
		const { trails, trailType } = this.state;
		
		AsyncStorage.removeItem('TrailsDB_'+ trailType).then(() => {
			if(trails && trails.length) AsyncStorage.setItem('TrailsDB_'+ trailType, JSON.stringify(trails));
		});
	}
	
	getTrails()
	{
		const { trailType } = this.state;
		
		AsyncStorage.getItem('TrailsDB_'+ trailType).then((trails) => {
			if(trails) trails = JSON.parse(trails);
			
			if(!trails) trails = [];
			this.setState({ trails, hasLoaded: true });
		});
	}
	
	renderListView()
	{
		const { trails, hasLoaded } = this.state;
		if(!hasLoaded) return (<Spinner style={{ size: 'large', color: '#fff' }} />);
		
		if(!trails.length) return null;
		const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
		
		return (
			<ListView
			  dataSource={ds.cloneWithRows(trails)}
			  renderRow={trail => this.renderRow(trail)}
			/>
		);
	}
  
  renderRow(trail)
  {
	const { trailType, trailTypeColor } = this.state;
	const { navigateTo } = this.props;
	
	trail.number = parseInt(trail.number, 10);
	if(trail.number < 10) trail.number = '0'+ trail.number;
	
	var flexValue = 0.33, tech_icon = null;
	const batt_icon = battIcons[trail.phydiff - 1];
	var isMTB = trailType.indexOf('MTB');
	
	if(isMTB > -1 && trail.techdiff && trail.techdiff != "")
	{
		flexValue = 0.25;
		tech_icon = techIcons[trail.techdiff - 1];
	}
	else isMTB = -1;
	
    return (
		<TouchableOpacity onPress={() => navigateTo({
			screen: ext('TrailDetails'),
			props: { trail }
		})}>
		  <Image styleName="large-banner" source={{ uri: trail.image }} />
		  
		  <Row style={{padding: 0, marginBottom: 0, backgroundColor: '#000'}}>		
			<View styleName="horizontal h-center" style={{marginLeft: 20, marginRight: 20, paddingTop: 15, paddingBottom: 12, bottom: 8, backgroundColor: trailTypeColor, marginTop: 0}}>
			  <Title style={{color: '#FFF'}}>{trail.type} {trail.number} - {trail.title.toUpperCase()}</Title>
			</View>
		  </Row>
		  
		  <Row style={{backgroundColor: '#000', marginTop: 0, paddingTop: 0, paddingBottom:16}}>
			<View styleName="horizontal">
				<View styleName="horizontal h-center v-center" style={{flex: flexValue, marginBottom: -4}}>
					<Image source={require('../assets/icons/elevation.png')} style={{width: 18, height: 18, marginBottom: 5, marginRight: 5}} />
					<Subtitle style={{fontSize: 14, color: '#fff'}}>{trail.altitude} m</Subtitle>
				</View>
				
				<View styleName="horizontal h-center v-center" style={{flex: flexValue, marginBottom: -4}}>
					<Image source={require('../assets/icons/length.png')} style={{width: 18, height: 18, marginBottom: 5, marginRight: 5}} />
					<Subtitle style={{fontSize: 14, color: '#fff'}}>{trail.length} km</Subtitle>
				</View>
				
				<View styleName="horizontal h-center v-center" style={{flex: flexValue, marginBottom: -4}}>
					<Image source={batt_icon} style={{width: 18, height: 18, marginBottom: 5, marginRight: 5}} />
					<Subtitle style={{fontSize: 14, color: '#fff'}}>{trail.phydiff}/3</Subtitle>
				</View>
				
				{isMTB > -1 && (
					<View styleName="horizontal h-center v-center" style={{flex: flexValue, marginBottom: -4}}>
						<Image source={tech_icon} style={{width: 18, height: 18, marginBottom: 5, marginRight: 5}} />
						<Subtitle style={{fontSize: 14, color: '#fff'}}>{trail.techdiff}/3</Subtitle>
					</View>
				)}
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
			
			<View style={{flex: flexValue}}>
				<Button style={{paddingTop: 0, backgroundColor: '#fff', borderRadius: 0, borderWidth: 0}} onPress={() => this.sortTrails('altitude', 0)}>
					<Image source={sortIcons[0]} style={{width: 10, height: 10, marginRight: 5}} />
					<Text style={{fontSize: 9, color: '#555'}}>ALTITUDE</Text>
				</Button>
			</View>
			
			<View style={{flex: flexValue}}>
				<Button style={{marginTop: 0, paddingTop: 0, backgroundColor: '#fff', borderRadius: 0, borderWidth: 0}} onPress={() => this.sortTrails('length', 1)}>
					<Image source={sortIcons[1]} style={{width: 10, height: 10, marginRight: 5}} />
					<Text style={{fontSize: 9, color: '#555'}}>LENGTH</Text>
				</Button>
			</View>
			
			<View style={{flex: flexValue}}>
				<Button style={{paddingTop: 0, backgroundColor: '#fff', borderRadius: 0, borderWidth: 0}} onPress={() => this.sortTrails('phydiff', 2)}>
					<Image source={sortIcons[2]} style={{width: 10, height: 10, marginRight: 5}} />
					<Text style={{fontSize: 9, color: '#555'}}>PHYS.DIFF.</Text>
				</Button>
			</View>
			
			{techDiff > -1 &&
				<View style={{flex: flexValue}}>
					<Button style={{paddingTop: 0, backgroundColor: '#FFF', borderRadius: 0, borderWidth: 0}} onPress={() => this.sortTrails('techdiff', 3)}>
						<Image source={sortIcons[3]} style={{width: 10, height: 10, marginRight: 5}} />
						<Text style={{fontSize: 9, color: '#555'}}>TECH.DIFF.</Text>
					</Button>
				</View>
			}
		</View>
		
		<View styleName="h-center" style={{backgroundColor: '#fff'}}>
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
  undefined,
  { navigateTo }
)(TrailsList);

function adjustTrails(trails)
{
	var i, j;
	
	for(i = 0; i < trails.length; i++)
	{
		trails[i].image = CMS_BASE + trails[i].image;
		trails[i].graph = CMS_BASE + trails[i].graph;
		
		for(j = 0; j < trails[i].images.length; j++) trails[i].images[j] = CMS_BASE + trails[i].images[j];
	}
	
	return trails;
}