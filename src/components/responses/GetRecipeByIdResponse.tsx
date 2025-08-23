import { Alert, AlertProps } from "../Alert";
import { ReadRecipe } from "../ReadRecipe";

export const GetRecipeByIDResponse = ({
  alert,
  recipe,
}: {
  alert?: AlertProps;
  recipe?: any;
}) => {
  const alertHtml = alert ? Alert(alert) : "";
  const recipeHtml = recipe ? ReadRecipe(recipe) : "";

  return `
    <div hx-swap-oob="beforeend:#alerts">
      ${alertHtml}
    </div>
    ${recipeHtml}
  `;
};
