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
    this.app.get("/", this.getAllRecipesAsJson.bind(this));
    this.app.get("/default", this.getDeafultContent.bind(this));
    this.app.post("/upload", this.uploadRecipes.bind(this));
  }
  private getAllRecipesAsJson(context: Context) {
    const recipes = this.recipeService.getAllCompleteRecipes();

    return context.json(recipes);
  }

  private async getDeafultContent(context: Context) {
    const statistics = this.recipeService.getRecipeStatistics();
    return context.html(DefaultContent({ statistics }));
  }

  private async uploadRecipes(context: Context): Promise<Response> {
    console.log("Uploading recipes from JSON...");
    let alert: AlertProps;
    let details: UploadResult | undefined;

    try {
      const formData = await context.req.formData();
      const jsonFile = formData.get("jsonFile") as File;
      const overwriteExisting = formData.get("overwriteExisting") === "true";

      if (!jsonFile || jsonFile.size === 0) {
        alert = {
          alertType: "danger",
          title: "Validation Error",
          message: "Please select a JSON file to upload.",
        };
        return context.html(UploadRecipesResponse({ alert }));
      }

      // Validate file type
      if (!jsonFile.type.includes('json') && !jsonFile.name.endsWith('.json')) {
        alert = {
          alertType: "danger",
          title: "Invalid File Type",
          message: "Please upload a valid JSON file.",
        };
        return context.html(UploadRecipesResponse({ alert }));
      }

      // Read and parse JSON
      const jsonText = await jsonFile.text();
      let recipesData: any;

      try {
        recipesData = JSON.parse(jsonText);
      } catch (parseError) {
        alert = {
          alertType: "danger",
          title: "Invalid JSON",
          message: "The uploaded file contains invalid JSON format.",
        };
        return context.html(UploadRecipesResponse({ alert }));
      }

      // Validate data structure
      const validation = this.recipeService.validateRecipeData(recipesData);
      if (!validation.valid) {
        alert = {
          alertType: "danger",
          title: "Invalid Recipe Data",
          message: `Data validation failed: ${validation.errors.slice(0, 3).join(', ')}${validation.errors.length > 3 ? '...' : ''}`,
        };
        return context.html(UploadRecipesResponse({ alert }));
      }

      // Import recipes
      const result = this.recipeService.importRecipesFromJson(recipesData, overwriteExisting);

      if (result.success) {
        if (result.imported > 0) {
          alert = {
            alertType: "success",
            title: "Upload Successful",
            message: `Successfully imported ${result.imported} recipe${result.imported === 1 ? '' : 's'}${result.skipped > 0 ? ` (${result.skipped} skipped)` : ''}.`,
          };
        } else if (result.skipped > 0) {
          alert = {
            alertType: "warning",
            title: "All Recipes Skipped",
            message: `All ${result.skipped} recipes were skipped (already exist). Enable "overwrite existing" to replace them.`,
          };
        } else {
          alert = {
            alertType: "warning",
            title: "No Recipes Imported",
            message: "No recipes were imported.",
          };
        }
      } else {
        alert = {
          alertType: result.imported > 0 ? "warning" : "danger",
          title: "Upload Completed with Errors",
          message: `Imported ${result.imported} recipes, but ${result.errors} failed. Check details below.`,
        };
      }

      details = result;

      return context.html(UploadRecipesResponse({ alert, details }), {
        headers: result.imported > 0 ? { "HX-Trigger": "recipes-uploaded" } : {},
      });

    } catch (error) {
      console.error("Error uploading recipes:", error);
      alert = {
        alertType: "danger",
        title: "Upload Error",
        message: `Failed to upload recipes: ${(error as Error).message}`,
      };

      return context.html(UploadRecipesResponse({ alert }));
    }
  }
}
