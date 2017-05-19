import React from 'react';
import _ from 'lodash';
import moment from 'moment';
import {
  TouchableOpacity,
  Subtitle,
  Caption,
  View,
  Image,
  Title,
  Row,
  Divider,
} from '@shoutem/ui';

/**
 * A component used to render a single list article item
 */
export default class ListArticleView extends React.Component {
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
          <Row style={{backgroundColor: "#22DD99", marginLeft: 20, marginRight: 20, marginBottom: 7, bottom: 8}}>
            <Title style={{textAlign: 'center', fontWeight: 'bold', color: '#FFF'}}>{(article.title || '').toUpperCase()}</Title>
          </Row>
        </View>
      </TouchableOpacity>
    );
  }
}
