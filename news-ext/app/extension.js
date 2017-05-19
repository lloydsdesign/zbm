// This file is managed by Shoutem CLI
// You should not change it
import pack from './package.json';

// screens imports
import ArticlesGridScreen from './screens/ArticlesGridScreen';
import ArticlesListScreen from './screens/ArticlesListScreen';
import ArticlesFeaturedListScreen from './screens/ArticlesFeaturedListScreen';
import ArticleDetailsScreen from './screens/ArticleDetailsScreen';
import ArticleMediumDetailsScreen from './screens/ArticleMediumDetailsScreen';
import TrailsList from './screens/TrailsList';
import TrailDetails from './screens/TrailDetails';

// themes imports


export const screens = {
  ArticlesGridScreen,
  ArticlesListScreen,
  ArticlesFeaturedListScreen,
  ArticleDetailsScreen,
  ArticleMediumDetailsScreen,
  TrailsList,
  TrailDetails
};

export const themes = {

};

export function ext(resourceName) {
  return resourceName ? `${pack.name}.${resourceName}` : pack.name;
}
