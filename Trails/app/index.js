// Constants `screens` and `reducer` are exported via named export
// It is important to use those exact names

import reducer from './reducers';
import TrailsList from './screens/TrailsList.js'
import TrailDetails from './screens/TrailDetails.js'
import Map from './screens/Map.js';

export const screens = {
  TrailsList,
  TrailDetails,
  Map
};

export { reducer };
