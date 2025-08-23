import { type AlertProps, Alert } from "../Alert";
import { type ReadRecipeProps, ReadRecipe } from "../ReadRecipe";

interface UpdateRecipeResponseProps {
  alert?: AlertProps;
  recipe?: ReadRecipeProps;
}

export const UpdateRecipeResponse = ({
  alert,
  recipe,
}: UpdateRecipeResponseProps) => {
  const alertHtml = alert ? Alert(alert) : "";
  const recipeHtml = recipe ? ReadRecipe(recipe) : "";

  return `
    <div hx-swap-oob="beforeend:#alerts">
      ${alertHtml}
    </div>
    ${recipeHtml}
  `;
};
