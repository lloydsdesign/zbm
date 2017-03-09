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
  Icon,
  View,
  Overlay,
  Screen
} from '@shoutem/ui';
import { NavigationBar } from '@shoutem/ui/navigation';

import {
  TouchableOpacity
} from 'react-native';

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
	
    return (
		<TouchableOpacity onPress={() => navigateTo({
        screen: ext('TrailDetails'),
        props: { trail }
		})}>
		  <Image styleName="large-banner" source={{ uri: trail.image &&
			trail.image.url ? trail.image.url : undefined  }}>
			<Tile>
			  <Title>{trail.title}</Title>
			  <Subtitle>{trail.header}</Subtitle>
			</Tile>
		  </Image>		  
		  <Row style={{backgroundColor: 'rgba(255,255,255,0.75)', marginTop: -43, paddingTop: 10, paddingBottom: 10}}>
			  <View styleName="horizontal">
			<View style={{flex: 0.1}}>
				 <Icon name="photo" style={{color: 'green'}} />
			</View>
			<View style={{flex: 0.25}}>
				 <Subtitle>{trail.altitude} m</Subtitle>
			</View>
			<View style={{flex: 0.1}}>
				 <Icon name="play" style={{color: 'blue'}} />
			</View>
			<View style={{flex: 0.3}}>
				 <Subtitle>{trail.length} km</Subtitle>
			</View>
			<View style={{flex: 0.1}}>
				 <Icon name="settings" style={{color: 'red'}} />
			</View>
			<View style={{flex: 0.115}}>
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
