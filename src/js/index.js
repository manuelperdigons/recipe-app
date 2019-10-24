 import axios from "axios";

async function getResults(query) {
    const key = `e37fb42365c76478f64f9d8206f19a94`;
    try {
        const res = await axios(`https://www.food2fork.com/api/search?key=${key}&q=${query}`);
        const recipes = res.data.recipes;
        console.log(recipes);
    } catch (error) {
        alert(error);
    }
}
getResults('tomato pasta');



