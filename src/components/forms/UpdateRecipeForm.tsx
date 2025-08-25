import { CompleteRecipe } from "../../database/services/recipe-service";
import { RecipeNameFormGroup } from "./input-groupings/RecipeNameFormGroup";
import { ServingsFormGroup } from "./input-groupings/ServingsFormGroup";
import { CaloriesPerServingFormGroup } from "./input-groupings/CaloriesPerServingFormGroup";
import { PreperationTimeFormGroup } from "./input-groupings/PreperationTimeFormGroup";
import { CookingTimeFormGroup } from "./input-groupings/CookingTimeFormGroup";
import { TagFormGroup } from "./input-groupings/TagFormGroup";
import { IngredientsSection } from "./input-groupings/IngredientsSection";
import { MethodStepsSection } from "./input-groupings/MethodStepsSection";
import { CooksNotesSection } from "./input-groupings/CooksNotesSection";
import { TagEntity } from "../../database/repositories/tag-repository";

interface UpdateRecipeFormProps {
  recipe: CompleteRecipe;
  availableTags: TagEntity[];
}

const UpdateRecipeForm = ({ recipe, availableTags }: UpdateRecipeFormProps) => {
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

  const resetAction = {
    "x-on:click.prevent": `
      ingredients = ${JSON.stringify(alpineData.ingredients)};
      methodSteps = ${JSON.stringify(alpineData.methodSteps)};
      cooksNotes = ${JSON.stringify(alpineData.cooksNotes)};
      tags = ${JSON.stringify(alpineData.tags)};
    `,
  };

  return (
    <form
      id="update-recipe-form"
      hx-put={`/recipe/${recipe.id}`}
      hx-target="#main-content"
      hx-swap="innerHTML"
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
      <h2 className="text-center">Update Recipe</h2>

      <div className="grid">
        <RecipeNameFormGroup value={recipe.name} />
        <ServingsFormGroup value={recipe.servings} />
        <CaloriesPerServingFormGroup value={recipe.calories_per_serving} />
        <PreperationTimeFormGroup value={recipe.preparation_time} />
        <CookingTimeFormGroup value={recipe.cooking_time} />
      </div>

      <TagFormGroup availbaleTags={availableTags} />
      <IngredientsSection isUpdateForm={true} />
      <MethodStepsSection isUpdateForm={true} />
      <CooksNotesSection isUpdateForm={true} />

      <div className="wrapped-row">
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
          {...resetAction}
        >
          Reset
        </button>

        <button
          className="btn btn-outline-danger"
          type="button"
          title="Cancel Recipe Update"
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

export { UpdateRecipeForm, type UpdateRecipeFormProps };
