export const CreateRecipeForm = () => {
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
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            width="24"
            height="24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M6 18L18 6"></path>
            <path d="M6 6l12 12"></path>
          </svg>
        </button>
      </section>

      <section className="card-body">
        {/* Basic Recipe Information */}
        <div className="grid">
          <div className="form-group col-12">
            <label htmlFor="name">Recipe Name</label>
            <input
              type="text"
              id="name"
              name="name"
              placeholder="Recipe name"
              required
            />
            <span className="text-danger text-sm"></span>
          </div>

          <div className="form-group col-6">
            <label htmlFor="servings">Servings</label>
            <input
              type="text"
              id="servings"
              name="servings"
              placeholder="e.g., 4-6"
              required
            />
            <span className="text-danger text-sm"></span>
          </div>

          <div className="form-group col-6">
            <label htmlFor="calories_per_portion">Calories per Portion</label>
            <input
              type="number"
              id="calories_per_portion"
              name="calories_per_portion"
              placeholder="Optional"
            />
            <span className="text-danger text-sm"></span>
          </div>

          <div className="form-group col-6">
            <label htmlFor="preparation_time">Preparation Time</label>
            <input
              type="text"
              id="preparation_time"
              name="preparation_time"
              placeholder="e.g., 30 minutes"
            />
            <span className="text-danger text-sm"></span>
          </div>

          <div className="form-group col-6">
            <label htmlFor="cooking_time">Cooking Time</label>
            <input
              type="text"
              id="cooking_time"
              name="cooking_time"
              placeholder="e.g., 1 hour"
            />
            <span className="text-danger text-sm"></span>
          </div>
        </div>

        {/* Tags Section */}
        <div className="form-group">
          <label htmlFor="tags">Tags (Optional)</label>
          <input
            type="text"
            id="tags"
            name="tags"
            placeholder="e.g., vegetarian, quick, dessert (comma-separated)"
          />
          <span className="text-danger text-sm"></span>
        </div>

        {/* Ingredients Section */}
        <fieldset>
          <legend>Ingredients</legend>
          <ul id="ingredients-list" x-show="ingredients.length > 0">
            <template
              x-for="(ingredient, index) in ingredients"
              x-bind:key="ingredient.id"
            >
              <li x-data="{ ingredient }" className="mb-3">
                <div className="grid">
                  <div className="form-group col-3">
                    <label x-bind:for="'ingredient-quantity-' + index">
                      Quantity
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      x-bind:id="'ingredient-quantity-' + index"
                      x-bind:name="'ingredients[' + index + '][quantity]'"
                      x-model="ingredient.quantity"
                      placeholder="2"
                      required
                    />
                  </div>

                  <div className="form-group col-3">
                    <label x-bind:for="'ingredient-unit-' + index">Unit</label>
                    <input
                      type="text"
                      x-bind:id="'ingredient-unit-' + index"
                      x-bind:name="'ingredients[' + index + '][unit]'"
                      x-model="ingredient.unit"
                      placeholder="cups"
                    />
                  </div>

                  <div className="form-group col-5">
                    <label x-bind:for="'ingredient-name-' + index">
                      Ingredient
                    </label>
                    <input
                      type="text"
                      x-bind:id="'ingredient-name-' + index"
                      x-bind:name="'ingredients[' + index + '][name]'"
                      x-model="ingredient.name"
                      placeholder="flour"
                      required
                    />
                  </div>

                  <div className="form-group col-1">
                    <label>&nbsp;</label>
                    <button
                      type="button"
                      className="btn btn-icon btn-outline-danger"
                      title="Remove ingredient"
                      x-on:click="removeIngredient(index)"
                    >
                      <svg
                        aria-hidden="true"
                        viewBox="0 0 24 24"
                        width="20"
                        height="20"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M6 18L18 6"></path>
                        <path d="M6 6l12 12"></path>
                      </svg>
                    </button>
                  </div>
                </div>
              </li>
            </template>
          </ul>

          <div x-show="ingredients.length === 0" className="text-center text-surface-low mb-3">
            <em>No ingredients added yet. Click "Add Ingredient" to get started.</em>
          </div>

          <button
            type="button"
            className="btn btn-outline-success mt-3"
            x-on:click="addIngredient()"
          >
            Add Ingredient
          </button>
        </fieldset>

        {/* Method Steps Section */}
        <fieldset>
          <legend>Method</legend>
          <ol id="method-list" x-show="methodSteps.length > 0">
            <template x-for="(step, index) in methodSteps" x-bind:key="step.id">
              <li x-data="{ step }" className="mb-3">
                <div className="grid">
                  <div className="form-group col-11">
                    <label x-bind:for="'method-step-' + index">
                      Step <span x-text="index + 1"></span>
                    </label>
                    <textarea
                      x-bind:id="'method-step-' + index"
                      x-bind:name="'method[' + index + '][instruction]'"
                      x-model="step.instruction"
                      placeholder="Describe what to do in this step..."
                      rows={2}
                      required
                    ></textarea>
                  </div>

                  <div className="form-group col-1">
                    <label>&nbsp;</label>
                    <button
                      type="button"
                      className="btn btn-icon btn-outline-danger"
                      title="Remove step"
                      x-on:click="removeMethodStep(index)"
                    >
                      <svg
                        aria-hidden="true"
                        viewBox="0 0 24 24"
                        width="20"
                        height="20"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M6 18L18 6"></path>
                        <path d="M6 6l12 12"></path>
                      </svg>
                    </button>
                  </div>
                </div>
              </li>
            </template>
          </ol>

          <div x-show="methodSteps.length === 0" className="text-center text-surface-low mb-3">
            <em>No method steps added yet. Click "Add Step" to get started.</em>
          </div>

          <button
            type="button"
            className="btn btn-outline-success mt-3"
            x-on:click="addMethodStep()"
          >
            Add Step
          </button>
        </fieldset>

        {/* Cook's Notes Section */}
        <fieldset>
          <legend>Cook's Notes (Optional)</legend>
          <ul id="notes-list" x-show="cooksNotes.length > 0">
            <template x-for="(note, index) in cooksNotes" x-bind:key="note.id">
              <li x-data="{ note }" className="mb-3">
                <div className="grid">
                  <div className="form-group col-11">
                    <label x-bind:for="'note-' + index">Note</label>
                    <textarea
                      x-bind:id="'note-' + index"
                      x-bind:name="'cooksNotes[' + index + '][note]'"
                      x-model="note.note"
                      placeholder="Tips, substitutions, or additional information..."
                      rows={2}
                    ></textarea>
                  </div>

                  <div className="form-group col-1">
                    <label>&nbsp;</label>
                    <button
                      type="button"
                      className="btn btn-icon btn-outline-danger"
                      title="Remove note"
                      x-on:click="removeCooksNote(index)"
                    >
                      <svg
                        aria-hidden="true"
                        viewBox="0 0 24 24"
                        width="20"
                        height="20"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M6 18L18 6"></path>
                        <path d="M6 6l12 12"></path>
                      </svg>
                    </button>
                  </div>
                </div>
              </li>
            </template>
          </ul>

          <div x-show="cooksNotes.length === 0" className="text-center text-surface-low mb-3">
            <em>No notes added yet. Click "Add Note" to get started.</em>
          </div>

          <button
            type="button"
            className="btn btn-outline-success mt-3"
            x-on:click="addCooksNote()"
          >
            Add Note
          </button>
        </fieldset>
      </section>

      <section className="card-footer wrapped-row">
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
      </section>
    </form>
  );
};

