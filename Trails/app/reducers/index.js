import { storage, collection } from '@shoutem/redux-io';

import { combineReducers } from 'redux';
import { ext } from '../const';

export default combineReducers({
  trails: storage(ext('Trails')),
  allTrails: collection(ext('Trails'), 'all')
});