import { Context } from "hono";
import { RecipeService } from "../database/services/recipe-service";
import { Container } from "./container";
import { BaseRoute } from "./base-route";
import { CreateRecipeForm } from "../components/CreateRecipeForm";

export class FormRoute extends BaseRoute {
  private recipeService: RecipeService;

  constructor(container: Container = Container.getInstance()) {
    super({ prefix: "/form" });
    this.recipeService = container.get<RecipeService>("recipeService");
  }

  protected initializeRoutes(): void {
    this.app.get("/create", this.getCreateRecipeForm.bind(this))
  }

  private getCreateRecipeForm(context: Context) {
    return context.html(CreateRecipeForm())
  }
}