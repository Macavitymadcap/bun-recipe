import { TagEntity } from "../../database/repositories/tag-repository";
import { CaloriesPerServingFormGroup } from "./input-groupings/CaloriesPerServingFormGroup";
import { CookingTimeFormGroup } from "./input-groupings/CookingTimeFormGroup";
import { CooksNotesSection } from "./input-groupings/CooksNotesSection";
import { IngredientsSection } from "./input-groupings/IngredientsSection";
import { MethodStepsSection } from "./input-groupings/MethodStepsSection";
import { PreperationTimeFormGroup } from "./input-groupings/PreperationTimeFormGroup";
import { RecipeNameFormGroup } from "./input-groupings/RecipeNameFormGroup";
import { ServingsFormGroup } from "./input-groupings/ServingsFormGroup";
import { TagFormGroup } from "./input-groupings/TagFormGroup";

interface CreateRecipeFormProps {
  availableTags: TagEntity[];
}

export const CreateRecipeForm = ({availableTags}: CreateRecipeFormProps) => {
  return (
    <form
      id="create-recipe-form"
      hx-post="/recipe"
      hx-target="#main-content"
      hx-swap="innerHTML"
      x-data="recipeForm()"
    >
      <h2 className="text-center">Create Recipe</h2>

      <div className="grid">
        <RecipeNameFormGroup />
        <ServingsFormGroup />
        <CaloriesPerServingFormGroup />
        <PreperationTimeFormGroup />
        <CookingTimeFormGroup />
      </div>

      <TagFormGroup availbaleTags={availableTags} />
      <IngredientsSection isUpdateForm={false} />
      <MethodStepsSection isUpdateForm={false} />
      <CooksNotesSection isUpdateForm={false} />

      <div className="wrapped-row">
        <button
          className="btn btn-outline-success"
          type="submit"
          title="Create Recipe"
        >
          Create
        </button>

        <button
          className="btn btn-outline-warning"
          type="reset"
          title="Reset Form"
        >
          Reset
        </button>

        <button
          className="btn btn-outline-danger"
          title="Cancel recipe creation"
          hx-get="/info/default"
          hx-target="#main-content"
          hx-swap="innerHTML"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};
