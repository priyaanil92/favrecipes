import { API_URL, PER_PAGE, API_KEY } from './config.js';
import { getJSON, sendJSON } from './helper.js';

export const state = {
  recipe: {},
  search: {
    query: '',
    recipes: [],
    resultsPerPage: Number(PER_PAGE),
    page: 1,
  },
  bookmarks: [],
};

const createRecipeObject = function (recipe) {
  return {
    id: recipe.id,
    title: recipe.title,
    publisher: recipe.publisher,
    sourceUrl: recipe.source_url,
    image: recipe.image_url,
    servings: recipe.servings,
    cookingTime: recipe.cooking_time,
    ingredients: recipe.ingredients,
    ...(recipe.key && { key: recipe.key }),
  };
};

export const loadRecipe = async function (id) {
  try {
    const { recipe } = await getJSON(`${API_URL}${id}?key=${API_KEY}`);
    state.recipe = createRecipeObject(recipe);
    if (state.bookmarks.some(bookmark => bookmark.id === id)) {
      state.recipe.bookmarked = true;
    } else {
      state.recipe.bookmarked = false;
    }
    //console.log(state.recipe);
  } catch (err) {
    //console.log(`${err.message} 🔴🔴🔴🔴`);
    throw err;
  }
};

export const loadSearchResult = async function (query) {
  try {
    const { recipes } = await getJSON(
      `${API_URL}?search=${query}&key=${API_KEY}`
    );
    state.search.recipes = recipes.map(recipe => {
      return {
        id: recipe.id,
        title: recipe.title,
        publisher: recipe.publisher,
        image: recipe.image_url,
        ...(recipe.key && { key: recipe.key }),
      };
    });
    state.search.query = query;
    state.search.page = 1;
  } catch (err) {
    throw err;
  }
};

export const getSearchPageResults = function (page = state.search.page) {
  state.search.page = page;
  const start = (page - 1) * state.search.resultsPerPage;
  const end = page * state.search.resultsPerPage;
  return state.search.recipes.slice(start, end);
};

export const updateServings = function (newServings) {
  state.recipe.ingredients.forEach(ingredient => {
    //newQty = oldQty * newServings/oldServings;
    ingredient.quantity =
      ingredient.quantity * (newServings / state.recipe.servings);
  });

  state.recipe.servings = newServings;
};

const persistBookmark = function () {
  localStorage.setItem('bookmarks', JSON.stringify(state.bookmarks));
};

export const addBookmark = function (recipe) {
  state.bookmarks.push(recipe);
  if (recipe.id === state.recipe.id) {
    state.recipe.bookmarked = true;
  }
  persistBookmark();
};

export const deleteBookmark = function (id) {
  const index = state.bookmarks.findIndex(bookmark => bookmark.id === id);
  state.bookmarks.splice(index, 1);
  if (id === state.recipe.id) {
    state.recipe.bookmarked = false;
  }
  persistBookmark();
};

const init = function () {
  const storage = localStorage.getItem('bookmarks');
  if (storage) state.bookmarks = JSON.parse(storage);
};

export const uploadRecipe = async function (newRecipe) {
  try {
    const ingredients = Object.entries(newRecipe)
      .filter(entry => entry[0].startsWith('ingredient') && entry[1] !== '')
      .map(ingredient => {
        //const ingArr = ingredient[1].replaceAll(' ', '').split(',');
        const ingArr = ingredient[1].split(',').map(ing => ing.trim());
        if (ingArr.length !== 3)
          throw new Error(
            'Wrong ingredient format, Please enter using correct format'
          );
        const [quantity, unit, description] = ingArr;
        return {
          quantity: quantity ? Number(quantity) : null,
          unit,
          description,
        };
      });
    let newRecipeToSend = {
      title: newRecipe.title,
      source_url: newRecipe.sourceUrl,
      image_url: newRecipe.image,
      publisher: newRecipe.publisher,
      cooking_time: Number(newRecipe.cookingTime),
      servings: Number(newRecipe.servings),
      ingredients,
    };
    const { recipe } = await sendJSON(
      `${API_URL}?key=${API_KEY}`,
      newRecipeToSend
    );
    state.recipe = createRecipeObject(recipe);
    addBookmark(state.recipe);
  } catch (err) {
    console.log(err);
    throw err;
  }
};

init();
