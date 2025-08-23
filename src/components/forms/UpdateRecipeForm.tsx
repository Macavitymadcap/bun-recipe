import { CloseIcon } from "../icons/CloseIcon";
import { CompleteRecipe } from "../../database/services/recipe-service";
import { TagEntity } from "../../database/repositories/tag-repository";
import { RecipeNameInput } from "./input-groupings/RecipeNameInput";
import { ServingsInput } from "./input-groupings/ServingsInput";
import { CaloriesPerPortionInput } from "./input-groupings/CaloriesPerPortionInput";
import { PreperationTimeInput } from "./input-groupings/PreperationTimeInput";
import { CookingTimeInput } from "./input-groupings/CookingTimeInput";
import { TagInput } from "./input-groupings/TagInput";
import { IngredientsFieldset } from "./input-groupings/IngredientsFieldset";
import { MethodStepsFieldset } from "./input-groupings/MethodStepsFieldset";
import { CooksNotesFieldset } from "./input-groupings/CooksNotesFieldset";

interface UpdateRecipeFormProps {
  recipe: CompleteRecipe;
  availableTags: TagEntity[];
}

const UpdateRecipeForm = ({ recipe, availableTags }: UpdateRecipeFormProps) => {
  const hxOnUpdateSuccessful = {
    "hx-on:htmx:after-request":
      "if(event.detail.successful) { htmx.find('dialog').close(); }",
  };

  // Prepare data for Alpine.js
  const alpineData = {
    ingredients: recipe.ingredients.map((ing) => ({
      quantity: ing.quantity,
      unit: ing.unit || "",
      name: ing.name,
    })),
    methodSteps: recipe.methodSteps.map((step) => ({
      instruction: step.instruction,
    })),
    cooksNotes: recipe.cooksNotes.map((note) => note || note),
    tags: recipe.tags,
  };

  return (
    <form
      id="update-recipe-form"
      hx-put={`/recipe/${recipe.id}`}
      hx-target={`#recipe-${recipe.id}`}
      hx-swap="outerHTML"
      {...hxOnUpdateSuccessful}
      x-data={`{
        ingredients: ${JSON.stringify(alpineData.ingredients)},
        methodSteps: ${JSON.stringify(alpineData.methodSteps)},
        cooksNotes: ${JSON.stringify(alpineData.cooksNotes)},
        tags: ${JSON.stringify(alpineData.tags)},
        currentTagInput: "",
        
        addIngredient() {
          this.ingredients.push({ quantity: 1, unit: '', name: '' });
        },
        
        removeIngredient(index) {
          if (this.ingredients.length > 1) {
            this.ingredients.splice(index, 1);
          }
        },
        
        addMethodStep() {
          this.methodSteps.push({ instruction: '' });
        },
        
        removeMethodStep(index) {
          if (this.methodSteps.length > 1) {
            this.methodSteps.splice(index, 1);
          }
        },
        
        addCooksNote() {
          this.cooksNotes.push('');
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
            const newTags = input.split(",")
              .map(tag => tag.trim())
              .filter(tag => tag && !this.tags.includes(tag));
            
            this.tags.push(...newTags);
            this.currentTagInput = "";
          }
        }
      }`}
    >
      <section className="card-header grid">
        <span className="col-1"></span>

        <h2 className="text-center col-10">Update Recipe</h2>

        <button
          className="btn btn-icon btn-outline-danger col-1"
          type="button"
          title="Cancel Recipe Update"
          x-on:click="htmx.find('dialog').close()"
        >
          <CloseIcon />
        </button>
      </section>

      <div className="card-body">
        <div className="grid">
          <RecipeNameInput value={recipe.name} />
          <ServingsInput value={recipe.servings} />
          <CaloriesPerPortionInput value={recipe.calories_per_portion} />
          <PreperationTimeInput value={recipe.preparation_time} />
          <CookingTimeInput value={recipe.cooking_time} />
        </div>

        <TagInput availableTags={availableTags} />
        <IngredientsFieldset isUpdateForm={true} />
        <MethodStepsFieldset isUpdateForm={true} />
        <CooksNotesFieldset isUpdateForm={true} />
      </div>

      <div className="card-footer wrapped-row">
        <button
          className="btn btn-outline-secondary"
          type="submit"
          title="Update Recipe"
        >
          Update
        </button>

        <button
          className="btn btn-outline-warning"
          title="Reset Form"
          x-on:click={`
            ingredients = ${JSON.stringify(alpineData.ingredients)};
            methodSteps = ${JSON.stringify(alpineData.methodSteps)};
            cooksNotes = ${JSON.stringify(alpineData.cooksNotes)};
            tags = ${JSON.stringify(alpineData.tags)};
          `}
        >
          Reset
        </button>
      </div>
    </form>
  );
};

export { UpdateRecipeForm, type UpdateRecipeFormProps };
