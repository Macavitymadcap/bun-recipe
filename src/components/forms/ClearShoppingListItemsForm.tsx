import { CloseIcon } from "../icons/CloseIcon";

export interface ClearShoppingListItemsFormProps {
  action: "all" | "checked";
}

export const ClearShoppingListItemsForm = ({
  action,
}: ClearShoppingListItemsFormProps) => {
  const hxOnClearItems = {
    "hx-on:htmx:after-request":
      'if(event.detail.successful) { this.reset(); htmx.find("dialog").close(); htmx.removeClass("dialog", "card-outline-danger"); }',
  };
  return (
    <form
      id="delete-task-form"
      method="dialog"
      hx-delete={`${action === "checked" ? "/shopping-list/checked" : "/shopping-list"}`}
      hx-target="#shopping-list-content"
      hx-swap="outerHTML"
      hx-indicator="#clear-items-indicator"
      {...hxOnClearItems}
    >
      <section class="card-header grid">
        <span class="col-1"></span>
        <h2 class="text-center col-10">Clear {action} items</h2>

        <span class="col-1">
          <button
            class="btn btn-icon btn-outline-danger col-1 col-push-right"
            type="button"
            title="Cancel Items Clearance"
            x-on:click="htmx.removeClass('dialog', 'card-outline-danger'); htmx.find('dialog').close();"
          >
            <CloseIcon />
          </button>
        </span>
      </section>

      <section class="card-body">
        <p class="text-center">
          Are you sure you want to clear {action} items?
        </p>
      </section>

      <section class="card-footer grid">
        <button
          type="submit"
          title={`Clear ${action} items`}
          class="btn btn-outline-danger col-12"
          hx-indicator="#clear-items-indicator"
        >
          Clear Items
        </button>
        <progress
          id="clear-items-indicator"
          class="htmx-indicator col-12"
        ></progress>
      </section>
    </form>
  );
};
