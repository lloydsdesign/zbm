import React from 'react';
import { connectStyle } from '@shoutem/theme';
import {
  ScrollView,
  Screen,
  Title,
  Caption,
  Image,
  Tile,
  RichMedia,
  View,
  Row,
  Button,
  Icon,
  Text
} from '@shoutem/ui';
import { NavigationBar } from '@shoutem/ui/navigation';
import { navigateTo } from '@shoutem/core/navigation';
import { connect } from 'react-redux';

import * as _ from 'lodash';
import moment from 'moment';

import { ext } from '../const';
import NextArticle from '../components/NextArticle';

class ArticleMediumDetailsScreen extends React.Component {
  static propTypes = {
    article: React.PropTypes.object.isRequired,
    nextArticle: React.PropTypes.object,
    openArticle: React.PropTypes.func,
  };

  renderUpNext() {
    const { nextArticle, openArticle } = this.props;
    if (nextArticle && openArticle) {
      return (
        <NextArticle article={nextArticle} openArticle={openArticle} />
      );
    }

    return null;
  }

  renderImage() {
    const { article } = this.props;

    if (article.image) {
      return (
        <Image
          styleName="large"
          source={{ uri: _.get(article, 'image.url') }}
          animationName="hero"
        />
      );
    }
    return null;
  }

  render() {
    const { article, navigateTo } = this.props;
    const screenStyle = article.image ? 'full-screen paper' : 'paper';
    const styleName = article.image ? 'clear' : undefined;
    const animationName = article.image ? 'solidify' : 'boxing';

    return (
      <Screen styleName={screenStyle}>
        <NavigationBar
          styleName={styleName}
          animationName={animationName}
          share={{
            link: article.link,
            title: article.title,
          }}
          title={article.title}
        />
        <ScrollView>
          {this.renderImage()}

          <View>
            <Row style={{backgroundColor: '#22DD99', marginLeft: 20, marginRight: 20, marginBottom: 7, bottom: 8}}>
              <Title style={{textAlign: 'center', fontWeight: 'bold', color: '#FFF'}}>{(article.title || '').toUpperCase()}</Title>
            </Row>
          </View>
          <View styleName="solid">

            <RichMedia
              body={article.body}
              attachments={article.attachments}
            />
            <Button style={{backgroundColor: '#22DD99', borderWidth: 0, margin: 20}} onPress={() => navigateTo({
			      	screen: ext('TrailsList'),
		      		props: { story: article.story }
        			})}>
        				<Icon name="right-arrow" />
	        			<Text>EXPLORE RECOMMENDED TRAILS</Text>
			      </Button>
            {this.renderUpNext()}
          </View>

        </ScrollView>
      </Screen>
    );
  }
}

connectStyle(ext('ArticleMediumDetailsScreen'))(ArticleMediumDetailsScreen);

export default connect(
  undefined,
  { navigateTo }
)(ArticleMediumDetailsScreen);
