import { Alert, AlertProps } from "../Alert";
import { MainContentRecipe } from "../MainContentRecipe";

export const GetRecipeByIDResponse = ({
  alert,
  recipe,
}: {
  alert?: AlertProps;
  recipe?: any;
}) => {
  const alertHtml = alert ? Alert(alert) : "";
  const recipeHtml = recipe ? MainContentRecipe(recipe) : "";

  return `
    <div hx-swap-oob="beforeend:#alerts">
      ${alertHtml}
    </div>
    ${recipeHtml}
  `;
};
