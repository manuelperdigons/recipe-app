import Search from './models/Search';
import Recipe from './models/Recipe';
import * as searchView from './views/searchView';
import * as recipeView from './views/recipeView';
import { elements, renderLoader, clearLoader } from './views/base';
//  import { stat } from 'fs';

/** Global state of the app 
 * Search Object
 * Current Recipe Object
 * Shopping List Object
 * Liked Recipes
*/
const state = {};

/**
 * Search Controller
 */

const controlSearch = async () => {
    //  1 Get query from the view
    const query = searchView.getInput();

    if (query) {
        // 2 New search object and add it to state
        state.search = new Search(query);
        // 3 Prepare UI for results (loading spinner or clear search)
        searchView.clearInput();
        searchView.clearResults();
        renderLoader(elements.searchRes);

        try {
        // 4 Search for recipes
        await state.search.getResults();

        // 5 render results on UI
        clearLoader();
        searchView.renderResults(state.search.result);
        } catch (err) {
            alert('Something wrong with Search');
            clearLoader();
        }

    }
}

elements.searchForm.addEventListener('submit', e => {
    e.preventDefault();
    controlSearch();
})

elements.searchResPages.addEventListener('click', e => {
    const btn = e.target.closest('.btn-inline');
    if (btn) {
        const goToPage = parseInt(btn.dataset.goto, 10);
        searchView.clearResults();
        searchView.renderResults(state.search.result, goToPage);
    }
});


/**
 * Recipe Controller
 */

 const controlRecipe = async () => {
    // get ID from url    
    const id = window.location.hash.replace('#', '');
    console.log(id);

    if (id) {
        // Prepare UI for changes
        recipeView.clearRecipe();
        renderLoader(elements.recipe);
        if (state.search) searchView.highlightSelected(id);
        // Create new recipe object
        state.recipe = new Recipe(id);

        try {
        // Get Recipe data and parse ingredients
        await state.recipe.getRecipe();
        state.recipe.parseIngredients();
        // Calculate time and servings
        state.recipe.calcTime();
        state.recipe.calcServings();
        // Render Recipe
        clearLoader();
        recipeView.renderRecipe(state.recipe);
        
        } catch (err) {
            alert('Error processing Recipe');
        }

    }
 };

['hashchange', 'load'].forEach(event => window.addEventListener(event, controlRecipe));

// Handling Recipe Button Clicks

elements.recipe.addEventListener('click', e => {
    if (e.target.matches('.btn-decrease btn-decrease *')) {
        // Decrease button was clicked
    } else if (e.target.matches('.btn-increase btn-increase *')) {
        // Increase button was clicked
    }
})


