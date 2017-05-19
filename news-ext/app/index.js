import ArticlesGridScreen from './screens/ArticlesGridScreen';
import ArticleDetailsScreen from './screens/ArticleDetailsScreen';
import ArticleMediumDetailsScreen from './screens/ArticleMediumDetailsScreen';
import ArticlesListScreen from './screens/ArticlesListScreen';
import ArticlesFeaturedListScreen from './screens/ArticlesFeaturedListScreen';
import TrailsList from './screens/TrailsList';
import TrailDetails from './screens/TrailDetails';
import reducer from './reducer';

const screens = {
  ArticlesListScreen,
  ArticlesGridScreen,
  ArticleDetailsScreen,
  ArticleMediumDetailsScreen,
  ArticlesFeaturedListScreen,
  TrailsList,
  TrailDetails
};

export {
  reducer,
  screens
};