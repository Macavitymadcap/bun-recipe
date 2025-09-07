import { Context } from "hono";
import { BaseRoute } from "./base-route";
import { Container } from "./container";
import { DefaultContent } from "../components/DefaultContent";
import { RecipeService, UploadResult } from "../database/services/recipe-service";
import { AlertProps } from "../components/Alert";
import { UploadRecipesResponse } from "../components/responses/UploadRecipesResponse";

export class DataRoute extends BaseRoute {
  private recipeService: RecipeService;

  constructor(container: Container = Container.getInstance()) {
    super({ prefix: "/data" });
    this.recipeService = container.get<RecipeService>("recipeService");
  }

  protected initializeRoutes() {
    this.app.get("/default", this.getDeafultContent.bind(this));
  }


  private async getDeafultContent(context: Context) {
    const statistics = await this.recipeService.getRecipeStatistics();
    return context.html(DefaultContent({ statistics }));
  }
}
