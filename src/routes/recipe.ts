import { Context } from "hono";
import { RecipeService } from "../database/services/recipe-service";
import { RecipeFormService } from "../forms/recipe-form-service";
import { SearchFormService } from "../forms/search-form-service";
import { Container } from "./container";
import { BaseRoute } from "./base-route";
import { Alert, type AlertProps } from "../components/Alert";
import { GetRecipeByIDResponse } from "../components/responses/GetRecipeByIdResponse";
import { ReadRecipe, ReadRecipeProps } from "../components/RecipeCard";
import { StandardResponse } from "../components/responses/StandardResponse";
import { SearchRecipesResponse } from "../components/responses/SearchRecipesResponse";
import { UpdateRecipeResponse } from "../components/responses/UpdateRecipeResponse";
import { ShoppingListService } from "../database/services/shopping-list-service";
import { ShoppingListProps } from "../components/ShoppingList";

export class RecipeRoute extends BaseRoute {
  private recipeService: RecipeService;
  private shoppingListService: ShoppingListService;

  constructor(container: Container = Container.getInstance()) {
    super({ prefix: "/recipe" });
    this.recipeService = container.get<RecipeService>("recipeService");
    this.shoppingListService = container.get<ShoppingListService>(
      "shoppingListService",
    );
  }

  protected initializeRoutes(): void {
    this.app.post("/", this.createRecipe.bind(this));
    this.app.get("/", this.getAllRecipes.bind(this));
    this.app.post("/search", this.searchRecipes.bind(this));
    this.app.get("/:id", this.getRecipeById.bind(this));
    this.app.put("/:id", this.updateRecipe.bind(this));
    this.app.delete("/:id", this.deleteRecipe.bind(this));
  }

  private async createRecipe(context: Context): Promise<Response> {
    console.log("Creating recipe...");
    const shoppingList = await this.getShoppingList();
    let alert: AlertProps;

    try {
      const formData = await context.req.formData();
      const recipeFormService = new RecipeFormService(formData)

      if (!recipeFormService.isValid) {
        return this.invalidFormResponse(context, shoppingList)
      }

      const recipe = await this.recipeService.createCompleteRecipe(recipeFormService.recipeData);

      if (recipe) {
        alert = {
          alertType: "success",
          title: "Recipe Created",
          message: `Recipe "${recipe.name}" created successfully!`,
        };
      } else {
        alert = {
          alertType: "danger",
          title: "Error",
          message: "Failed to create recipe",
        };
      }

      return context.html(StandardResponse({ alert, shoppingList }));
    } catch (error) {
      console.error("Error creating recipe:", error);
      alert = {
        alertType: "danger",
        title: "Error",
        message: `Failed to create recipe: ${(error as Error).message}`,
      };

      return context.html(StandardResponse({ alert, shoppingList }));
    }
  }

  private async getRecipeById(context: Context): Promise<Response> {
    console.log("Fetching recipe by ID...");
    const id = this.parseRecipeIdFromContext(context);

    try {
      const recipe = await this.recipeService.getCompleteRecipe(id);

      if (!recipe) {
        const alert: AlertProps = {
          alertType: "danger",
          title: "Error",
          message: `No recipe found with ID ${id}`,
        };
        return context.html(
          GetRecipeByIDResponse({ alert, recipe: undefined }),
        );
      }

      return context.html(GetRecipeByIDResponse({ alert: undefined, recipe }));
    } catch (error) {
      const alert: AlertProps = {
        alertType: "danger",
        title: "Error",
        message: `Error fetching recipe: ${(error as Error).message}`,
      };
      return context.html(GetRecipeByIDResponse({ alert, recipe: undefined }));
    }
  }

  private async getAllRecipes(context: Context): Promise<Response> {
    console.log("Fetching all recipes...");

    try {
      const recipes = await this.recipeService.getAllCompleteRecipes();

      return context.html(
        `${recipes.map((recipe: ReadRecipeProps) => ReadRecipe(recipe)).join("")}`,
      );
    } catch (error) {
      console.error("Error fetching recipes:", error);
      const alert: AlertProps = {
        alertType: "danger",
        title: "Error",
        message: "Failed to load recipes",
      };
      return context.html(Alert(alert));
    }
  }

  private async searchRecipes(context: Context): Promise<Response> {
    console.log("Searching recipes...");
    const shoppingList = await this.getShoppingList();
    let alert: AlertProps | undefined;

    try {
      const formData = await context.req.formData();
      const searchFormService = new SearchFormService(formData);

      if (searchFormService.isNameSearch) {
        return this.searchByName(context, searchFormService.recipeName, shoppingList);
      } else if (searchFormService.isTagSearch) {
        return this.searchByTag(context, searchFormService.recipeTag, shoppingList);
      } else if (searchFormService.isIngredientSearch) {
        return this.searchByIngredient(context, searchFormService.recipeIngredient, shoppingList);
      }

      alert = {
        alertType: "danger",
        title: "Validation Error",
        message: "Please enter a search term.",
      };

      return context.html(
        SearchRecipesResponse({ alert, recipes: [], shoppingList }),
      );
      
    } catch (error) {
      console.error("Error searching recipes:", error);
      alert = {
        alertType: "danger",
        title: "Error",
        message: `Failed to search recipes: ${(error as Error).message}`,
      };

      return context.html(
        SearchRecipesResponse({ alert, recipes: [], shoppingList }),
      );
    }
  }

  private async searchByName(context: Context, recipeName: string, shoppingList: ShoppingListProps) {
    let alert: AlertProps;
    const recipes = await this.recipeService.searchRecipesByName(
      recipeName.trim(),
    );

    if (recipes.length === 0) {
      alert = {
        alertType: "warning",
        title: "No Results",
        message: `No recipes found containing "${recipeName}".`,
      };
    } else {
      alert = {
        alertType: "success",
        title: "Search Results",
        message: `Found ${recipes.length} recipe${recipes.length === 1 ? "" : "s"} containing "${recipeName}".`,
      };
    }

    return context.html(
      SearchRecipesResponse({ alert, recipes, shoppingList }),
    );
  }

  private async searchByTag(context: Context, recipeTag: string, shoppingList: ShoppingListProps) {
    let alert: AlertProps;
    const recipes = await this.recipeService.searchRecipesByTag(recipeTag.trim());

    if (recipes.length === 0) {
      alert = {
        alertType: "warning",
        title: "No Results",
        message: `No recipes found with tag "${recipeTag}".`,
      };
    } else {
      alert = {
        alertType: "success",
        title: "Search Results",
        message: `Found ${recipes.length} recipe${recipes.length === 1 ? "" : "s"} with tag "${recipeTag}".`,
      };
    }

    return context.html(
      SearchRecipesResponse({ alert, recipes, shoppingList }),
    );
  }

  private async searchByIngredient(context: Context, recipeIngredient: string, shoppingList: ShoppingListProps) {
    let alert: AlertProps;
    const recipes = await this.recipeService.searchRecipesByIngredient(
      recipeIngredient.trim(),
    );

    if (recipes.length === 0) {
      alert = {
        alertType: "warning",
        title: "No Results",
        message: `No recipes found containing ingredient "${recipeIngredient}".`,
      };
    } else {
      alert = {
        alertType: "success",
        title: "Search Results",
        message: `Found ${recipes.length} recipe${recipes.length === 1 ? "" : "s"} containing ingredient "${recipeIngredient}".`,
      };
    }

    return context.html(
      SearchRecipesResponse({ alert, recipes, shoppingList }),
    ); 
  }

  private async updateRecipe(context: Context): Promise<Response> {
    console.log("Updating recipe ...");
    const shoppingList = await this.getShoppingList();
    let alert: AlertProps | undefined;

    const id = this.parseRecipeIdFromContext(context);

    try {
      const formData = await context.req.formData();
      const recipeFormService = new RecipeFormService(formData)
      
      if (!recipeFormService.isValid) {
        return this.invalidFormResponse(context, shoppingList)
      }

      const recipe = await this.recipeService.updateCompleteRecipe(
        id,
        recipeFormService.recipeData,
      );

      if (recipe) {
        alert = {
          alertType: "success",
          title: "Recipe Updated",
          message: `Recipe "${recipe.name}" updated successfully!`,
        };

        return context.html(UpdateRecipeResponse({ alert, recipe }));
      } else {
        alert = {
          alertType: "danger",
          title: "Error",
          message: "Failed to update recipe",
        };
      }

      return context.html(StandardResponse({ alert, shoppingList }));
    } catch (error) {
      console.error("Error updating recipe:", error);
      alert = {
        alertType: "danger",
        title: "Error",
        message: `Failed to update recipe: ${(error as Error).message}`,
      };

      return context.html(StandardResponse({ alert, shoppingList }));
    }
  }

  private async deleteRecipe(context: Context): Promise<Response> {
    console.log("Deleting recipe ...");
    const shoppingList = await this.getShoppingList();
    const id = this.parseRecipeIdFromContext(context);

    const hasBeenDeleted = await this.recipeService.deleteCompleteRecipe(id);

    const alert: AlertProps = hasBeenDeleted
      ? {
          alertType: "success",
          title: "Recipe deleted",
          message: `Recipe with ID ${id} has been successfully deleted.`,
        }
      : {
          alertType: "danger",
          title: "Error",
          message: `Failed to delete recipe with ID ${id}`,
        };

    return context.html(StandardResponse({ alert, shoppingList }));
  }

  private parseRecipeIdFromContext(context: Context) {
    return parseInt(context.req.param("id"), 10);
  }

  private async getShoppingList() {
    const items = await this.shoppingListService.getAllItems();
    const stats = await this.shoppingListService.getStats();
    const shoppingList: ShoppingListProps = { items, stats };

    return shoppingList;
  }

  private invalidFormResponse(context: Context, shoppingList: ShoppingListProps) {
    const alert: AlertProps = {
      alertType: "danger",
      title: "Validation Error",
      message:
        "Name, servings, at least one ingredient, and at least one direction are required.",
    };

    return context.html(StandardResponse({ alert, shoppingList }));
  }
}
