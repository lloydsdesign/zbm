import React from 'react';
import {
  InteractionManager,
  LayoutAnimation,
  Alert,
} from 'react-native';
import {
  TouchableOpacity,
  Image,
  View,
  Text,
  Tile,
  Title,
  Subtitle,
  Caption,
  Divider,
  ListView,
  Screen,
} from '@shoutem/ui';
import _ from 'lodash';
import {
  isBusy,
  isInitialized,
} from '@shoutem/redux-io';
import { NavigationBar } from '@shoutem/ui/navigation';
import { CmsListScreen } from 'shoutem.cms';
import MapList from '../../components/MapList';
import { ext } from '../../const';
import { PermissionStatus } from '../../reducers';

export class PlacesListBase extends CmsListScreen {
  static propTypes = {
    ...CmsListScreen.propTypes,
  }

  constructor(props) {
    super(props);
    this.renderBoolean = this.renderBoolean.bind(this);
    this.renderRow = this.renderRow.bind(this);
    this.promptForLocationPermission = this.promptForLocationPermission.bind(this);
    this.getNavBarProps = this.getNavBarProps.bind(this);
    this.renderMapView = this.renderMapView.bind(this);
    this.renderRightNavBarComponent = this.renderRightNavBarComponent.bind(this);
    this.updateLocation = this.updateLocation.bind(this);
    this.locationPermissionGranted = this.locationPermissionGranted.bind(this);
    this.locationPermissionDenied = this.locationPermissionDenied.bind(this);
    this.updatePermissionIfChanged = this.updatePermissionIfChanged.bind(this);
    this.toggleMapView = this.toggleMapView.bind(this);
    this.isDataLoading = this.isDataLoading.bind(this);

    this.state = {
      ...this.state,
      schema: ext('places'),
      renderCategoriesInline: true,
      mapView: false,
      currentLocation: null,
    };
  }

  componentWillMount() {
    if (!this.state.schema) {
      throw Error(
        'Invalid Screen state "schema". Screen that extends CMSListScreen ' +
        'must define (content) "schema" property in the state.'
      );
    }
    this.checkPermissionStatus();
    this.refreshInvalidContent(this.props, true);
  }

  updateLocation() {
    navigator.geolocation.getCurrentPosition(
      currentLocation => this.setState({ currentLocation }),
      () => { this.setState({ currentLocation: null }); }
    );
  }

  updatePermissionIfChanged(permissionGranted) {
    const { updateLocationPermission, updateSecondPromptStatus } = this.props;
    const { permission, secondPrompt } = this.props.permissionStatus;
    const { APPROVED, DENIED } = PermissionStatus;

    const newPermission = permissionGranted ? APPROVED : DENIED;

    if (permission === newPermission &&
    !(newPermission === DENIED && !secondPrompt)) {
      return;
    }

    if (permission === PermissionStatus.DENIED && !secondPrompt) {
      updateSecondPromptStatus(true);
      this.promptForLocationPermission();
      return;
    }

    updateLocationPermission(newPermission);
    updateSecondPromptStatus(false);
  }

  locationPermissionGranted(currentLocation) {
    this.setState({ currentLocation });
    this.updatePermissionIfChanged(true);
  }

  locationPermissionDenied() {
    this.setState({ currentLocation: null });
    this.updatePermissionIfChanged(false);
  }

  checkPermissionStatus() {
    navigator.geolocation.getCurrentPosition(
      this.locationPermissionGranted,
      this.locationPermissionDenied
    );
  }

  refreshInvalidContent(nextProps, initialization = false) {
    const { selectedCategory, permissionStatus } = nextProps;
    const nextPermission = permissionStatus.permission;
    const currentPermission = this.props.permissionStatus.permission;

    if (!nextPermission) {
      return;
    }

    if (nextPermission !== currentPermission && !_.isEmpty(selectedCategory)) {
      this.fetchData(selectedCategory);
      return;
    }

    super.refreshInvalidContent(nextProps, initialization);
  }

  refreshData(category = this.props.selectedCategory) {
    this.fetchData(category);
  }

  fetchData(category) {
    const { find } = this.props;
    const { schema, currentLocation } = this.state;

    if (currentLocation === null) {
      return super.fetchData(category);
    }

    const { latitude, longitude } = currentLocation.coords;

    LayoutAnimation.easeInEaseOut();
    InteractionManager.runAfterInteractions(() =>
      find(schema, undefined, {
        /* eslint-disable quote-props, object-shorthand */
        'filter[categories]': category.id,
        'sort': 'location',
        'latitude': latitude,
        'longitude': longitude,
        /* eslint-enable quote-props, object-shorthand */
      })
    );
    return null;
  }

  toggleMapView() {
    const { mapView } = this.state;

    LayoutAnimation.easeInEaseOut();
    this.setState({ mapView: !mapView });
  }

  renderRightNavBarComponent() {
    const { mapView } = this.state;
    const actionText = mapView ? 'List' : 'Map';

    return (
      <View virtual styleName="container md-gutter-right">
        <TouchableOpacity
          onPress={this.toggleMapView}
        >
          <Subtitle>{actionText}</Subtitle>
        </TouchableOpacity>
      </View>
    );
  }

  promptForLocationPermission(message, confirmationMessage, onConfirmation) {
    const confirmOption = { text: confirmationMessage, onPress: onConfirmation };
    const cancelOption = { text: 'Cancel' };
    const alertOptions = [confirmOption, cancelOption];

    Alert.alert(
      'Grant location access',
      message,
      alertOptions,
    );
  }

  getNavBarProps() {
    return {
      ...super.getNavBarProps(),
      renderRightComponent: () => this.renderRightNavBarComponent(),
    };
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

  renderRow(place) {
    const { navigateTo } = this.props;
    const { formattedAddress } = place.location;

    return (
      <TouchableOpacity
        onPress={() => navigateTo({
          screen: ext('PlaceDetails'),
          props: { place },
        })}
      >
        <Image
          styleName="large-banner placeholder"
          source={place.image ? { uri: place.image.url } : undefined}
        >
        
        </Image>
        <View styleName="vertical v-center h-center" style={{marginLeft:20, marginRight:20, backgroundColor: '#00E8C3', padding: 12, bottom: 6}}>
        	<Title styleName="text-centric" style={{color: '#FFF', marginTop: 0, marginBottom: 0, fontWeight: 'bold'}} numberOfLines={2}>{place.name.toUpperCase()}</Title>
        	<Caption styleName="vertical v-center h-center" style={{marginTop: 0, color: '#FFF'}}>{place.type}</Caption>
        </View>
        <View styleName="text-centric" style={{backgroundColor: '#000'}}>
            <Caption styleName="vertical v-center h-center" style={{marginTop: 0, color: '#BBB'}}>{formattedAddress}</Caption>
        </View>
        <View styleName="horizontal v-end" style={{backgroundColor: '#000', padding: 5}}>
        		{this.renderBoolean(place.repair, "REPAIR", '#009245')}
        		{this.renderBoolean(place.rent, "RENT", '#29ABE2')}
        		{this.renderBoolean(place.shuttle, "SHUTTLE", '#FBB03B')}
        		{this.renderBoolean(place.guide, "GUIDE", '#FF0022')}
       	</View>
       
        
      </TouchableOpacity>
    );
  }

  renderMapView(data) {
    return (
      <MapList
        places={data}
      />
    );
  }

  isDataLoading(data) {
    const { permission } = this.props.permissionStatus;

    return isBusy(data) || !isInitialized(data) || permission === undefined;
  }

  renderData(data) {
    if (this.shouldRenderPlaceholderView()) {
      return this.renderPlaceholderView();
    }
    const loading = this.isDataLoading(data);

    return (
      <ListView
        data={data}
        loading={loading}
        renderRow={this.renderRow}
        onRefresh={this.refreshData}
        onLoadMore={this.loadMore}
        getSectionId={this.getSectionId}
        renderSectionHeader={this.renderSectionHeader}
      />
    );
  }

  render() {
    const { data } = this.props;
    const { mapView, renderCategoriesInline } = this.state;

    return (
      <Screen>
        <NavigationBar {...this.getNavBarProps()} />
        {renderCategoriesInline ? this.renderCategoriesDropDown('horizontal') : null}
        {mapView ? this.renderMapView(data) : this.renderData(data)}
      </Screen>
    );
  }

}
