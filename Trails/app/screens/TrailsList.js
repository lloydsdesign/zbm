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
