import { CreateRecipeData } from "../database/services/recipe-service";

export class RecipeFormService {
  recipeData: CreateRecipeData;
  isValid: boolean;

  constructor(formData: FormData) {
    this.recipeData = this.parseRecipeFormData(formData);
    this.isValid = this.formDataIsValid(this.recipeData)
  }

  private parseRecipeFormData(formData: FormData): CreateRecipeData {

    const { name, servings, calories_per_serving, preparation_time, cooking_time } = this.parseBasic(formData);
    const ingredients = this.parseIngredients(formData);
    const directions = this.parseDirections(formData);
    const cooksNotes = this.parseCooksNotes(formData);
    const tags = this.parseTags(formData);
    const data: CreateRecipeData = {
      name,
      servings,
      calories_per_serving,
      preparation_time,
      cooking_time,
      ingredients,
      directions,
      cooksNotes: cooksNotes.length > 0 ? cooksNotes : undefined,
      tags,
    };

    return data;
  }

  private parseBasic(formData: FormData) {
    const name = formData.get("name") as string;
    const servings = formData.get("servings") as string;
    const calories_per_serving = formData.get("calories_per_serving")
      ? parseInt(formData.get("calories_per_serving") as string)
      : undefined;
    const preparation_time =
      (formData.get("preparation_time") as string) || undefined;
    const cooking_time = (formData.get("cooking_time") as string) || undefined;

    return { name, servings, calories_per_serving, preparation_time, cooking_time };
  }

  private parseIngredients(formData: FormData) {
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

    return ingredients;
  }

  private parseDirections(formData: FormData) {
    const directions: Array<{ instruction: string }> = [];
    let directionIndex = 0;

    while (formData.has(`directions[${directionIndex}][instruction]`)) {
      const instruction = formData.get(
        `directions[${directionIndex}][instruction]`,
      ) as string;

      if (instruction?.trim()) {
        directions.push({ instruction: instruction.trim() });
      }
      directionIndex++;
    }

    return directions;
  }

  private parseCooksNotes(formData: FormData) {
    const cooksNotes: string[] = [];
    let noteIndex = 0;

    while (formData.has(`cooksNotes[${noteIndex}][note]`)) {
      const note = formData.get(`cooksNotes[${noteIndex}][note]`) as string;

      if (note?.trim()) {
        cooksNotes.push(note.trim());
      }
      noteIndex++;
    }

    return cooksNotes;
  }

  private parseTags(formData: FormData) {
    const tagsString = formData.get("tags") as string;
    const tags = tagsString
      ? tagsString
          .split(",")
          .map((tag) => tag.trim())
          .filter((tag) => tag.length > 0)
      : undefined;
    
      return tags;
  }

  private formDataIsValid(formData: CreateRecipeData): boolean {
    const hasName = formData.name !== null && formData.name !== undefined && formData.name !== "";
    const hasServings = formData.servings !== null && formData.servings !== undefined && formData.servings !== "";
    const hasAtLeastOneIngredient = formData.ingredients.length > 0;
    const hasAtLeastOneDirection = formData.directions.length > 0;
    
    return  hasName && hasServings && hasAtLeastOneDirection && hasAtLeastOneIngredient;
  }
}