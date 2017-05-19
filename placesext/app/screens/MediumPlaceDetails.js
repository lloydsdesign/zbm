import React from 'react';
import { connect } from 'react-redux';

import {
  ScrollView,
  Caption,
  Title,
  Text,
  Row,
  View,
  Image,
  Screen,
  Tile,
} from '@shoutem/ui';
import { connectStyle } from '@shoutem/theme';
import { navigateTo } from '@shoutem/core/navigation';
import { NavigationBar } from '@shoutem/ui/navigation';

import { openURL } from 'shoutem.web-view';
import { ext } from '../const.js';

import { PlaceDetails } from './PlaceDetails';

class MediumPlaceDetails extends PlaceDetails {
  static propTypes = {
    ...PlaceDetails.PropTypes,
  };

  getNavBarProps() {
    const { place } = this.props;
    return {
      styleName: place.image ? 'clear' : 'no-border',
      animationName: place.image ? 'solidify' : 'boxing',
      title: place.name,
    };
  }

  renderLeadImage(place) {
    if (place.image) {
      return (
        <Image
          styleName="large"
          source={{ uri: place.image.url }}
          animationName="hero"
        />
      );
    }
    return null;
  }

  renderPlaceInfo(place) {
    const { formattedAddress } = place.location;

    return (
      <Tile styleName="text-centric" style={{backgroundColor: '#000', paddingTop: 20, paddingBottom: 0, margin: 0}}>
        <Title style={{color: '#FFF', fontWeight: 'bold', paddingBottom: 0}}
          styleName={`md-gutter-bottom ${place.image ? '' : 'xl-gutter-top'}`}
          numberOfLines={3}
        >
          {place.name.toUpperCase()}
        </Title>
        <Caption style={{color: '#ddd', padding: 0}} styleName="centered sm-gutter-top lg-gutter-bottom">{formattedAddress}</Caption>
      </Tile>
    );
  }
  
  renderBoolean(value, string, backColor)
  {
  	if(!value)
  	{
  		backColor = "#333";
  		textColor = "#555";
  	}
  	else textColor = "#fff";
  	
  	return (
		<View style={{flex: 0.3, backgroundColor: backColor,  margin: 5}}>
        	<Text style={{textAlign: 'center', color: textColor, fontWeight: 'bold', fontSize: 12, padding: 5}}>
        		{string}
        	</Text>
        </View>
  	);
  }

  render() {
    const { place } = this.props;
    const { location = {} } = place;
    
    return (
      <Screen styleName="full-screen paper">
        <NavigationBar style={{fontVariant: ['caps']}} {...this.getNavBarProps()} />
        <ScrollView>

          {this.renderLeadImage(place)}
          {this.renderPlaceInfo(place)}
        
        <Row style={{backgroundColor: '#000', paddingTop: 0}}>
        	{this.renderBoolean(place.shop, "SHOP", '#009245')}
        	{this.renderBoolean(place.rent, "RENT", '#29ABE2')}
        	{this.renderBoolean(place.service, "SERVICE", '#FBB03B')}
        </Row>
          {this.renderInlineMap(place)}
          {this.renderOpeningHours(place)}
          {this.renderDisclosureButton(place.url, 'Visit webpage', 'web', this.openWebLink)}
          {this.renderDisclosureButton(location.formattedAddress, 'Directions', 'pin', this.openMapLink)}
          {this.renderDisclosureButton(place.mail, 'Email', 'email', this.openEmailLink)}
          {this.renderDisclosureButton(place.phone, 'Phone', 'call', this.openPhoneLink)}
          {this.renderDescription(place)}
        </ScrollView>
      </Screen>
    );
  }
 
}
 
export default connect(undefined, { navigateTo, openURL })(
    connectStyle(ext('MediumPlaceDetails'))(MediumPlaceDetails),
  );
