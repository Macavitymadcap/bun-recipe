interface ReadRecipeProps {
  id: number;
  name: string;
  servings: string;
  calories_per_portion?: number;
  preparation_time?: string;
  cooking_time?: string;
  ingredients: Array<{
    id: number;
    quantity: number;
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
  created_at: string;
  updated_at: string;
}

const hxOnAfterRequestSuccessful = (requestType: 'update' | 'delete') => {
  const actions = [
    `htmx.removeClass('card-outline-success')`,
    `htmx.removeClass('dialog', 'card-outline-primary')`,
    `htmx.removeClass('dialog', 'card-outline-secondary')`,
    `htmx.removeClass('dialog', 'card-outline-danger')`,
    `htmx.removeClass('dialog', 'card-outline-success')`,
    `htmx.addClass('dialog', '${requestType === 'update' ? 'card-outline-secondary' : 'card-outline-danger'}')`,
    `htmx.find('dialog').showModal()`
  ];

  return {
    "hx-on:htmx:after-request":
      `if(event.detail.successful) { ${actions.join('; ')} }`,
  };
};

const ReadRecipe = ({
  id,
  name,
  servings,
  calories_per_portion,
  preparation_time,
  cooking_time,
  ingredients,
  methodSteps,
  cooksNotes,
  tags,
  created_at,
  updated_at,
}: ReadRecipeProps) => {
  const props: { [key: string]: string } = {
    id: `recipe-${id}`,
    class: "card",
  };

  return (
    <div {...props}>
      {/* Recipe Header with Actions */}
      <div className="content grid">
        <span className="col-10">
          <span className="badge">{id}</span>
        </span>

        <button
          title="Update Recipe"
          className="btn btn-icon btn-outline-secondary"
          hx-get={`/recipe/form/update/${id}`}
          hx-target="dialog"
          {...hxOnAfterRequestSuccessful('update')}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            fill="currentColor"
            viewBox="0 0 20 20"
            aria-hidden="true"
          >
            <path d="M2 14.5V18h3.5l10.06-10.06-3.5-3.5L2 14.5zm14.85-7.35a1.003 1.003 0 0 0 0-1.42l-2.58-2.58a1.003 1.003 0 0 0-1.42 0l-1.34 1.34 3.5 3.5 1.34-1.34z" />
          </svg>
        </button>

        <button
          title="Delete Recipe"
          className="btn btn-icon btn-outline-danger"
          hx-get={`/recipe/form/delete/${id}`}
          hx-target="dialog"
          {...hxOnAfterRequestSuccessful('delete')}
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
      </div>

      {/* Recipe Title */}
      <h2 className="card-header text-center">{name}</h2>

      {/* Recipe Basic Info */}
      <div className="card-body">
        <div className="grid">
          <div className="col-6">
            <strong>Servings:</strong> {servings}
          </div>
          {calories_per_portion && (
            <div className="col-6">
              <strong>Calories per portion:</strong> {calories_per_portion}
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
            <strong>Tags:</strong>{" "}
            {tags.map((tag, index) => (
              <span key={index} className="badge badge-primary ml-1">
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

      {/* Recipe Footer with Metadata */}
      <section className="card-footer grid">
        <div className="col-12 mb-1">
          <strong>Created:</strong>{" "}
          {new Date(created_at).toLocaleDateString()} at{" "}
          {new Date(created_at).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </div>
        {updated_at !== created_at && (
          <div className="col-12">
            <strong>Last updated:</strong>{" "}
            {new Date(updated_at).toLocaleDateString()} at{" "}
            {new Date(updated_at).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
        )}
      </section>
    </div>
  );
};

export { ReadRecipe, type ReadRecipeProps };