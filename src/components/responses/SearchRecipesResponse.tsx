import { Alert, AlertProps } from "../Alert";
import { DefaultContent } from "../DefaultContent";
import { ReadRecipe, ReadRecipeProps } from "../RecipeCard";

interface SearchRecipesResponseProps {
  alert: AlertProps;
  recipes: ReadRecipeProps[];
}

export const SearchRecipesResponse = ({
  alert,
  recipes,
}: SearchRecipesResponseProps) => {
  return `<div hx-swap-oob="beforeend:#alerts">
          ${Alert(alert)}
        </div>
        ${recipes.length > 0 ? recipes.map((recipe) => ReadRecipe(recipe)).join("") : DefaultContent()}`;
};
