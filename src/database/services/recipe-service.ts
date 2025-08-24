import { DbContext } from "../context/context";
import { CooksNoteRepository } from "../repositories/cooks-note-repository";
import {
  IngredientEntity,
  IngredientRepository,
} from "../repositories/ingredient-repository";
import {
  MethodStepEntity,
  MethodStepRepository,
} from "../repositories/method-step-repository";
import {
  RecipeEntity,
  RecipeRepository,
} from "../repositories/recipe-repository";
import { RecipeTagRepository } from "../repositories/recipe-tag-repository";
import { TagRepository, TagEntity } from "../repositories/tag-repository";

interface RecipeConstiuents {
  ingredients: IngredientEntity[];
  methodSteps: MethodStepEntity[];
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
    quantity: number;
    unit?: string;
    name: string;
  }>;
  method: Array<{
    instruction: string;
  }>;
  cooksNotes?: string[];
  tags?: string[];
}

export class RecipeService {
  constructor(
    private recipeRepository: RecipeRepository,
    private ingredientRepository: IngredientRepository,
    private methodStepRepository: MethodStepRepository,
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

      // Add method steps
      data.method.forEach((step, index) => {
        this.methodStepRepository.create({
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
          const tag = this.tagRepository.createOrFind(tagName);
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
      this.methodStepRepository.deleteByRecipeId(id);
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

      // Recreate method steps
      data.method.forEach((step, index) => {
        this.methodStepRepository.create({
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
          const tag = this.tagRepository.createOrFind(tagName);
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
    const tag = this.tagRepository.findByName(tagName);
    if (!tag) return [];

    const recipeTags = this.recipeTagRepository.getByTagId(tag.id);
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

  getAllTags(): TagEntity[] {
    return this.tagRepository.readAll();
  }

  private getRecipeConstiuents(id: number): RecipeConstiuents {
    const ingredients = this.ingredientRepository.getByRecipeId(id);
    const methodSteps = this.methodStepRepository.getByRecipeId(id);
    const cooksNotes = this.cooksNoteRepository.getByRecipeId(id);

    // Get tags through the junction table
    const recipeTags = this.recipeTagRepository.getByRecipeId(id);
    const tags = recipeTags
      .map((rt) => this.tagRepository.read(rt.tag_id))
      .filter((tag) => tag !== null)
      .map((tag) => tag!.name);

    return {
      ingredients,
      methodSteps,
      cooksNotes: cooksNotes.map((n) => n.note),
      tags,
    };
  }
}
