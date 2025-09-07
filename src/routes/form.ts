import { Context } from "hono";
import { RecipeService } from "../database/services/recipe-service";
import { Container } from "./container";
import { BaseRoute } from "./base-route";
import { CreateRecipeForm } from "../components/forms/CreateRecipeForm";
import { AlertProps } from "../components/Alert";
import { GetUpdateRecipeFormResponse } from "../components/responses/GetUpdateRecipeFormResponse";
import { GetDeleteRecipeFormResponse } from "../components/responses/GetDeleteRecipeFormResponse";
import { SearchRecipesForm } from "../components/forms/SearchRecipesForm";
import { ClearShoppingListItemsForm } from "../components/forms/ClearShoppingListItemsForm";
import { ShoppingListService } from "../database/services/shopping-list-service";
import { DeleteShoppingListItemForm } from "../components/forms/DeleteShoppingListItemForm";
import { GetDeleteShoppingListItemFormResponse } from "../components/responses/GetDeleteShoppingListItemFormResponse";

export class FormRoute extends BaseRoute {
  private recipeService: RecipeService;
  private shoppingListService: ShoppingListService;

  constructor(container: Container = Container.getInstance()) {
    super({ prefix: "/form" });
    this.recipeService = container.get<RecipeService>("recipeService");
    this.shoppingListService = container.get<ShoppingListService>(
      "shoppingListService",
    );
  }

  protected initializeRoutes(): void {
    this.app.get("/search", this.getSearchRecipesForm.bind(this));
    this.app.get("/create", this.getCreateRecipeForm.bind(this));
    this.app.get("/update/:id", this.getUpdateRecipeForm.bind(this));
    this.app.get("/delete/:id", this.getDeleteRecipeForm.bind(this));
    this.app.get(
      "/clear-all",
      this.getClearAllShoppingListItemsForm.bind(this),
    );
    this.app.get(
      "/clear-checked",
      this.getClearCheckedShoppingListItemsForm.bind(this),
    );
    this.app.get(
      "/delete-item/:id",
      this.getDeleteShoppingListItemForm.bind(this),
    );
  }

  private async getSearchRecipesForm(context: Context) {
    const availableTags = await this.recipeService.getAllTags();

    return context.html(SearchRecipesForm({ availableTags }));
  }
  private async getCreateRecipeForm(context: Context) {
    const availableTags = await this.recipeService.getAllTags();

    return context.html(CreateRecipeForm({ availableTags }));
  }

  private async getUpdateRecipeForm(context: Context) {
    const id = this.parseIdFromRequest(context);
    const recipe = await this.recipeService.getCompleteRecipe(id);
    const alert = this.getDangerAlertPropsForId(id);
    const availableTags = await this.recipeService.getAllTags();

    return context.html(
      GetUpdateRecipeFormResponse({
        alert: recipe ? undefined : alert,
        recipe: recipe ? recipe : undefined,
        availableTags,
      }),
    );
  }

  private async getDeleteRecipeForm(context: Context) {
    const id = this.parseIdFromRequest(context);
    const recipe = await this.recipeService.getCompleteRecipe(id);
    const alert = this.getDangerAlertPropsForId(id);

    return context.html(
      GetDeleteRecipeFormResponse({
        alert: recipe ? undefined : alert,
        form: recipe ? { recipeId: id, recipeName: recipe.name } : undefined,
      }),
    );
  }

  private async getClearAllShoppingListItemsForm(context: Context) {
    return context.html(ClearShoppingListItemsForm({ action: "all" }));
  }

  private async getClearCheckedShoppingListItemsForm(context: Context) {
    return context.html(ClearShoppingListItemsForm({ action: "checked" }));
  }

  private async getDeleteShoppingListItemForm(context: Context) {
    const id = this.parseIdFromRequest(context);
    const item = await this.shoppingListService.read(id);
    const alert: AlertProps = {
      alertType: "danger",
      title: "Error",
      message: `Failed to retireve item with ID ${id}`,
    };

    return context.html(
      GetDeleteShoppingListItemFormResponse({
        alert: item ? undefined : alert,
        form: item ? { id: item.id, item: item.item } : undefined,
      }),
    );
  }

  private parseIdFromRequest(context: Context) {
    return parseInt(context.req.param("id"), 10);
  }

  private getDangerAlertPropsForId(id: number): AlertProps {
    return {
      alertType: "danger",
      title: "Error",
      message: `Failed to retrieve recipe with ID ${id}`,
    };
  }
}
