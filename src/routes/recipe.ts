import { Context } from "hono";
import {
  CompleteRecipe,
  CreateRecipeData,
  RecipeService,
} from "../database/services/recipe-service";
import { Container } from "./container";
import { BaseRoute } from "./base-route";
import { Alert, type AlertProps } from "../components/Alert";
import { GetRecipeByIDResponse } from "../components/responses/GetRecipeByIdResponse";
import { ReadRecipe, ReadRecipeProps } from "../components/RecipeCard";
import { CreateRecipeResponse } from "../components/responses/CreateRecipeResponse";
import { CreateUpdateRecipeResponse } from "../components/responses/CreateUpdateRecipeResponse";
import { SearchRecipesResponse } from "../components/responses/SearchRecipesResponse";

export class RecipeRoute extends BaseRoute {
  private recipeService: RecipeService;

  constructor(container: Container = Container.getInstance()) {
    super({ prefix: "/recipe" });
    this.recipeService = container.get<RecipeService>("recipeService");
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
    let alert: AlertProps;

    try {
      const formData = await this.parseRecipeFormData(context);

      // Validate basic required fields
      if (!this.formDataIsValid(formData)) {
        alert = {
          alertType: "danger",
          title: "Validation Error",
          message:
            "Name, servings, at least one ingredient, and at least one method step are required.",
        };

        return context.html(CreateRecipeResponse({ alert, recipe: undefined }));
      }

      const recipe = this.recipeService.createCompleteRecipe(formData);

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

      return context.html(CreateUpdateRecipeResponse({ alert }), {
        headers: recipe ? { "HX-Trigger": "recipe-created" } : {},
      });
    } catch (error) {
      console.error("Error creating recipe:", error);
      alert = {
        alertType: "danger",
        title: "Error",
        message: `Failed to create recipe: ${(error as Error).message}`,
      };

      return context.html(CreateUpdateRecipeResponse({ alert }));
    }
  }

  private async getRecipeById(context: Context): Promise<Response> {
    console.log("Fetching recipe by ID...");
    const id = this.parseRecipeIdFromContext(context);

    try {
      const recipe = this.recipeService.getCompleteRecipe(id);

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
      const recipes = this.recipeService.getAllCompleteRecipes();

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
    let alert: AlertProps | undefined;

    try {
      const formData = await context.req.formData();
      const searchType = formData.get("searchType") as string;
      const recipeName = formData.get("recipeName") as string;
      const recipeTag = formData.get("recipeTag") as string;
      const recipeIngredient = formData.get("recipeIngredient") as string;

      let recipes: CompleteRecipe[] = [];

      if (searchType === "name" && recipeName?.trim()) {
        recipes = this.recipeService.searchRecipesByName(recipeName.trim());

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
      } else if (searchType === "tag" && recipeTag?.trim()) {
        recipes = this.recipeService.searchRecipesByTag(recipeTag.trim());

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
      } else if (searchType === "ingredient" && recipeIngredient?.trim()) {
        recipes = this.recipeService.searchRecipesByIngredient(
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
      } else {
        alert = {
          alertType: "danger",
          title: "Validation Error",
          message: "Please enter a search term.",
        };
      }

      return context.html(SearchRecipesResponse({ alert, recipes }));
    } catch (error) {
      console.error("Error searching recipes:", error);
      alert = {
        alertType: "danger",
        title: "Error",
        message: `Failed to search recipes: ${(error as Error).message}`,
      };

      return context.html(SearchRecipesResponse({ alert, recipes: [] }));
    }
  }

  private async updateRecipe(context: Context): Promise<Response> {
    console.log("Updating recipe ...");
    let alert: AlertProps | undefined;

    const id = this.parseRecipeIdFromContext(context);

    try {
      const formData = await this.parseRecipeFormData(context);

      // Validate basic required fields
      if (!this.formDataIsValid(formData)) {
        alert = {
          alertType: "danger",
          title: "Validation Error",
          message:
            "Name, servings, at least one ingredient, and at least one method step are required.",
        };

        return context.html(CreateUpdateRecipeResponse({ alert }));
      }

      const recipe = this.recipeService.updateCompleteRecipe(id, formData);

      if (recipe) {
        alert = {
          alertType: "success",
          title: "Recipe Created",
          message: `Recipe "${recipe.name}" updated successfully!`,
        };
      } else {
        alert = {
          alertType: "danger",
          title: "Error",
          message: "Failed to update recipe",
        };
      }

      return context.html(CreateUpdateRecipeResponse({ alert }), {
        headers: recipe ? { "HX-Trigger": "recipe-created" } : {},
      });
    } catch (error) {
      console.error("Error updating recipe:", error);
      alert = {
        alertType: "danger",
        title: "Error",
        message: `Failed to update recipe: ${(error as Error).message}`,
      };

      return context.html(CreateUpdateRecipeResponse({ alert }));
    }
  }

  private async deleteRecipe(context: Context): Promise<Response> {
    console.log("Deleting recipe ...");
    const id = this.parseRecipeIdFromContext(context);

    const hasBeenDeleted = this.recipeService.deleteCompleteRecipe(id);

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

    return context.html(Alert(alert), {
      headers: { "HX-Trigger": "recipe-deleted" },
    });
  }

  private parseRecipeIdFromContext(context: Context) {
    return parseInt(context.req.param("id"), 10);
  }

  private async parseRecipeFormData(
    context: Context,
  ): Promise<CreateRecipeData> {
    const formData = await context.req.formData();

    // Parse basic fields
    const name = formData.get("name") as string;
    const servings = formData.get("servings") as string;
    const calories_per_serving = formData.get("calories_per_serving")
      ? parseInt(formData.get("calories_per_serving") as string)
      : undefined;
    const preparation_time =
      (formData.get("preparation_time") as string) || undefined;
    const cooking_time = (formData.get("cooking_time") as string) || undefined;

    // Parse ingredients array
    const ingredients: Array<{
      quantity?: string;
      unit?: string;
      name: string;
    }> = [];
    let ingredientIndex = 0;

    while (formData.has(`ingredients[${ingredientIndex}][name]`)) {
      const quantity =
        (formData.get(`ingredients[${ingredientIndex}][quantity]`) as string) ||
        undefined;
      const unit =
        (formData.get(`ingredients[${ingredientIndex}][unit]`) as string) ||
        undefined;
      const ingredientName = formData.get(
        `ingredients[${ingredientIndex}][name]`,
      ) as string;

      if (ingredientName) {
        ingredients.push({
          quantity: quantity || undefined,
          unit: unit || undefined,
          name: ingredientName,
        });
      }
      ingredientIndex++;
    }

    // Parse method steps array
    const method: Array<{ instruction: string }> = [];
    let methodIndex = 0;

    while (formData.has(`method[${methodIndex}][instruction]`)) {
      const instruction = formData.get(
        `method[${methodIndex}][instruction]`,
      ) as string;

      if (instruction?.trim()) {
        method.push({ instruction: instruction.trim() });
      }
      methodIndex++;
    }

    // Parse cook's notes array
    const cooksNotes: string[] = [];
    let noteIndex = 0;

    while (formData.has(`cooksNotes[${noteIndex}][note]`)) {
      const note = formData.get(`cooksNotes[${noteIndex}][note]`) as string;

      if (note?.trim()) {
        cooksNotes.push(note.trim());
      }
      noteIndex++;
    }

    // Parse tags
    const tagsString = formData.get("tags") as string;
    const tags = tagsString
      ? tagsString
          .split(",")
          .map((tag) => tag.trim())
          .filter((tag) => tag.length > 0)
      : undefined;

    return {
      name,
      servings,
      calories_per_serving,
      preparation_time,
      cooking_time,
      ingredients,
      method,
      cooksNotes: cooksNotes.length > 0 ? cooksNotes : undefined,
      tags,
    };
  }

  private formDataIsValid(formData: CreateRecipeData) {
    return (
      formData.name ||
      formData.servings ||
      formData.ingredients?.length ||
      formData.method?.length
    );
  }
}
