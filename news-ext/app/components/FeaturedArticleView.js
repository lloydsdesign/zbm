import React from 'react';
import _ from 'lodash';
import {
  TouchableOpacity,
  Title,
  Caption,
  View,
  Row,
  Tile,
  Image,
  Divider,
} from '@shoutem/ui';

import moment from 'moment';

/**
 * A component used to render featured news articles
 */
export default class FeaturedArticleView extends React.Component {
  static propTypes = {
    onPress: React.PropTypes.func,
    article: React.PropTypes.object.isRequired,
  };

  constructor(props) {
    super(props);
    this.onPress = this.onPress.bind(this);
  }

  onPress() {
    this.props.onPress(this.props.article);
  }

  render() {
    const { article } = this.props;

    /* eslint-disable no-multi-spaces */
    return (
      <TouchableOpacity key={article.id} onPress={this.onPress}>
        <View>
          <Image
            styleName="large-banner"
            source={{ uri: _.get(article, 'image.url') }}
          >
          </Image>
        </View>
        <View>
          <Row style={{backgroundColor: "#22DD99", marginLeft: 20, marginRight: 20, bottom: 8}}>
            <Title style={{textAlign: 'center', fontWeight: 'bold', color: '#FFF'}}>{(article.title || '').toUpperCase()}</Title>
          </Row>
        </View>
      </TouchableOpacity>
    );
  }
}
