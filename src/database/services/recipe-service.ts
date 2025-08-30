import { DbContext } from "../context/context";
import { CooksNoteRepository } from "../repositories/cooks-note-repository";
import {
  IngredientEntity,
  IngredientRepository,
} from "../repositories/ingredient-repository";
import {
  DirectionEntity,
  DirectionRepository,
} from "../repositories/direction-repository";
import {
  RecipeEntity,
  RecipeRepository,
} from "../repositories/recipe-repository";
import { RecipeTagRepository } from "../repositories/recipe-tag-repository";
import { TagRepository, TagEntity } from "../repositories/tag-repository";

interface RecipeConstiuents {
  ingredients: IngredientEntity[];
  directions: DirectionEntity[];
  cooksNotes: string[];
  tags: string[];
}

export interface CompleteRecipe extends RecipeEntity, RecipeConstiuents {}

export interface CreateRecipeData {
  name: string;
  servings: string;
  calories_per_serving?: number;
  preparation_time?: string;
  cooking_time?: string;
  ingredients: Array<{
    quantity?: string;
    unit?: string;
    name: string;
  }>;
  directions: Array<{
    instruction: string;
  }>;
  cooksNotes?: string[];
  tags?: string[];
}

export interface UploadResult {
  success: boolean;
  imported: number;
  skipped: number;
  errors: number;
  messages: string[];
}

export class RecipeService {
  constructor(
    private recipeRepository: RecipeRepository,
    private ingredientRepository: IngredientRepository,
    private directionRepository: DirectionRepository,
    private cooksNoteRepository: CooksNoteRepository,
    private tagRepository: TagRepository,
    private recipeTagRepository: RecipeTagRepository,
    private dbContext: DbContext,
  ) {}

  getCompleteRecipe(id: number): CompleteRecipe | null {
    const recipe = this.recipeRepository.read(id);
    if (!recipe) return null;

    const constiuents = this.getRecipeConstiuents(id);

    return {
      ...recipe,
      ...constiuents,
    };
  }

  getAllCompleteRecipes(): CompleteRecipe[] {
    const recipes = this.recipeRepository.readAll();

    return recipes.map((recipe) => {
      const id = recipe.id;
      const constiuents = this.getRecipeConstiuents(id);

      return {
        ...recipe,
        ...constiuents,
      };
    });
  }

  createCompleteRecipe(data: CreateRecipeData): CompleteRecipe | null {
    return this.dbContext.transaction(() => {
      // Create the main recipe
      const recipe = this.recipeRepository.create({
        name: data.name,
        servings: data.servings,
        calories_per_serving: data.calories_per_serving,
        preparation_time: data.preparation_time,
        cooking_time: data.cooking_time,
      });

      if (!recipe) return null;

      // Add ingredients
      data.ingredients.forEach((ingredient, index) => {
        this.ingredientRepository.create({
          recipe_id: recipe.id,
          quantity: ingredient.quantity,
          unit: ingredient.unit,
          name: ingredient.name,
          order_index: index,
        });
      });

      // Add directions
      data.directions.forEach((step, index) => {
        this.directionRepository.create({
          recipe_id: recipe.id,
          order_index: index + 1,
          instruction: step.instruction,
        });
      });

      // Add cook's notes
      if (data.cooksNotes) {
        data.cooksNotes.forEach((note) => {
          this.cooksNoteRepository.create({
            recipe_id: recipe.id,
            note: note,
          });
        });
      }

      // Add tags
      if (data.tags) {
        data.tags.forEach((tagName) => {
          const tag = this.tagRepository.createOrRead(tagName);
          if (tag) {
            this.recipeTagRepository.create({
              recipe_id: recipe.id,
              tag_id: tag.id,
            });
          }
        });
      }

      return this.getCompleteRecipe(recipe.id);
    });
  }

  updateCompleteRecipe(
    id: number,
    data: CreateRecipeData,
  ): CompleteRecipe | null {
    return this.dbContext.transaction(() => {
      const existingRecipe = this.recipeRepository.read(id);
      if (!existingRecipe) return null;

      // Update main recipe
      const updatedRecipe = this.recipeRepository.update({
        ...existingRecipe,
        name: data.name,
        servings: data.servings,
        calories_per_serving: data.calories_per_serving,
        preparation_time: data.preparation_time,
        cooking_time: data.cooking_time,
      });

      if (!updatedRecipe) return null;

      // Delete and recreate related entities
      this.ingredientRepository.deleteByRecipeId(id);
      this.directionRepository.deleteByRecipeId(id);
      this.cooksNoteRepository.deleteByRecipeId(id);
      this.recipeTagRepository.deleteByRecipeId(id);

      // Recreate ingredients
      data.ingredients.forEach((ingredient, index) => {
        this.ingredientRepository.create({
          recipe_id: id,
          quantity: ingredient.quantity,
          unit: ingredient.unit,
          name: ingredient.name,
          order_index: index,
        });
      });

      // Recreate directions
      data.directions.forEach((step, index) => {
        this.directionRepository.create({
          recipe_id: id,
          order_index: index + 1,
          instruction: step.instruction,
        });
      });

      // Recreate cook's notes
      if (data.cooksNotes) {
        data.cooksNotes.forEach((note) => {
          this.cooksNoteRepository.create({
            recipe_id: id,
            note: note,
          });
        });
      }

      // Recreate tags
      if (data.tags) {
        data.tags.forEach((tagName) => {
          const tag = this.tagRepository.createOrRead(tagName);
          if (tag) {
            this.recipeTagRepository.create({
              recipe_id: id,
              tag_id: tag.id,
            });
          }
        });
      }

      return this.getCompleteRecipe(id);
    });
  }

  deleteCompleteRecipe(id: number): boolean {
    // Foreign key constraints with CASCADE will handle related entities
    return this.recipeRepository.delete(id);
  }

  searchRecipesByTag(tagName: string): CompleteRecipe[] {
    const tag = this.tagRepository.readByName(tagName);
    if (!tag) return [];

    const recipeTags = this.recipeTagRepository.readByTagId(tag.id);
    return recipeTags
      .map((rt) => this.recipeRepository.read(rt.recipe_id))
      .filter((recipe) => recipe !== null)
      .map((rcp) => {
        const id = rcp.id;
        const constiuents = this.getRecipeConstiuents(id);

        return {
          ...rcp,
          ...constiuents,
        };
      });
  }

  searchRecipesByName(searchTerm: string): CompleteRecipe[] {
    const recipes = this.recipeRepository.searchByName(searchTerm);
    if (recipes.length === 0) return [];
    return recipes.map((recipe) => {
      const id = recipe.id;
      const constiuents = this.getRecipeConstiuents(id);

      return {
        ...recipe,
        ...constiuents,
      };
    });
  }

  searchRecipesByIngredient(ingredientName: string): CompleteRecipe[] {
    const matchingIngredients =
      this.ingredientRepository.searchByName(ingredientName);

    if (matchingIngredients.length === 0) return [];

    const recipeIds = [
      ...new Set(matchingIngredients.map((ingredient) => ingredient.recipe_id)),
    ];

    return recipeIds
      .map((id) => this.recipeRepository.read(id))
      .filter((recipe) => recipe !== null)
      .map((recipe) => {
        const constiuents = this.getRecipeConstiuents(recipe.id);
        return { ...recipe, ...constiuents };
      });
  }

  getAllTags(): TagEntity[] {
    return this.tagRepository.readAll();
  }

  private getRecipeConstiuents(id: number): RecipeConstiuents {
    const ingredients = this.ingredientRepository.readByRecipeId(id);
    const directions = this.directionRepository.readByRecipeId(id);
    const cooksNotes = this.cooksNoteRepository.readByRecipeId(id);

    // Get tags through the junction table
    const recipeTags = this.recipeTagRepository.readByRecipeId(id);
    const tags = recipeTags
      .map((rt) => this.tagRepository.read(rt.tag_id))
      .filter((tag) => tag !== null)
      .map((tag) => tag!.name);

    return {
      ingredients,
      directions,
      cooksNotes: cooksNotes.map((n) => n.note),
      tags,
    };
  }

  public importRecipesFromJson(
    jsonData: CompleteRecipe[],
    overwriteExisting: boolean = false
  ): UploadResult {
    const result: UploadResult = {
      success: true,
      imported: 0,
      skipped: 0,
      errors: 0,
      messages: []
    };
  
    return this.dbContext.transaction(() => {
      for (const recipeData of jsonData) {
        try {
          // Check if recipe with same name exists
          const existingRecipes = this.recipeRepository.searchByName(recipeData.name);
          const exactMatch = existingRecipes.find(r => 
            r.name.toLowerCase() === recipeData.name.toLowerCase()
          );
  
          if (exactMatch && !overwriteExisting) {
            result.skipped++;
            result.messages.push(`Skipped "${recipeData.name}" - already exists`);
            continue;
          }
  
          // If overwriting, delete the existing recipe
          if (exactMatch && overwriteExisting) {
            this.deleteCompleteRecipe(exactMatch.id);
            result.messages.push(`Replaced existing recipe "${recipeData.name}"`);
          }
  
          // Convert CompleteRecipe to CreateRecipeData format
          const createData: CreateRecipeData = {
            name: recipeData.name,
            servings: recipeData.servings,
            calories_per_serving: recipeData.calories_per_serving,
            preparation_time: recipeData.preparation_time,
            cooking_time: recipeData.cooking_time,
            ingredients: recipeData.ingredients.map(ing => ({
              quantity: ing.quantity,
              unit: ing.unit,
              name: ing.name
            })),
            directions: recipeData.directions.map(dir => ({
              instruction: dir.instruction
            })),
            cooksNotes: recipeData.cooksNotes.length > 0 ? recipeData.cooksNotes : undefined,
            tags: recipeData.tags.length > 0 ? recipeData.tags : undefined
          };
  
          const createdRecipe = this.createCompleteRecipe(createData);
          
          if (createdRecipe) {
            result.imported++;
            if (!exactMatch) {
              result.messages.push(`Imported "${recipeData.name}"`);
            }
          } else {
            result.errors++;
            result.messages.push(`Failed to import "${recipeData.name}"`);
          }
  
        } catch (error) {
          result.errors++;
          result.messages.push(`Error importing "${recipeData.name}": ${(error as Error).message}`);
        }
      }
  
      if (result.errors > 0) {
        result.success = false;
      }
  
      return result;
    });
  }
  
  /**
   * Validate imported recipe data structure
   */
  public validateRecipeData(data: any[]): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!Array.isArray(data)) {
      errors.push("Data must be an array of recipes");
      return { valid: false, errors };
    }
  
    if (data.length === 0) {
      errors.push("No recipes found in the data");
      return { valid: false, errors };
    }
  
    // Validate each recipe has required fields
    for (let i = 0; i < data.length; i++) {
      const recipe = data[i];
      const recipeErrors: string[] = [];
  
      if (!recipe.name || typeof recipe.name !== 'string') {
        recipeErrors.push(`Recipe ${i + 1}: Missing or invalid name`);
      }
  
      if (!recipe.servings || typeof recipe.servings !== 'string') {
        recipeErrors.push(`Recipe ${i + 1}: Missing or invalid servings`);
      }
  
      if (!Array.isArray(recipe.ingredients) || recipe.ingredients.length === 0) {
        recipeErrors.push(`Recipe ${i + 1}: Missing or empty ingredients array`);
      } else {
        recipe.ingredients.forEach((ing: any, idx: number) => {
          if (!ing.name || typeof ing.name !== 'string') {
            recipeErrors.push(`Recipe ${i + 1}, Ingredient ${idx + 1}: Missing or invalid name`);
          }
        });
      }
  
      if (!Array.isArray(recipe.directions) || recipe.directions.length === 0) {
        recipeErrors.push(`Recipe ${i + 1}: Missing or empty directions array`);
      } else {
        recipe.directions.forEach((dir: any, idx: number) => {
          if (!dir.instruction || typeof dir.instruction !== 'string') {
            recipeErrors.push(`Recipe ${i + 1}, Direction ${idx + 1}: Missing or invalid instruction`);
          }
        });
      }
  
      // Ensure arrays exist even if empty
      if (!Array.isArray(recipe.cooksNotes)) {
        recipe.cooksNotes = [];
      }
  
      if (!Array.isArray(recipe.tags)) {
        recipe.tags = [];
      }
  
      errors.push(...recipeErrors);
    }
  
    return { valid: errors.length === 0, errors };
  }
}
