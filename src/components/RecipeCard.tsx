import { DeleteIcon } from "./icons/DeleteIcon";
import { MaximiseIcon } from "./icons/MaximiseIcon";
import { UpdateIcon } from "./icons/UpdateIcon";

interface RecipeCardProps {
  id: number;
  name: string;
  servings: string;
  calories_per_serving?: number;
  preparation_time?: string;
  cooking_time?: string;
  ingredients: Array<{
    id: number;
    quantity?: string;
    unit?: string;
    name: string;
    order_index: number;
  }>;
  methodSteps: Array<{
    id: number;
    order_index: number;
    instruction: string;
  }>;
  cooksNotes: string[];
  tags: string[];
}

const hxOnAfterRequestSuccessful = {
  "hx-on:htmx:after-request":
    "if(event.detail.successful) { htmx.addClass('dialog', 'card-outline-danger'); htmx.find('dialog').showModal(); }",
};

const RecipeCard = ({
  id,
  name,
  servings,
  calories_per_serving,
  preparation_time,
  cooking_time,
  ingredients,
  methodSteps,
  cooksNotes,
  tags,
}: RecipeCardProps) => {
  const props: { [key: string]: string } = {
    id: `recipe-${id}`,
    class: "card",
  };

  return (
    <article {...props}>
      {/* Recipe Header with Actions */}
      <div className="content grid">
        <h2 className="card-header col-9 push-left">{name}</h2>

        <button
          title="Full content view"
          hx-get={`/recipe/${id}`}
          className="btn btn-icon btn-outline-primary col-1 col-push-right"
          hx-target="#main-content"
        >
          <MaximiseIcon />
        </button>

        <button
          title="Update Recipe"
          className="btn btn-icon btn-outline-secondary col-1 col-push-right"
          hx-get={`/form/update/${id}`}
          hx-target="#main-content"
        >
          <UpdateIcon />
        </button>

        <button
          title="Delete Recipe"
          className="btn btn-icon btn-outline-danger col-1 col-push-right"
          hx-get={`/form/delete/${id}`}
          hx-target="dialog"
          {...hxOnAfterRequestSuccessful}
        >
          <DeleteIcon />
        </button>
      </div>

      {/* Recipe Basic Info */}
      <div className="card-body">
        <div className="grid">
          <div className="col-6">
            <strong>Servings:</strong> {servings}
          </div>
          {calories_per_serving && (
            <div className="col-6">
              <strong>Calories per portion:</strong> {calories_per_serving}
            </div>
          )}
          {preparation_time && (
            <div className="col-6">
              <strong>Prep time:</strong> {preparation_time}
            </div>
          )}
          {cooking_time && (
            <div className="col-6">
              <strong>Cook time:</strong> {cooking_time}
            </div>
          )}
        </div>

        {/* Tags */}
        {tags.length > 0 && (
          <div className="mt-3">
            {tags.map((tag, index) => (
              <span key={index} className="badge badge-high ml-1">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Ingredients Section */}
      <details className="mt-3">
        <summary>
          <strong>Ingredients ({ingredients.length})</strong>
        </summary>
        <div className="content">
          <ul>
            {ingredients
              .sort((a, b) => a.order_index - b.order_index)
              .map((ingredient) => (
                <li key={ingredient.id}>
                  {ingredient.quantity}
                  {ingredient.unit && ` ${ingredient.unit}`} {ingredient.name}
                </li>
              ))}
          </ul>
        </div>
      </details>

      {/* Method Section */}
      <details className="mt-3">
        <summary>
          <strong>Method ({methodSteps.length} steps)</strong>
        </summary>
        <div className="content">
          <ol>
            {methodSteps
              .sort((a, b) => a.order_index - b.order_index)
              .map((step) => (
                <li key={step.id} className="mb-2">
                  {step.instruction}
                </li>
              ))}
          </ol>
        </div>
      </details>

      {/* Cook's Notes Section */}
      {cooksNotes.length > 0 && (
        <details className="mt-3">
          <summary>
            <strong>Cook's Notes ({cooksNotes.length})</strong>
          </summary>
          <div className="content">
            <ul>
              {cooksNotes.map((note, index) => (
                <li key={index} className="mb-1">
                  {note}
                </li>
              ))}
            </ul>
          </div>
        </details>
      )}
    </article>
  );
};

export { RecipeCard as ReadRecipe, type RecipeCardProps as ReadRecipeProps };
