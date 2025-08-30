import { CloseIcon } from "../icons/CloseIcon";

interface DeleteRecipeFormProps {
  recipeId: number;
  recipeName: string;
}

const DeleteRecipeForm = ({ recipeId, recipeName }: DeleteRecipeFormProps) => {
  const hxOnDeleteRecipe = {
    "hx-on:htmx:after-request":
      'if(event.detail.successful) { this.reset(); htmx.find("dialog").close(); htmx.removeClass("dialog", "card-outline-danger"); }',
  };
  return (
    <form
      id="delete-task-form"
      method="dialog"
      hx-delete={`/recipe/${recipeId}`}
      hx-target="#main-content"
      hx-swap="innerHTML"
      hx-indicator="#deleting"
      {...hxOnDeleteRecipe}
    >
      <section class="card-header grid">
        <span class="col-1"></span>
        <h2 class="text-center col-10">Delete recipe</h2>

        <span class="col-1">
          <button
            class="btn btn-icon btn-outline-danger col-1 col-push-right"
            type="button"
            title="Cancel Recipe Deletion"
            x-on:click="htmx.removeClass('dialog', 'card-outline-danger'); htmx.find('dialog').close();"
          >
            <CloseIcon />
          </button>
        </span>
      </section>

      <section class="card-body">
        <p class="text-center">
          Are you sure you want to delete <strong>{recipeName}</strong>?
        </p>
      </section>

      <section class="card-footer wrapped-row">
        <button
          type="submit"
          title="Delete Recipe"
          class="btn btn-outline-danger"
        >
          Delete
        </button>
      </section>
    </form>
  );
};

export { DeleteRecipeForm, type DeleteRecipeFormProps };
