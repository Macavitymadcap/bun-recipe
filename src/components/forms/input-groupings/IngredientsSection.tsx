import { AddIcon } from "../../icons/AddIcon";
import { DeleteIcon } from "../../icons/DeleteIcon";

export interface IngredientSectionProps {
  isUpdateForm: boolean;
}

export const IngredientsSection = ({
  isUpdateForm,
}: IngredientSectionProps) => {
  const quantityModel = {
    "x-model.number": "ingredient.quantity",
  };

  return (
    <section>
      <header className="grid">
        <h3 className="col-11">Ingredients</h3>

        <button
          type="button"
          title="Add Ingredient"
          className="btn btn-icon btn-outline-success col-1 col-push-right"
          x-on:click="addIngredient()"
        >
          <AddIcon />
        </button>
      </header>

      <ul
        id="ingredients-list"
        className="unstyled"
        x-show="ingredients.length > 0"
      >
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
                      type="text"
                      list="fractions"
                      x-bind:id="`ingredient-quantity-${index}`"
                      x-bind:name="`ingredients[${index}][quantity]`"
                      {...quantityModel}
                      placeholder="2"
                    />
                  </>
                ) : (
                  <>
                    <label x-bind:for="'ingredient-quantity-' + index">
                      Quantity
                    </label>
                    <input
                      type="text"
                      list="fractions"
                      x-bind:id="'ingredient-quantity-' + index"
                      x-bind:name="'ingredients[' + index + '][quantity]'"
                      {...quantityModel}
                      placeholder="2"
                    />
                  </>
                )}
                <datalist id="fractions">
                  <option>&#x2154;</option>
                  <option>&frac12;</option>
                  <option>&#8531;</option>
                  <option>&frac14;</option>
                  <option>&#8539;</option>
                </datalist>
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
                <datalist id="units">
                  <option>ml</option>
                  <option>l</option>
                  <option>g</option>
                  <option>kg</option>
                  <option>tsp</option>
                  <option>tsps</option>
                  <option>tbsp</option>
                  <option>tbsps</option>
                  <option>cup</option>
                  <option>cups</option>
                  <option></option>
                </datalist>
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
          No ingredients added yet. Click add button above to get started.
        </em>
      </div>
    </section>
  );
};
