type SearchType = "name" | "tag" | "ingredient";

interface SearchRecipesData {
  searchType?: SearchType
  recipeName?: string;
  recipeTag?: string;
  recipeIngredient?: string;
}

export class SearchFormService {
  searchType: SearchType;
  recipeName: string;
  recipeTag: string;
  recipeIngredient: string;

  constructor(formData: FormData) {
    const data = this.parseFormData(formData);
    this.searchType = data.searchType;
    this.recipeName = data.recipeName;
    this.recipeTag = data.recipeTag;
    this.recipeIngredient = data.recipeIngredient;
  }

  private parseFormData(formData: FormData) {
    const searchType = formData.get("searchType") as SearchType;
    const recipeName = formData.get("recipeName") as string;
    const recipeTag = formData.get("recipeTag") as string;
    const recipeIngredient = formData.get("recipeIngredient") as string;

    return {searchType, recipeName, recipeTag, recipeIngredient};
  }

  get isNameSearch() {
    return this.searchType === "name" && this.recipeName.trim().length !== 0;
  }

  get isTagSearch() {
    return this.searchType === "tag" && this.recipeTag.trim().length !== 0;
  }

  get isIngredientSearch() {
    return this.searchType === "ingredient" && this.recipeIngredient.trim().length !== 0;
  }
}