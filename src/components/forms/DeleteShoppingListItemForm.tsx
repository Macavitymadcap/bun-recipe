import { CloseIcon } from "../icons/CloseIcon";

export interface DeleteShoppingListItemFormProps {
  id: number;
  item: string;
}

export const DeleteShoppingListItemForm = ({ id, item }: DeleteShoppingListItemFormProps) => {
  const hxOnDeleteRecipe = {
    "hx-on:htmx:after-request":
      'if(event.detail.successful) { this.reset(); htmx.find("dialog").close(); htmx.removeClass("dialog", "card-outline-danger"); }',
  };
  return (
    <form
      id="delete-task-form"
      method="dialog"
      hx-delete={`/shopping-list/${id}`}
      hx-target="#main-content"
      hx-swap="innerHTML"
      hx-indicator="#delete-item-indicator"
      {...hxOnDeleteRecipe}
    >
      <section class="card-header grid">
        <span class="col-1"></span>
        <h2 class="text-center col-10">Delete item</h2>

        <span class="col-1">
          <button
            class="btn btn-icon btn-outline-danger col-1 col-push-right"
            type="button"
            title="Cancel Item Deletion"
            x-on:click="htmx.removeClass('dialog', 'card-outline-danger'); htmx.find('dialog').close();"
          >
            <CloseIcon />
          </button>
        </span>
      </section>

      <section class="card-body">
        <p class="text-center">
          Are you sure you want to delete <strong>{item}</strong>?
        </p>
      </section>

      <section class="card-footer grid">
        <button
          type="submit"
          title="Delete item"
          class="btn btn-outline-danger col-12"
        >
          Delete
        </button>
        <progress id="delete-item-indicator" class="htmx-indicator col-12"></progress>
      </section>
    </form>
  );
};
