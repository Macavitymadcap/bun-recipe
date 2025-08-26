import { Context } from "hono";
import { BaseRoute } from "./base-route";
import { Container } from "./container";
import { DefaultContent } from "../components/DefaultContent";
import { RecipeService } from "../database/services/recipe-service";

export class InfoRoute extends BaseRoute {
  private recipeService: RecipeService;

  constructor(container: Container = Container.getInstance()) {
    super({ prefix: "/info" });
    this.recipeService = container.get<RecipeService>("recipeService");
  }

  protected initializeRoutes() {
    this.app.get("/", this.getAllRecipesAsJson.bind(this));
    this.app.get("/default", this.getDeafultContent.bind(this));
  }
  private getAllRecipesAsJson(context: Context) {
    const recipes = this.recipeService.getAllCompleteRecipes();

    return context.json(recipes);
  }

  private async getDeafultContent(context: Context) {
    return context.html(DefaultContent());
  }
}
