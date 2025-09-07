import { Alert, AlertProps } from "../Alert";
import { ShoppingList, type ShoppingListProps } from "../ShoppingList";
import { ReadRecipe, ReadRecipeProps } from "../RecipeCard";

interface SearchRecipesResponseProps {
  alert: AlertProps;
  recipes: ReadRecipeProps[];
  shoppingList: ShoppingListProps;
}

export const SearchRecipesResponse = ({
  alert,
  recipes,
  shoppingList,
}: SearchRecipesResponseProps) => {
  return `<div hx-swap-oob="beforeend:#alerts">
          ${Alert(alert)}
        </div>
        ${recipes.length > 0 ? recipes.map((recipe) => ReadRecipe(recipe)).join("") : ShoppingList(shoppingList)}`;
};
