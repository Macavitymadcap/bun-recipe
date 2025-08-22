import { Alert, AlertProps } from "./Alert";
import { ReadRecipe, type ReadRecipeProps } from "./ReadRecipe";

export interface CreateRecipeResponseProps {
  alert: AlertProps;
  recipe?: ReadRecipeProps
}

export const CreateRecipeResponse = ({ alert, recipe }: CreateRecipeResponseProps) => {
  const alertHtml = Alert(alert);
  const recipeHtml = recipe ? ReadRecipe(recipe) : "";

  return (
    <>
      <div hx-swap-oob="beforeend:#alerts">
        {{alertHtml}}
      </div>
      {{recipeHtml}}
    </>
  );
};