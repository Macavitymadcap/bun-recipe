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

  getAllItems(): ShoppingListItemEntity[] {
    return this.shoppingListRepository.readAll();
  }

  addItem(itemText: string): ShoppingListItemEntity | null {
    const trimmedItem = itemText.trim();
    if (!trimmedItem) return null;

    return this.shoppingListRepository.addOrUpdateItem(trimmedItem);
  }

  updateItem(id: number, newText: string): ShoppingListItemEntity | null {
    const item = this.shoppingListRepository.read(id);
    if (!item) return null;

    const trimmedText = newText.trim();
    if (!trimmedText) return null;

    return this.shoppingListRepository.update({
      ...item,
      item: trimmedText,
    });
  }

  toggleItem(id: number): ShoppingListItemEntity | null {
    return this.shoppingListRepository.toggleChecked(id);
  }

  deleteItem(id: number): boolean {
    return this.shoppingListRepository.delete(id);
  }

  clearCheckedItems(): boolean {
    return this.shoppingListRepository.clearCheckedItems();
  }

  clearAllItems(): boolean {
    return this.dbContext.transaction(() => {
      const allItems = this.shoppingListRepository.readAll();
      let success = true;
      
      for (const item of allItems) {
        if (!this.shoppingListRepository.delete(item.id)) {
          success = false;
        }
      }
      
      return success;
    });
  }

  addRecipeIngredientsToList(recipeId: number): number {
    return this.dbContext.transaction(() => {
      const ingredients = this.ingredientRepository.readByRecipeId(recipeId);
      let addedCount = 0;

      for (const ingredient of ingredients) {
        const itemText = this.formatIngredientAsItem(ingredient);
        const addedItem = this.shoppingListRepository.addOrUpdateItem(itemText);
        
        if (addedItem) {
          addedCount++;
        }
      }

      return addedCount;
    });
  }

  getStats(): ShoppingListStats {
    const items = this.shoppingListRepository.readAll();
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