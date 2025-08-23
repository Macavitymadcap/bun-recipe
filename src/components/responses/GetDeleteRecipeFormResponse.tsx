import { Alert, type AlertProps } from "../Alert";
import {
  DeleteRecipeForm,
  type DeleteRecipeFormProps,
} from "../forms/DeleteRecipeForm";

interface GetDeleteRecipeFormResponseProps {
  alert?: AlertProps;
  form?: DeleteRecipeFormProps;
}

export const GetDeleteRecipeFormResponse = ({
  alert,
  form,
}: GetDeleteRecipeFormResponseProps) => {
  const alertHtml = alert ? Alert(alert) : "";
  const formHtml = form ? DeleteRecipeForm(form) : "";
  return `
    <div hx-swap-oob="beforeend:#alerts">
      ${alertHtml}
    </div>
    ${formHtml}
  `;
};

export type { GetDeleteRecipeFormResponseProps };
