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

interface RecipeConstituents {
  ingredients: IngredientEntity[];
  directions: DirectionEntity[];
  cooksNotes: string[];
  tags: string[];
}

export interface CompleteRecipe extends RecipeEntity, RecipeConstituents {}

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

export interface TagStatistic {
  name: string;
  count: number;
}

export interface RecipeStatistics {
  totalRecipes: number;
  tagStatistics: TagStatistic[];
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

  async getCompleteRecipe(id: number): Promise<CompleteRecipe | null> {
    const recipe = await this.recipeRepository.read(id);
    if (!recipe) return null;

    const constituents = await this.getRecipeConstituents(id);

    return {
      ...recipe,
      ...constituents,
    };
  }

  async getAllCompleteRecipes(): Promise<CompleteRecipe[]> {
    const recipes = await this.recipeRepository.readAll();

    // Use Promise.all to properly await all async operations
    return await Promise.all(
      recipes.map(async (recipe) => {
        const constituents = await this.getRecipeConstituents(recipe.id);
        return {
          ...recipe,
          ...constituents,
        };
      }),
    );
  }

  async createCompleteRecipeInternal(
    data: CreateRecipeData,
  ): Promise<CompleteRecipe | null> {
    // Create the main recipe
    const recipe = await this.recipeRepository.create({
      name: data.name,
      servings: data.servings,
      calories_per_serving: data.calories_per_serving,
      preparation_time: data.preparation_time,
      cooking_time: data.cooking_time,
    });

    if (!recipe) return null;

    // Use Promise.all instead of forEach to properly await all operations
    await Promise.all(
      data.ingredients.map(async (ingredient, index) => {
        return await this.ingredientRepository.create({
          recipe_id: recipe.id,
          quantity: ingredient.quantity,
          unit: ingredient.unit,
          name: ingredient.name,
          order_index: index,
        });
      }),
    );

    await Promise.all(
      data.directions.map(async (step, index) => {
        return await this.directionRepository.create({
          recipe_id: recipe.id,
          order_index: index + 1,
          instruction: step.instruction,
        });
      }),
    );

    // Add cook's notes
    if (data.cooksNotes) {
      await Promise.all(
        data.cooksNotes.map(async (note) => {
          return await this.cooksNoteRepository.create({
            recipe_id: recipe.id,
            note: note,
          });
        }),
      );
    }

    // Add tags
    if (data.tags) {
      await Promise.all(
        data.tags.map(async (tagName) => {
          const tag = await this.tagRepository.createOrRead(tagName);
          if (tag) {
            return await this.recipeTagRepository.create({
              recipe_id: recipe.id,
              tag_id: tag.id,
            });
          }
        }),
      );
    }

    return await this.getCompleteRecipe(recipe.id);
  }

  async createCompleteRecipe(
    data: CreateRecipeData,
  ): Promise<CompleteRecipe | null> {
    return await this.dbContext.transaction(async () => {
      return await this.createCompleteRecipeInternal(data);
    });
  }

  async updateCompleteRecipe(
    id: number,
    data: CreateRecipeData,
  ): Promise<CompleteRecipe | null> {
    return await this.dbContext.transaction(async () => {
      const existingRecipe = await this.recipeRepository.read(id);
      if (!existingRecipe) return null;

      // Update main recipe
      const updatedRecipe = await this.recipeRepository.update({
        ...existingRecipe,
        name: data.name,
        servings: data.servings,
        calories_per_serving: data.calories_per_serving,
        preparation_time: data.preparation_time,
        cooking_time: data.cooking_time,
      });

      if (!updatedRecipe) return null;

      // Smart update of constituents instead of delete/recreate
      await this.updateIngredients(id, data.ingredients);
      await this.updateDirections(id, data.directions);
      await this.updateCooksNotes(id, data.cooksNotes || []);
      await this.updateTags(id, data.tags || []);

      return await this.getCompleteRecipe(id);
    });
  }

  // Smart update methods that modify existing records instead of delete/recreate
  private async updateIngredients(
    recipeId: number,
    newIngredients: CreateRecipeData["ingredients"],
  ): Promise<void> {
    const existingIngredients =
      await this.ingredientRepository.readByRecipeId(recipeId);

    // Update or create ingredients
    await Promise.all(
      newIngredients.map(async (ingredient, index) => {
        const existing = existingIngredients[index];

        if (existing) {
          // Update existing ingredient
          return await this.ingredientRepository.update({
            ...existing,
            quantity: ingredient.quantity,
            unit: ingredient.unit,
            name: ingredient.name,
            order_index: index,
          });
        } else {
          // Create new ingredient
          return await this.ingredientRepository.create({
            recipe_id: recipeId,
            quantity: ingredient.quantity,
            unit: ingredient.unit,
            name: ingredient.name,
            order_index: index,
          });
        }
      }),
    );

    // Delete any extra existing ingredients
    if (existingIngredients.length > newIngredients.length) {
      const toDelete = existingIngredients.slice(newIngredients.length);
      await Promise.all(
        toDelete.map(async (ingredient) => {
          return await this.ingredientRepository.delete(ingredient.id);
        }),
      );
    }
  }

  private async updateDirections(
    recipeId: number,
    newDirections: CreateRecipeData["directions"],
  ): Promise<void> {
    const existingDirections =
      await this.directionRepository.readByRecipeId(recipeId);

    // Update or create directions
    await Promise.all(
      newDirections.map(async (direction, index) => {
        const existing = existingDirections[index];

        if (existing) {
          // Update existing direction
          return await this.directionRepository.update({
            ...existing,
            order_index: index + 1,
            instruction: direction.instruction,
          });
        } else {
          // Create new direction
          return await this.directionRepository.create({
            recipe_id: recipeId,
            order_index: index + 1,
            instruction: direction.instruction,
          });
        }
      }),
    );

    // Delete any extra existing directions
    if (existingDirections.length > newDirections.length) {
      const toDelete = existingDirections.slice(newDirections.length);
      await Promise.all(
        toDelete.map(async (direction) => {
          return await this.directionRepository.delete(direction.id);
        }),
      );
    }
  }

  private async updateCooksNotes(
    recipeId: number,
    newNotes: string[],
  ): Promise<void> {
    const existingNotes =
      await this.cooksNoteRepository.readByRecipeId(recipeId);

    // Update or create notes
    await Promise.all(
      newNotes.map(async (note, index) => {
        const existing = existingNotes[index];

        if (existing) {
          // Update existing note
          return await this.cooksNoteRepository.update({
            ...existing,
            note: note,
          });
        } else {
          // Create new note
          return await this.cooksNoteRepository.create({
            recipe_id: recipeId,
            note: note,
          });
        }
      }),
    );

    // Delete any extra existing notes
    if (existingNotes.length > newNotes.length) {
      const toDelete = existingNotes.slice(newNotes.length);
      await Promise.all(
        toDelete.map(async (note) => {
          return await this.cooksNoteRepository.delete(note.id);
        }),
      );
    }
  }

  private async updateTags(
    recipeId: number,
    newTagNames: string[],
  ): Promise<void> {
    // Get current recipe tags
    const currentRecipeTags =
      await this.recipeTagRepository.readByRecipeId(recipeId);
    const currentTagIds = await Promise.all(
      currentRecipeTags.map(async (rt) => {
        const tag = await this.tagRepository.read(rt.tag_id);
        return tag?.name;
      }),
    );

    // Filter out null values
    const currentTagNames = currentTagIds.filter(
      (name): name is string => name !== null,
    );

    // Find tags to add and remove
    const tagsToAdd = newTagNames.filter(
      (name) => !currentTagNames.includes(name),
    );
    const tagsToRemove = currentTagNames.filter(
      (name) => !newTagNames.includes(name),
    );

    // Remove tags that are no longer needed
    for (const tagName of tagsToRemove) {
      const tag = await this.tagRepository.readByName(tagName);
      if (tag) {
        const recipeTag = await this.recipeTagRepository.readByRecipeAndTag(
          recipeId,
          tag.id,
        );
        if (recipeTag) {
          await this.recipeTagRepository.delete(recipeTag.id);
        }
      }
    }

    // Add new tags
    await Promise.all(
      tagsToAdd.map(async (tagName) => {
        const tag = await this.tagRepository.createOrRead(tagName);
        if (tag) {
          return await this.recipeTagRepository.create({
            recipe_id: recipeId,
            tag_id: tag.id,
          });
        }
      }),
    );
  }

  async deleteCompleteRecipe(id: number): Promise<boolean> {
    // Foreign key constraints with CASCADE will handle related entities
    return await this.recipeRepository.delete(id);
  }

  async searchRecipesByTag(tagName: string): Promise<CompleteRecipe[]> {
    const tag = await this.tagRepository.readByName(tagName);
    if (!tag) return [];

    const recipeTags = await this.recipeTagRepository.readByTagId(tag.id);

    // Get all recipes, filtering out nulls
    const recipePromises = recipeTags.map(async (rt) => {
      return await this.recipeRepository.read(rt.recipe_id);
    });

    const recipes = await Promise.all(recipePromises);
    const validRecipes = recipes.filter(
      (recipe): recipe is RecipeEntity => recipe !== null,
    );

    // Get constituents for each valid recipe
    return await Promise.all(
      validRecipes.map(async (recipe) => {
        const constituents = await this.getRecipeConstituents(recipe.id);
        return {
          ...recipe,
          ...constituents,
        };
      }),
    );
  }

  async searchRecipesByName(searchTerm: string): Promise<CompleteRecipe[]> {
    const recipes = await this.recipeRepository.searchByName(searchTerm);
    if (recipes.length === 0) return [];

    // Use Promise.all to properly await all async operations
    return await Promise.all(
      recipes.map(async (recipe) => {
        const constituents = await this.getRecipeConstituents(recipe.id);
        return {
          ...recipe,
          ...constituents,
        };
      }),
    );
  }

  async searchRecipesByIngredient(
    ingredientName: string,
  ): Promise<CompleteRecipe[]> {
    const matchingIngredients =
      await this.ingredientRepository.searchByName(ingredientName);
    if (matchingIngredients.length === 0) return [];

    const recipeIds = [
      ...new Set(matchingIngredients.map((ingredient) => ingredient.recipe_id)),
    ];

    // Get all recipes, filtering out nulls
    const recipePromises = recipeIds.map(async (id) => {
      return await this.recipeRepository.read(id);
    });

    const recipes = await Promise.all(recipePromises);
    const validRecipes = recipes.filter(
      (recipe): recipe is RecipeEntity => recipe !== null,
    );

    // Get constituents for each valid recipe
    return await Promise.all(
      validRecipes.map(async (recipe) => {
        const constituents = await this.getRecipeConstituents(recipe.id);
        return {
          ...recipe,
          ...constituents,
        };
      }),
    );
  }

  async getAllTags(): Promise<TagEntity[]> {
    return await this.tagRepository.readAll();
  }

  private async getRecipeConstituents(id: number): Promise<RecipeConstituents> {
    // Use Promise.all to fetch all constituents in parallel
    const [ingredients, directions, cooksNotes, recipeTags] = await Promise.all(
      [
        this.ingredientRepository.readByRecipeId(id),
        this.directionRepository.readByRecipeId(id),
        this.cooksNoteRepository.readByRecipeId(id),
        this.recipeTagRepository.readByRecipeId(id),
      ],
    );

    // Get tag names
    const tagPromises = recipeTags.map(async (rt) => {
      return await this.tagRepository.read(rt.tag_id);
    });

    const tags = await Promise.all(tagPromises);
    const tagNames = tags
      .filter((tag): tag is TagEntity => tag !== null)
      .map((tag) => tag.name);

    return {
      ingredients,
      directions,
      cooksNotes: cooksNotes.map((n) => n.note),
      tags: tagNames,
    };
  }

  public async importRecipesFromJson(
    jsonData: CompleteRecipe[],
    overwriteExisting: boolean = false,
  ): Promise<UploadResult> {
    const result: UploadResult = {
      success: true,
      imported: 0,
      skipped: 0,
      errors: 0,
      messages: [],
    };

    return await this.dbContext.transaction(async () => {
      for (const recipeData of jsonData) {
        try {
          // Check if recipe with same name exists
          const existingRecipes = await this.recipeRepository.searchByName(
            recipeData.name,
          );
          const exactMatch = existingRecipes.find(
            (r) => r.name.toLowerCase() === recipeData.name.toLowerCase(),
          );

          if (exactMatch && !overwriteExisting) {
            result.skipped++;
            result.messages.push(
              `Skipped "${recipeData.name}" - already exists`,
            );
            continue;
          }

          // If overwriting, delete the existing recipe
          if (exactMatch && overwriteExisting) {
            await this.deleteCompleteRecipe(exactMatch.id);
            result.messages.push(
              `Replaced existing recipe "${recipeData.name}"`,
            );
          }

          // Convert CompleteRecipe to CreateRecipeData format
          const createData: CreateRecipeData = {
            name: recipeData.name,
            servings: recipeData.servings,
            calories_per_serving: recipeData.calories_per_serving,
            preparation_time: recipeData.preparation_time,
            cooking_time: recipeData.cooking_time,
            ingredients: recipeData.ingredients.map((ing) => ({
              quantity: ing.quantity,
              unit: ing.unit,
              name: ing.name,
            })),
            directions: recipeData.directions.map((dir) => ({
              instruction: dir.instruction,
            })),
            cooksNotes:
              recipeData.cooksNotes.length > 0
                ? recipeData.cooksNotes
                : undefined,
            tags: recipeData.tags.length > 0 ? recipeData.tags : undefined,
          };

          const createdRecipe =
            await this.createCompleteRecipeInternal(createData);

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
          result.messages.push(
            `Error importing "${recipeData.name}": ${(error as Error).message}`,
          );
        }
      }

      if (result.errors > 0) {
        result.success = false;
      }

      return result;
    });
  }

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

      if (!recipe.name || typeof recipe.name !== "string") {
        recipeErrors.push(`Recipe ${i + 1}: Missing or invalid name`);
      }

      if (!recipe.servings || typeof recipe.servings !== "string") {
        recipeErrors.push(`Recipe ${i + 1}: Missing or invalid servings`);
      }

      if (
        !Array.isArray(recipe.ingredients) ||
        recipe.ingredients.length === 0
      ) {
        recipeErrors.push(
          `Recipe ${i + 1}: Missing or empty ingredients array`,
        );
      } else {
        recipe.ingredients.forEach((ing: any, idx: number) => {
          if (!ing.name || typeof ing.name !== "string") {
            recipeErrors.push(
              `Recipe ${i + 1}, Ingredient ${idx + 1}: Missing or invalid name`,
            );
          }
        });
      }

      if (!Array.isArray(recipe.directions) || recipe.directions.length === 0) {
        recipeErrors.push(`Recipe ${i + 1}: Missing or empty directions array`);
      } else {
        recipe.directions.forEach((dir: any, idx: number) => {
          if (!dir.instruction || typeof dir.instruction !== "string") {
            recipeErrors.push(
              `Recipe ${i + 1}, Direction ${idx + 1}: Missing or invalid instruction`,
            );
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

  async getRecipeStatistics(): Promise<RecipeStatistics> {
    const totalRecipes = await this.recipeRepository.getTotalRecipeCount();
    const tagStatistics = await this.getTagStatistics();

    return {
      totalRecipes,
      tagStatistics,
    };
  }

  async getTagStatistics(): Promise<TagStatistic[]> {
    const allTags = await this.tagRepository.readAll();

    // Use Promise.all to properly await all async operations
    const tagStatistics = await Promise.all(
      allTags.map(async (tag) => {
        const recipeCount = await this.recipeTagRepository.getRecipeCountForTag(
          tag.id,
        );
        return {
          name: tag.name,
          count: recipeCount,
        };
      }),
    );

    return tagStatistics.sort((a, b) => b.count - a.count); // Sort by count descending
  }

  async getTotalRecipeCount(): Promise<number> {
    return await this.recipeRepository.getTotalRecipeCount();
  }

  async getMostPopularTags(limit: number = 10): Promise<TagStatistic[]> {
    const tagStatistics = await this.getTagStatistics();
    return tagStatistics.slice(0, limit);
  }
}
