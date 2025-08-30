import { TagEntity } from "../../database/repositories/tag-repository";
import { CaloriesPerServingFormGroup } from "./input-groupings/CaloriesPerServingFormGroup";
import { CookingTimeFormGroup } from "./input-groupings/CookingTimeFormGroup";
import { CooksNotesSection } from "./input-groupings/CooksNotesSection";
import { IngredientsSection } from "./input-groupings/IngredientsSection";
import { DirectionsSection } from "./input-groupings/DirectionsSection";
import { PreperationTimeFormGroup } from "./input-groupings/PreperationTimeFormGroup";
import { RecipeNameFormGroup } from "./input-groupings/RecipeNameFormGroup";
import { ServingsFormGroup } from "./input-groupings/ServingsFormGroup";
import { TagFormGroup } from "./input-groupings/TagFormGroup";

interface CreateRecipeFormProps {
  availableTags: TagEntity[];
}

export const CreateRecipeForm = ({ availableTags }: CreateRecipeFormProps) => {
  return (
    <form
      id="create-recipe-form"
      hx-post="/recipe"
      hx-target="#main-content"
      hx-swap="innerHTML"
      hx-indicator="#creating"
      x-data={`{ingredients: [{ id: Date.now(), quantity: "", unit: "", name: "" }],
        directions: [{ id: Date.now() + 1, instruction: "" }],
        cooksNotes: [],
        tags: [],
        currentTagInput: "",

        addIngredient() {
          this.ingredients.push({
            id: Date.now(),
            quantity: "",
            unit: "",
            name: "",
          });
        },

        removeIngredient(index) {
          if (this.ingredients.length > 1) {
            this.ingredients.splice(index, 1);
          }
        },

        addDirection() {
          this.directions.push({
            id: Date.now(),
            instruction: "",
          });
        },

        removeDirection(index) {
          if (this.directions.length > 1) {
            this.directions.splice(index, 1);
          }
        },

        addCooksNote() {
          this.cooksNotes.push({
            id: Date.now(),
            note: "",
          });
        },

        removeCooksNote(index) {
          this.cooksNotes.splice(index, 1);
        },

        addTag() {
          const tagValue = this.currentTagInput.trim();
          if (tagValue && !this.tags.includes(tagValue)) {
            this.tags.push(tagValue);
            this.currentTagInput = "";
          }
        },

        removeTag(index) {
          this.tags.splice(index, 1);
        },

        handleTagInput(event) {
          // Handle comma-separated input
          const input = event.target.value;
          if (input.includes(",")) {
            const newTags = input
              .split(",")
              .map((tag) => tag.trim())
              .filter((tag) => tag && !this.tags.includes(tag));

            this.tags.push(...newTags);
            this.currentTagInput = "";
          }
        }
      }`}
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
      <DirectionsSection isUpdateForm={false} />
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
          hx-get="/data/default"
          hx-target="#main-content"
          hx-swap="innerHTML"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};
