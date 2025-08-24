import { DeleteIcon } from "../../icons/DeleteIcon";

export interface IngredientFieldsetProps {
  isUpdateForm: boolean;
}

export const IngredientsFieldset = ({
  isUpdateForm,
}: IngredientFieldsetProps) => {
  const quantityModel = {
    "x-model.number": "ingredient.quantity",
  };

  return (
    <fieldset className={isUpdateForm ? "secondary" : "success"}>
      <legend>Ingredients</legend>
      <ul id="ingredients-list" x-show="ingredients.length > 0">
        <template x-for="(ingredient, index) in ingredients" x-bind:key="index">
          <li x-data="{ ingredient }" className="mb-3">
            <div className="grid">
              <div className="form-group col-3">
                {isUpdateForm ? (
                  <>
                    <label
                      x-bind:for="`ingredient-quantity-${index}`"
                      x-text="index === 0 ? 'Quantity' : ''"
                    ></label>
                    <input
                      type="number"
                      step="0.01"
                      x-bind:id="`ingredient-quantity-${index}`"
                      x-bind:name="`ingredients[${index}][quantity]`"
                      {...quantityModel}
                      placeholder="2"
                      required
                    />
                  </>
                ) : (
                  <>
                    <label x-bind:for="'ingredient-quantity-' + index">
                      Quantity
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      x-bind:id="'ingredient-quantity-' + index"
                      x-bind:name="'ingredients[' + index + '][quantity]'"
                      {...quantityModel}
                      placeholder="2"
                      required
                    />
                  </>
                )}
              </div>

              <div className="form-group col-3">
                {isUpdateForm ? (
                  <>
                    <label
                      x-bind:for="`ingredient-unit-${index}`"
                      x-text="index === 0 ? 'Unit' : ''"
                    ></label>
                    <input
                      type="text"
                      x-bind:id="`ingredient-unit-${index}`"
                      x-bind:name="`ingredients[${index}][unit]`"
                      x-model="ingredient.unit"
                      placeholder="cups"
                    />
                  </>
                ) : (
                  <>
                    <label x-bind:for="'ingredient-unit-' + index">Unit</label>
                    <input
                      type="text"
                      x-bind:id="'ingredient-unit-' + index"
                      x-bind:name="'ingredients[' + index + '][unit]'"
                      x-model="ingredient.unit"
                      placeholder="cups"
                    />
                  </>
                )}
              </div>

              <div className="form-group col-5">
                {isUpdateForm ? (
                  <>
                    <label
                      x-bind:for="`ingredient-name-${index}`"
                      x-text="index === 0 ? 'Ingredient' : ''"
                    ></label>
                    <input
                      type="text"
                      x-bind:id="`ingredient-name-${index}`"
                      x-bind:name="`ingredients[${index}][name]`"
                      x-model="ingredient.name"
                      placeholder="flour"
                      required
                    />
                  </>
                ) : (
                  <>
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
                  </>
                )}
              </div>

              <div className="col-1">
                <button
                  type="button"
                  className="btn btn-icon btn-outline-danger"
                  title="Remove ingredient"
                  x-on:click="removeIngredient(index)"
                  x-bind:disabled={
                    isUpdateForm ? "ingredients.length <= 1" : undefined
                  }
                >
                  <DeleteIcon />
                </button>
              </div>
            </div>
          </li>
        </template>
      </ul>

      <div
        x-show="ingredients.length === 0"
        className="text-center text-surface-low mb-3"
      >
        <em>
          No ingredients added yet. Click "Add Ingredient" to get started.
        </em>
      </div>

      <div className="wrapped-row">
        <button
          type="button"
          className="btn btn-outline-success mt-3"
          x-on:click="addIngredient()"
        >
          Add Ingredient
        </button>
      </div>
    </fieldset>
  );
};
