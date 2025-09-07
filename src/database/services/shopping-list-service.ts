import { DbContext } from "../context/context";
import { IngredientEntity, IngredientRepository } from "../repositories/ingredient-repository";
import { ShoppingListItemEntity, ShoppingListRepository } from "../repositories/shopping-list-repository";

export interface ShoppingListStats {
  totalItems: number;
  checkedItems: number;
  uncheckedItems: number;
}

export class ShoppingListService {
  constructor(
    private shoppingListRepository: ShoppingListRepository,
    private ingredientRepository: IngredientRepository,
    private dbContext: DbContext,
  ) {}

  async read(id: number): Promise<ShoppingListItemEntity | null> {
    return await this.shoppingListRepository.read(id);
  }

  async getAllItems(): Promise<ShoppingListItemEntity[]> {
    return await this.shoppingListRepository.readAll();
  }

  async addItem(itemText: string): Promise<ShoppingListItemEntity | null> {
    const trimmedItem = itemText.trim();
    if (!trimmedItem) return null;

    return await this.shoppingListRepository.addOrUpdateItem(trimmedItem);
  }

  async updateItem(id: number, newText: string): Promise<ShoppingListItemEntity | null> {
    const item = await this.shoppingListRepository.read(id);
    if (!item) return null;

    const trimmedText = newText.trim();
    if (!trimmedText) return null;

    return await this.shoppingListRepository.update({
      ...item,
      item: trimmedText,
    });
  }

  async toggleItem(id: number): Promise<ShoppingListItemEntity | null> {
    return await this.shoppingListRepository.toggleChecked(id);
  }

  async deleteItem(id: number): Promise<boolean> {
    return await this.shoppingListRepository.delete(id);
  }

  async clearCheckedItems(): Promise<boolean> {
    return await this.shoppingListRepository.clearCheckedItems();
  }

  async clearAllItems(): Promise<boolean> {
    return await this.shoppingListRepository.deleteAll();
  }

  async addRecipeIngredientsToList(recipeId: number): Promise<number> {
    return await this.dbContext.transaction(async () => {
      const ingredients = await this.ingredientRepository.readByRecipeId(recipeId);
      let addedCount = 0;

      for (const ingredient of ingredients) {
        const itemText = this.formatIngredientAsItem(ingredient);
        const addedItem = await this.shoppingListRepository.addOrUpdateItem(itemText);
        
        if (addedItem) {
          addedCount++;
        }
      }

      return addedCount;
    });
  }

  async getStats(): Promise<ShoppingListStats> {
    const items = await this.shoppingListRepository.readAll();
    const totalItems = items.length;
    const checkedItems = items.filter(item => item.is_checked).length;
    const uncheckedItems = totalItems - checkedItems;

    return {
      totalItems,
      checkedItems,
      uncheckedItems,
    };
  }

  private formatIngredientAsItem(ingredient: IngredientEntity): string {
    const parts: string[] = [];
    
    if (ingredient.quantity) {
      parts.push(ingredient.quantity);
    }
    
    if (ingredient.unit) {
      parts.push(ingredient.unit);
    }
    
    parts.push(ingredient.name);
    
    return parts.join(" ");
  }
}