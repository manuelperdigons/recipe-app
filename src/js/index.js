import Search from './models/Search';
import Recipe from './models/Recipe';
import List from './models/List';
import Likes from './models/Likes';
import * as searchView from './views/searchView';
import * as recipeView from './views/recipeView';
import * as listView from './views/listView';
import * as likesView from './views/likesView';
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
        recipeView.renderRecipe(
            state.recipe,
            state.likes.isLiked(id)
            );
        
        } catch (err) {
            alert('Error processing Recipe');
        }

    }
 };

['hashchange', 'load'].forEach(event => window.addEventListener(event, controlRecipe));

/**
 * List Controller
 */

const controlList = () => {
    // Create a new list if there is not yet
    if (!state.list) state.list = new List();

    // Add each ingredient to the list and UI
    state.recipe.ingredients.forEach(el => {
       const item = state.list.addItem(el.count, el.unit, el.ingredient);
       listView.renderItem(item);
    });
};

// Handle delete and update list item events
elements.shopping.addEventListener('click', e => {
    const id = e.target.closest('.shopping__item').dataset.itemid;

    // Handle delete button
    if (e.target.matches('.shopping__delete, .shopping__delete *')) {
        // Delete from state
        state.list.deleteItem(id);
        // Delete from UI
        listView.deleteItem(id);
    } else if (e.target.matches('.shopping__count-value, .shopping__count-value *')) {
        const val = parseFloat(e.target.value);
        state.list.updateCount(id, val);
    }
});

/**
 * Likes Controller
 */

const controlLike = () => {
    if (!state.likes) state.likes = new Likes();
    const currentID = state.recipe.id;

    // User has not yet liked current recipe
    if (!state.likes.isLiked(currentID)) {
        // Add like to state
        const newLike = state.likes.addLike(
            currentID, 
            state.recipe.title,
            state.recipe.author,
            state.recipe.img
        );
        // Toggle like button
            likesView.toggleLikeBtn(true);
        // Add like to UI
        likesView.renderLike(newLike);
    // User has liked current recipe
    } else {
        // Delete like from state
        state.likes.deleteLike(currentID);
        // Toggle like button
        likesView.toggleLikeBtn(false);
        // Delete like from UI
        likesView.deleteLike(currentID);
    }

    likesView.togglelikeMenu(state.likes.getNumLikes());
};

// Restore liked recipes on page loaded

window.addEventListener('load', () => {
    state.likes = new Likes();

    // Restore likes
    state.likes.readStorage();

    // Toggle like button
    likesView.togglelikeMenu(state.likes.getNumLikes());

    // Render the existing likes
    state.likes.likes.forEach(like => {
        likesView.renderLike(like);
    });
});



// Handling Recipe Button Clicks

elements.recipe.addEventListener('click', e => {
    if (e.target.matches('.btn-decrease, .btn-decrease *')) {
        // Decrease button was clicked
        if (state.recipe.servings > 1)
        state.recipe.updateServings('dec');
        recipeView.updateServingsIngredients(state.recipe);
    } else if (e.target.matches('.btn-increase, .btn-increase *')) {
        // Increase button was clicked
        state.recipe.updateServings('inc');
        recipeView.updateServingsIngredients(state.recipe);
    } else if (e.target.matches('.recipe__btn--add, .recipe__btn--add *')) {
        // Add to shopping list button was clicked
        controlList();
    } else if (e.target.matches('.recipe__love, .recipe__love *')) {
        // Like controller
        controlLike();
    }
});