import Search from './models/Search'
import * as searchView from './views/searchView'
import { elements, renderLoader, clearLoader } from './views/base'

/** Global state of the app 
 * Search Object
 * Current Recipe Object
 * Shopping List Object
 * Liked Recipes
*/
const state = {};

const controlSeach = async () => {
    //  1 Get query from the view
    const query = searchView.getInput();

    if (query) {
        // 2 New search object and add it to state
        state.search = new Search(query);
        // 3 Prepare UI for results (loading spinner or clear search)
        searchView.clearInput();
        searchView.clearResults();
        renderLoader(elements.searchRes);
        // 4 Search for recipes
        await state.search.getResults();

        // 5 render results on UI
        clearLoader();
        searchView.renderResults(state.search.result);
    }
}

elements.searchForm.addEventListener('submit', e => {
    e.preventDefault();
    controlSeach();
})



