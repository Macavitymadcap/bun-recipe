import { Alert, AlertProps } from "../Alert";
import { MainContentRecipe } from "../MainContentRecipe";
import { CompleteRecipe } from "../../database/services/recipe-service";

export interface UpdateRecipeResponseProps {
  alert: AlertProps;
  recipe: CompleteRecipe;
}

export const UpdateRecipeResponse = ({
  alert,
  recipe,
}: UpdateRecipeResponseProps) => {
  const alertHtml = Alert(alert);
  const recipeHtml = MainContentRecipe(recipe);

  return `
    <div hx-swap-oob="beforeend:#alerts">
      ${alertHtml}
    </div>
    ${recipeHtml}
  `;
};
