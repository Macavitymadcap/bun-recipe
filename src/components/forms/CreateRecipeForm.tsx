import { TagEntity } from "../../database/repositories/tag-repository";
import { CloseIcon } from "../icons/CloseIcon";
import { CaloriesPerPortionInput } from "./input-groupings/CaloriesPerPortionInput";
import { CookingTimeInput } from "./input-groupings/CookingTimeInput";
import { CooksNotesFieldset } from "./input-groupings/CooksNotesFieldset";
import { IngredientsFieldset } from "./input-groupings/IngredientsFieldset";
import { MethodStepsFieldset } from "./input-groupings/MethodStepsFieldset";
import { PreperationTimeInput } from "./input-groupings/PreperationTimeInput";
import { RecipeNameInput } from "./input-groupings/RecipeNameInput";
import { ServingsInput } from "./input-groupings/ServingsInput";
import { TagInput } from "./input-groupings/TagInput";

interface CreateRecipeFormProps {
  availableTags: TagEntity[];
}

export const CreateRecipeForm = ({ availableTags }: CreateRecipeFormProps) => {
  const hxOnCreateSuccessful = {
    "hx-on:htmx:after-request":
      "if(event.detail.successful) { htmx.find('dialog').close(); }",
  };

  return (
    <form
      id="create-recipe-form"
      hx-post="/recipe"
      hx-target="#recipes"
      hx-swap="beforeend"
      {...hxOnCreateSuccessful}
      x-data="recipeForm()"
    >
      <section className="card-header grid">
        <span className="col-1"></span>

        <h2 className="text-center col-10">Add New Recipe</h2>

        <button
          className="btn btn-icon btn-outline-danger col-1"
          type="button"
          title="Cancel Recipe Creation"
          x-on:click="htmx.find('dialog').close()"
        >
          <CloseIcon />
        </button>
      </section>

      <div className="card-body">
        <div className="grid">
          <RecipeNameInput />
          <ServingsInput />
          <CaloriesPerPortionInput />
          <PreperationTimeInput />
          <CookingTimeInput />
        </div>

        <TagInput availableTags={availableTags} />
        <IngredientsFieldset isUpdateForm={false} />
        <MethodStepsFieldset isUpdateForm={false} />
        <CooksNotesFieldset isUpdateForm={false} />
      </div>

      <div className="card-footer wrapped-row">
        <button
          className="btn btn-outline-success"
          type="submit"
          title="Add Recipe"
        >
          Add Recipe
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
