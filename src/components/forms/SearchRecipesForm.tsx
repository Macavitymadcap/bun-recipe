import { TagEntity } from "../../database/repositories/tag-repository";
import { CloseIcon } from "../icons/CloseIcon";

interface SearchRecipesFormProps {
  availableTags: TagEntity[];
}

export const SearchRecipesForm = ({
  availableTags,
}: SearchRecipesFormProps) => {
  const hxOnSearchSubmitted = {
    "hx-on:htmx:after-request": "htmx.find('dialog').close();",
  };

  return (
    <form
      id="search-recipes-form"
      hx-post="/recipe/search"
      hx-target="#recipes"
      hx-swap="innerHTML"
      method="dialog"
      x-data="{ searchType: 'name' }"
      {...hxOnSearchSubmitted}
    >
      <section className="card-header grid">
        <span className="col-1"></span>
        <h2 className="text-center col-10">Search Recipes</h2>

        <button
          title="Cancel Search"
          type="button"
          className="btn btn-icon btn-outline-danger col-1 col-push-right"
          x-on:click="htmx.find('dialog').close();"
        >
          <CloseIcon />
        </button>
      </section>

      <search className="card-body grid">
        <fieldset className="primary col-12">
          <legend>Search Options</legend>

          <div className="form-group">
            <label htmlFor="search-type">Search by:</label>
            <select
              id="search-type"
              name="searchType"
              x-model="searchType"
              required
            >
              <option value="name">Recipe Name</option>
              <option value="tag">Tag</option>
              <option value="ingredient">Ingredient</option>
            </select>
          </div>

          <div className="form-group" x-show="searchType === 'name'">
            <label htmlFor="recipe-name">Recipe Name</label>
            <input
              type="text"
              id="recipe-name"
              name="recipeName"
              placeholder="Enter recipe name to search for..."
              x-bind:required="searchType === 'name'"
            />
          </div>

          <div className="form-group" x-show="searchType === 'tag'">
            <label htmlFor="recipe-tag">Tag</label>
            <input
              type="text"
              id="recipe-tag"
              name="recipeTag"
              placeholder="Enter tag to search for..."
              x-bind:required="searchType === 'tag'"
              list="availableTags"
            />
            <datalist id="availableTags">
              {availableTags.map((tag, index) => (
                <option key={index} value={tag.name}>
                  {tag.name}
                </option>
              ))}
            </datalist>
          </div>

          <div 
            className="form-group"
            x-show="searchType === 'ingredient'"
          >
            <label htmlFor="recipe-ingredient">Ingredient</label>
            <input
              type="text"
              id="recipe-ingredient"
              name="recipeIngredient"
              placeholder="Enter ingredient to search for..."
              x-bind:required="searchType === 'ingredient'"
            />
          </div>
        </fieldset>
      </search>

      <div className="card-footer wrapped-row">
        <button type="submit" className="btn btn-outline-primary">
          Search
        </button>

        <button
          className="btn btn-outline-warning"
          type="reset"
          title="Reset Form"
        >
          Reset
        </button>
      </div>
    </form>
  );
};
