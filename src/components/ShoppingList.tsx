import { ShoppingListItemEntity } from "../database/repositories/shopping-list-repository";
import { ShoppingListStats } from "../database/services/shopping-list-service";
import { AddIcon } from "./icons/AddIcon";
import { DeleteIcon } from "./icons/DeleteIcon";
import { UpdateIcon } from "./icons/UpdateIcon";

export interface ShoppingListProps {
  items: ShoppingListItemEntity[];
  stats: ShoppingListStats;
}

export const ShoppingList = ({ items, stats }: ShoppingListProps) => {
  const showConfirmDilaog = {
    "hx-on:htmx:after-request": "if (event.detail.successful) { htmx.addClass('dialog', 'card-outline-danger'); htmx.find('dialog').showModal(); }"

  }
  const uncheckedItems = items.filter(item => !item.is_checked);
  const checkedItems = items.filter(item => item.is_checked);
  const onKeyDownEnter = { 
    "x-on:keydown.enter": "$refs.saveBtn.click()"
  }
  const onKeyDownEscape = { 
    "x-on:keydown.escape": `editing = false; setNewText(newText);`
  }

  const hxOnAfterRequest = {
    "hx-on:htmx:after-request": "editing = false; setNewText(newText);"
  }

  return (
    <section>
      <header>
        <h2>Shopping List</h2>
        <div className="grid mt-2">
          <div className="col-4 text-center">
            <strong>Total: {stats.totalItems}</strong>
          </div>
          <div className="col-4 text-center">
            <strong>Remaining: {stats.uncheckedItems}</strong>
          </div>
          <div className="col-4 text-center">
            <strong>Collected: {stats.checkedItems}</strong>
          </div>
        </div>
      </header>

      <div className="card-body">
        {/* Add new item form */}
        <form 
          className="grid mb-3"
          hx-post="/shopping-list"
          hx-target="#shopping-list-content"
          hx-swap="outerHTML"
          hx-indicator="#working"
        >
          <input
            className="col-11"
            type="text"
            name="item"
            placeholder="Add new item..."
            required
          />
          <button 
            type="submit" 
            className="btn btn-icon btn-outline-success col-1" 
            title="Add Item"
          >
            <AddIcon />
          </button>
        </form>

        {/* Action buttons */}
        {items.length > 0 && (
          <div className="wrapped-row mb-3">
            {checkedItems.length > 0 && (
              <button
                className="btn btn-outline-warning"
                hx-get="/form/clear-checked"
                hx-target="dialog"
                hx-indicator="#working"
                {...showConfirmDilaog}
              >
                Clear Checked ({checkedItems.length})
              </button>
            )}
            
            <button
              className="btn btn-outline-danger"
              hx-get="/form/clear-all"
              hx-target="dialog" 
              hx-indicator="#working"
              {...showConfirmDilaog}
            >
              Clear All
            </button>
          </div>
        )}

        {items.length === 0 ? (
          <div className="text-center text-surface-low">
            <p><em>Your shopping list is empty</em></p>
            <p>Add items manually or add ingredients from a recipe</p>
          </div>
        ) : (
          <div>
            {/* Unchecked items */}
            {uncheckedItems.length > 0 && (
              <div className="mb-4">
                <h4 className="mb-2">To Buy ({uncheckedItems.length})</h4>
                <ul className="unstyled">
                  {uncheckedItems.map((item) => (
                    <li key={item.id} className="mb-2">
                      <div className="grid" x-data={`{
                        editing: false, 
                        newText: '${item.item.replace(/\'/g, "\\'")}',
                        
                        setNewText() {
                          this.newText = this.newText.replace(/'/g, "'");
                        },
                      }`}>
                        <div className="col-1">
                          <input
                            type="checkbox"
                            hx-put={`/shopping-list/${item.id}/toggle`}
                            hx-target="#shopping-list-content"
                            hx-swap="outerHTML"
                            hx-indicator="#working"
                          />
                        </div>
                        <div className="col-9">
                          <span x-show="!editing" className="text-lg">{item.item}</span>
                          <input
                            x-show="editing"
                            x-model="newText"
                            type="text"
                            className="w-100"
                            {...onKeyDownEnter}
                            {...onKeyDownEscape}
                          />
                        </div>
                        <input type="hidden" name="itemText" x-bind:value="newText"></input>
                        <div className="col-2">
                          <button
                            x-show="!editing"
                            type="button"
                            className="btn btn-icon btn-outline-secondary mr-1"
                            title="Edit item"
                            x-on:click="editing = true"
                          >
                            <UpdateIcon />
                          </button>

                          <button
                            x-show="editing"
                            x-ref="saveBtn"
                            type="button"
                            className="btn btn-icon btn-outline-success mr-1"
                            title="Save changes"
                            hx-put={`/shopping-list/${item.id}`}
                            hx-target="#shopping-list-content"
                            hx-swap="outerHTML"
                            hx-indicator="#working"
                            hx-include="[name='itemText']"
                            {...hxOnAfterRequest}
                          >
                            <AddIcon />
                          </button>

                          <button
                            type="button"
                            className="btn btn-icon btn-outline-danger"
                            title="Delete item"
                            hx-get={`/form/delete-item/${item.id}`}
                            hx-target="dialog"
                            hx-indicator="#working"
                          >
                            <DeleteIcon />
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Checked items */}
            {checkedItems.length > 0 && (
              <div>
                <h4 className="mb-2">Collected ({checkedItems.length})</h4>
                <ul className="unstyled">
                  {checkedItems.map((item) => (
                    <li key={item.id} className="mb-2">
                      <div className="grid">
                        <div className="col-1">
                          <input
                            type="checkbox"
                            checked
                            hx-put={`/shopping-list/${item.id}/toggle`}
                            hx-target="#shopping-list-content"
                            hx-swap="outerHTML"
                            hx-indicator="#working"
                          />
                        </div>
                        <div className="col-9">
                          <span className="text-surface-low" style="text-decoration: line-through;">
                            {item.item}
                          </span>
                        </div>
                        <div className="col-2">
                          <button
                            type="button"
                            className="btn btn-icon btn-outline-danger"
                            title="Delete item"
                            hx-get={`/form/delete-item/${item.id}`}
                            hx-target="dialog"
                            hx-indicator="#working"
                          >
                            <DeleteIcon />
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
};