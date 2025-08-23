import { Alert, type AlertProps } from "../Alert";
import { UpdateRecipeForm } from "../forms/UpdateRecipeForm";
import { CompleteRecipe } from "../../database/services/recipe-service";
import { TagEntity } from "../../database/repositories/tag-repository";

interface GetUpdateRecipeFormResponseProps {
  alert?: AlertProps;
  recipe?: CompleteRecipe;
  availableTags: TagEntity[];
}

export const GetUpdateRecipeFormResponse = ({
  alert,
  recipe,
  availableTags,
}: GetUpdateRecipeFormResponseProps) => {
  const alertHtml = alert ? Alert(alert) : "";
  const formHtml = recipe ? UpdateRecipeForm({ recipe, availableTags }) : "";

  return `
    <div hx-swap-oob="beforeend:#alerts">
      ${alertHtml}
    </div>
    ${formHtml}
  `;
};
