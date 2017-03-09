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
  Screen
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
		  
		  <Row style={{backgroundColor: 'rgba(255,255,255,0.8)', marginTop: -45, paddingTop: 0, paddingBottom: 14}}>
			<View styleName="horizontal">	 
				<View style={{flex: 0.1}}>
					<Image source={require('../assets/icons/elevation.png')} style={{width: 32, height: 32}} />
				</View>
				<View style={{flex: 0.25}}>
					 <Subtitle>{trail.altitude} m</Subtitle>
				</View>
				<View style={{flex: 0.1}}>
					<Image source={require('../assets/icons/length.png')} style={{width: 32, height: 32}} />
				</View>
				<View style={{flex: 0.25}}>
					<Subtitle>{trail.length} km</Subtitle>
				</View>
				<View style={{flex: 0.1}}>
					<Image source={batt_icon} style={{width: 32, height: 32}} />
				</View>
				<View style={{flex: 0.2}}>
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
          data={trails}
          loading={isBusy(trails)}
          renderRow={trail => this.renderRow(trail)}
        />
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
