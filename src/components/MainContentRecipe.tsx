// Create src/components/FullPageRecipe.tsx
import { CompleteRecipe } from "../database/services/recipe-service";

interface MainContentRecipeProps extends CompleteRecipe {}

export const MainContentRecipe = ({
  id,
  name,
  servings,
  calories_per_serving,
  preparation_time,
  cooking_time,
  ingredients,
  directions,
  cooksNotes,
  tags,
}: MainContentRecipeProps) => {
  return (
    <article>
      <h2 className="text-center">{name}</h2>
      <div class="card-body">
        <div class="grid">
          <div class="col-6">
            <strong>Servings:</strong> {servings}
          </div>
          {calories_per_serving ? (
            <div class="col-6">
              <strong>Calories per Serving:</strong> {calories_per_serving}
            </div>
          ) : (
            ""
          )}
          {preparation_time ? (
            <div class="col-6">
              <strong>Prep time:</strong> {preparation_time}
            </div>
          ) : (
            ""
          )}
          {cooking_time ? (
            <div class="col-6">
              <strong>Cook time:</strong> {cooking_time}
            </div>
          ) : (
            ""
          )}
        </div>
        {tags.length > 0 ? (
          <div class="mt-3">
            {tags.map((tag) => (
              <span class="badge badge-high ml-1">{tag}</span>
            ))}
          </div>
        ) : (
          ""
        )}
      </div>
      <details class="mt-3" open>
        <summary>
          <strong>Ingredients ({ingredients.length})</strong>
        </summary>
        <div class="content">
          <ul>
            {ingredients
              .sort((a, b) => a.order_index - b.order_index)
              .map((ingredient) => (
                <li>
                  {ingredient.quantity}
                  {ingredient.unit ? ` ${ingredient.unit}` : ""}
                  {ingredient.name}
                </li>
              ))}
          </ul>
        </div>
      </details>
      <details class="mt-3" open>
        <summary>
          <strong>Method ({directions.length} steps)</strong>
        </summary>
        <div class="content">
          <ol>
            {directions
              .sort((a, b) => a.order_index - b.order_index)
              .map((step) => (
                <li class="mb-2">{step.instruction}</li>
              ))}
          </ol>
        </div>
      </details>
      {cooksNotes.length > 0 ? (
        <details class="mt-3" open>
          <summary>
            <strong>Cook's Notes ({cooksNotes.length})</strong>
          </summary>
          <div class="content">
            <ul>
              {cooksNotes.map((note) => (
                <li class="mb-1">{note}</li>
              ))}
            </ul>
          </div>
        </details>
      ) : (
        ""
      )}
    </article>
  );
};
