import 'core-js/stable';
import 'regenerator-runtime/runtime';
import * as model from './model.js';
import recipeView from './view/recipeView.js';
import searchView from './view/searchView.js';
import resultView from './view/resultsView.js';
import paginationView from './view/paginationView.js';
import bookmarksView from './view/bookmarkView.js';
import addRecipeView from './view/addRecipeView.js';
import { MODAL_CLOSE_TIME_SECS } from './config.js';

// https://forkify-api.herokuapp.com/v2

///////////////////////////////////////

//Parcel config
// if (module.hot) {
//   module.hot.accept();
// }

//Publisher - Subscriber Pattern

const init = function () {
  recipeView.addHandlerRender(controlRecipes);
  recipeView.addHandlerUpdateServing(controlServings);
  recipeView.addHandlerAddBookmark(controlAddBookmark);
  searchView.addHandlerRender(controlSearchRecipes);
  paginationView.addHandlerClick(controlPagination);
  // Render bookmarks view
  bookmarksView.render(model.state.bookmarks);
  addRecipeView.addHandlerUpload(controlAddRecipe);
};

const controlRecipes = async function () {
  try {
    const id = window.location.hash.slice(1);
    console.log(id);
    if (!id) return;
    // Loading spinner
    recipeView.renderSpinner();

    //Update results view to mark selected search result
    //When # changes we need to keep the item with selected as selected. So need to re-render the result view, but only update instead of rendering everything again
    resultView.update(model.getSearchPageResults());

    // Update booksmarks view to highlight selected recipe
    bookmarksView.update(model.state.bookmarks);

    // Load recipe
    await model.loadRecipe(id);

    //Rendering recipe
    recipeView.render(model.state.recipe);
  } catch (err) {
    //console.log(`${err.message} 🔴🔴🔴🔴`);
    recipeView.renderError();
  }
};

const controlSearchRecipes = async function () {
  try {
    //Get Query
    const query = searchView.getQuery();

    if (!query) return;
    // Load search results

    // Loading spinner
    resultView.renderSpinner();

    await model.loadSearchResult(query);

    //Rendering results
    resultView.render(model.getSearchPageResults());

    // Render initial pagination view
    paginationView.render(model.state.search);
  } catch (err) {
    //console.log(`${err.message} 🔴🔴🔴🔴`);
    recipeView.renderError();
  }
};

const controlPagination = async function (goto) {
  try {
    //Rendering new results
    resultView.render(model.getSearchPageResults(goto));

    // Render pagination view
    paginationView.render(model.state.search);
  } catch (err) {
    //console.log(`${err.message} 🔴🔴🔴🔴`);
    paginationView.renderError();
  }
};

const controlServings = async function (newServings) {
  // Update recipe servings(in state)
  model.updateServings(newServings);
  // Update recipe view
  //recipeView.render(model.state.recipe);
  recipeView.update(model.state.recipe);
};

const controlAddBookmark = async function () {
  // Add/Remove bookmark
  if (!model.state.recipe.bookmarked) {
    model.addBookmark(model.state.recipe);
  } else {
    model.deleteBookmark(model.state.recipe.id);
  }
  // Update recipe view
  recipeView.update(model.state.recipe);

  // Render bookmarks view
  bookmarksView.render(model.state.bookmarks);
};

const controlAddRecipe = async function (newRecipeData) {
  try {
    // Show Spinner
    addRecipeView.renderSpinner();
    // Upload New Recipe
    await model.uploadRecipe(newRecipeData);
    // Render New Recipe
    recipeView.render(model.state.recipe);

    // Render success message
    addRecipeView.renderMessage();

    //Close window
    setTimeout(function () {
      addRecipeView.toggleWindow();
    }, MODAL_CLOSE_TIME_SECS * 1000);

    // Render bookmarks
    bookmarksView.render(model.state.bookmarks);

    // Change ID in URL
    window.history.pushState(null, '', `#${model.state.recipe.id}`);
  } catch (err) {
    addRecipeView.renderError(err.message);
  }
};

init();
