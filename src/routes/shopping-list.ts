import { Context } from "hono";
import { BaseRoute } from "./base-route";
import { Container } from "./container";
import { ShoppingListService } from "../database/services/shopping-list-service";
import { ShoppingList } from "../components/ShoppingList";
import { Alert, AlertProps } from "../components/Alert";
import { AlertResponse } from "../components/responses/AlertResponse";
import { ShoppingListResponse } from "../components/responses/ShoppingListResponse";

export class ShoppingListRoute extends BaseRoute {
  private shoppingListService: ShoppingListService;

  constructor(container: Container = Container.getInstance()) {
    super({ prefix: "/shopping-list" });
    this.shoppingListService = container.get<ShoppingListService>("shoppingListService");
  }

  protected initializeRoutes(): void {
    this.app.get("/", this.getShoppingList.bind(this));
    this.app.post("/", this.addItem.bind(this));
    this.app.post("/recipe/:recipeId", this.addRecipeIngredients.bind(this));
    this.app.put("/:id", this.updateItem.bind(this));
    this.app.put("/:id/toggle", this.toggleItem.bind(this));
    this.app.delete("/", this.clearAllItems.bind(this));
    this.app.delete("/checked", this.clearCheckedItems.bind(this));
    this.app.delete("/:id", this.deleteItem.bind(this));
  }

  private async getShoppingList(context: Context): Promise<Response> {
    console.log("Getting shopping list...");
    
    try {
      const items = await this.shoppingListService.getAllItems();
      const stats = await this.shoppingListService.getStats();

      return context.html(
        `<div id="shopping-list-content">${ShoppingList({ items, stats })}</div>`
      );
    } catch (error) {
      console.error("Error getting shopping list:", error);
      const alert: AlertProps = {
        alertType: "danger",
        title: "Error",
        message: "Failed to load shopping list",
      };
      return context.html(Alert(alert));
    }
  }

  private async addItem(context: Context): Promise<Response> {
    console.log("Adding item to shopping list...");
    
    try {
      const formData = await context.req.formData();
      const itemText = formData.get("item") as string;

      if (!itemText?.trim()) {
        return await this.getShoppingListWithAlert(context, {
          alertType: "warning",
          title: "Validation Error",
          message: "Please enter an item to add.",
        });
      }

      const addedItem = await this.shoppingListService.addItem(itemText.trim());

      if (addedItem) {
        return this.getShoppingListWithAlert(context, {
          alertType: "success",
          title: "Item Added",
          message: `"${addedItem.item}" added to your shopping list.`,
        });
      } else {
        return this.getShoppingListWithAlert(context, {
          alertType: "danger",
          title: "Error",
          message: "Failed to add item to shopping list.",
        });
      }
    } catch (error) {
      console.error("Error adding item:", error);
      return this.getShoppingListWithAlert(context, {
        alertType: "danger",
        title: "Error",
        message: `Failed to add item: ${(error as Error).message}`,
      });
    }
  }

  private async addRecipeIngredients(context: Context): Promise<Response> {
    console.log("Adding recipe ingredients to shopping list...");
    let alert: AlertProps;
    
    try {
      const recipeId = parseInt(context.req.param("recipeId"), 10);
      
      if (isNaN(recipeId)) {
        alert = {
          alertType: "danger",
          title: "Error",
          message: "Invalid recipe ID.",
        }
        return context.html(AlertResponse({alert}));
      }

      const addedCount = await this.shoppingListService.addRecipeIngredientsToList(recipeId);

      if (addedCount > 0) {
        alert = {
          alertType: "success",
          title: "Ingredients Added",
          message: `Added ${addedCount} ingredient${addedCount === 1 ? '' : 's'} to your shopping list.`,
        };
        return context.html(AlertResponse({alert}));
      } else {
        alert = {
          alertType: "warning",
          title: "No Items Added",
          message: "No new ingredients were added to your shopping list.",
        }
        return context.html(AlertResponse({alert}));
      }
    } catch (error) {
      console.error("Error adding recipe ingredients:", error);
      alert = {
        alertType: "danger",
        title: "Error",
        message: `Failed to add ingredients: ${(error as Error).message}`,
      }
      return context.html(AlertResponse({alert}));
    }
  }

  private async updateItem(context: Context): Promise<Response> {
    console.log("Updating shopping list item...");
    
    try {
      const id = parseInt(context.req.param("id"), 10);
      console.log("item id: ", id);
      const formData = await context.req.formData();
      console.log("form data: ", formData);
      const itemText = formData.get("itemText") as string;


      if (isNaN(id)) {
        return this.getShoppingListWithAlert(context, {
          alertType: "danger",
          title: "Error",
          message: "Invalid item ID.",
        });
      }

      if (!itemText?.trim()) {
        return this.getShoppingListWithAlert(context, {
          alertType: "warning",
          title: "Validation Error",
          message: "Item text cannot be empty.",
        });
      }

      const updatedItem = await this.shoppingListService.updateItem(id, itemText.trim());

      if (updatedItem) {
        return this.getShoppingListWithAlert(context, {
          alertType: "success",
          title: "Item Updated",
          message: `Item updated to "${updatedItem.item}".`,
        });
      } else {
        return this.getShoppingListWithAlert(context, {
          alertType: "danger",
          title: "Error",
          message: "Failed to update item.",
        });
      }
    } catch (error) {
      console.error("Error updating item:", error);
      return this.getShoppingListWithAlert(context, {
        alertType: "danger",
        title: "Error",
        message: `Failed to update item: ${(error as Error).message}`,
      });
    }
  }

  private async toggleItem(context: Context): Promise<Response> {
    console.log("Toggling shopping list item...");
    
    try {
      const id = parseInt(context.req.param("id"), 10);

      if (isNaN(id)) {
        return this.getShoppingListWithAlert(context, {
          alertType: "danger",
          title: "Error",
          message: "Invalid item ID.",
        });
      }

      const toggledItem = await this.shoppingListService.toggleItem(id);

      if (toggledItem) {
        return this.getShoppingList(context); // Just refresh, no alert needed
      } else {
        return this.getShoppingListWithAlert(context, {
          alertType: "danger",
          title: "Error",
          message: "Failed to update item status.",
        });
      }
    } catch (error) {
      console.error("Error toggling item:", error);
      return this.getShoppingListWithAlert(context, {
        alertType: "danger",
        title: "Error",
        message: `Failed to toggle item: ${(error as Error).message}`,
      });
    }
  }

  private async deleteItem(context: Context): Promise<Response> {
    console.log("Deleting shopping list item...");
    
    try {
      const id = parseInt(context.req.param("id"), 10);

      if (isNaN(id)) {
        return this.getShoppingListWithAlert(context, {
          alertType: "danger",
          title: "Error",
          message: "Invalid item ID.",
        });
      }

      const deleted = await this.shoppingListService.deleteItem(id);

      if (deleted) {
        return this.getShoppingListWithAlert(context, {
          alertType: "success",
          title: "Item Deleted",
          message: "Item removed from shopping list.",
        });
      } else {
        return this.getShoppingListWithAlert(context, {
          alertType: "danger",
          title: "Error",
          message: "Failed to delete item.",
        });
      }
    } catch (error) {
      console.error("Error deleting item:", error);
      return this.getShoppingListWithAlert(context, {
        alertType: "danger",
        title: "Error",
        message: `Failed to delete item: ${(error as Error).message}`,
      });
    }
  }

  private async clearCheckedItems(context: Context): Promise<Response> {
    console.log("Clearing checked items...");
    
    try {
      const success = await this.shoppingListService.clearCheckedItems();

      if (success) {
        return this.getShoppingListWithAlert(context, {
          alertType: "success",
          title: "Items Cleared",
          message: "All checked items have been removed.",
        });
      } else {
        return this.getShoppingListWithAlert(context, {
          alertType: "danger",
          title: "Error",
          message: "Failed to clear checked items.",
        });
      }
    } catch (error) {
      console.error("Error clearing checked items:", error);
      return this.getShoppingListWithAlert(context, {
        alertType: "danger",
        title: "Error",
        message: `Failed to clear items: ${(error as Error).message}`,
      });
    }
  }

  private async clearAllItems(context: Context): Promise<Response> {
    console.log("Clearing all items...");
    
    try {
      const success = await this.shoppingListService.clearAllItems();

      if (success) {
        return this.getShoppingListWithAlert(context, {
          alertType: "success",
          title: "List Cleared",
          message: "Shopping list has been cleared.",
        });
      } else {
        return this.getShoppingListWithAlert(context, {
          alertType: "danger",
          title: "Error",
          message: "Failed to clear shopping list.",
        });
      }
    } catch (error) {
      console.error("Error clearing all items:", error);
      return this.getShoppingListWithAlert(context, {
        alertType: "danger",
        title: "Error",
        message: `Failed to clear list: ${(error as Error).message}`,
      });
    }
  }

  private async getShoppingListWithAlert(context: Context, alert: AlertProps): Promise<Response> {
    const items = await this.shoppingListService.getAllItems();
    const stats = await this.shoppingListService.getStats();

    return context.html(ShoppingListResponse({alert, items, stats}));
  }
}