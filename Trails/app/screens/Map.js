import React, {
  Component
} from 'react';

import { Dimensions } from 'react-native';
import MapView from 'react-native-maps';
import { Screen } from '@shoutem/ui';
import { NavigationBar } from '@shoutem/ui/navigation';

export default class Map extends Component
{
	constructor(props)
	{
		super(props);
		this.state = {hasLoaded: false};
	}

	static propTypes = {
		markers: React.PropTypes.array,
		title: React.PropTypes.string,
	};

	fitToCoordinates()
	{
		if(this.state.hasLoaded) return;
		const { markers } = this.props;
		
		this.refs.map.fitToCoordinates(markers, {
			options:
			{
				edgePadding:
				{
					top: 10,
					right: 10,
					bottom: 10,
					left: 10
				},
				animated: true
			}
		});
		
		this.setState({hasLoaded: true});
	}


	render()
	{
		const { markers, title } = this.props;
		const { width, height } = Dimensions.get('window');

		return (
		  <Screen styleName="full-screen">
			<NavigationBar
			  styleName="no-border"
			  title={title.toUpperCase()}
			/>
			
			<MapView
				ref="map"
				onRegionChangeComplete={() => this.fitToCoordinates()}
				loadingEnabled
				showsUserLocation
				followsUserLocation
				style={{width: width, height: height}}
			>
				<MapView.Marker
					coordinate={markers[0]}
					title="Start / Finish"
				/>
				
				<MapView.Polyline
					coordinates={markers}
					geodesic
					strokeColor="#f00"
					strokeWidth={3}
				/>
			</MapView>
		  </Screen>
		);
	}
}
