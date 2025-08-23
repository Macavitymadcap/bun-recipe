import { Context, HonoRequest } from "hono";
import { RecipeService } from "../database/services/recipe-service";
import { Container } from "./container";
import { BaseRoute } from "./base-route";
import { CreateRecipeForm } from "../components/forms/CreateRecipeForm";
import { AlertProps } from "../components/Alert";
import { GetUpdateRecipeFormResponse } from "../components/responses/GetUpdateRecipeFormResponse";
import { GetDeleteRecipeFormResponse } from "../components/responses/GetDeleteRecipeFormResponse";
import { SearchRecipesForm } from "../components/forms/SearchRecipesForm";

export class FormRoute extends BaseRoute {
  private recipeService: RecipeService;

  constructor(container: Container = Container.getInstance()) {
    super({ prefix: "/form" });
    this.recipeService = container.get<RecipeService>("recipeService");
  }

  protected initializeRoutes(): void {
    this.app.get("/create", this.getCreateRecipeForm.bind(this));
    this.app.get("/search", this.getSearchRecipesForm.bind(this));
    this.app.get("/update/:id", this.getUpdateRecipeForm.bind(this));
    this.app.get("/delete/:id", this.getDeleteRecipeForm.bind(this));
  }

  private getCreateRecipeForm(context: Context) {
    const availableTags = this.recipeService.getAllTags();

    return context.html(CreateRecipeForm({ availableTags }));
  }

  private getSearchRecipesForm(context: Context) {
    const availableTags = this.recipeService.getAllTags();

    return context.html(SearchRecipesForm({ availableTags }));
  }

  private getUpdateRecipeForm(context: Context) {
    const id = this.parseIdFromRequest(context);
    const recipe = this.recipeService.getCompleteRecipe(id);
    const availableTags = this.recipeService.getAllTags();
    const alert = this.getDangerAlertPropsForId(id);

    return context.html(
      GetUpdateRecipeFormResponse({
        alert: recipe ? undefined : alert,
        recipe: recipe ? recipe : undefined,
        availableTags,
      }),
    );
  }

  private getDeleteRecipeForm(context: Context) {
    const id = this.parseIdFromRequest(context);
    const recipe = this.recipeService.getCompleteRecipe(id);
    const alert = this.getDangerAlertPropsForId(id);

    return context.html(
      GetDeleteRecipeFormResponse({
        alert: recipe ? undefined : alert,
        form: recipe ? { recipeId: id, recipeName: recipe.name } : undefined,
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
