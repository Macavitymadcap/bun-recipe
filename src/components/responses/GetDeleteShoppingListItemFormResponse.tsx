import { Alert, type AlertProps } from "../Alert";
import {
  DeleteShoppingListItemForm,
  type DeleteShoppingListItemFormProps,
} from "../forms/DeleteShoppingListItemForm";

export interface GetDeleteShoppingListItemFormResponseProps {
  alert?: AlertProps;
  form?: DeleteShoppingListItemFormProps;
}

export const GetDeleteShoppingListItemFormResponse = ({
  alert,
  form,
}: GetDeleteShoppingListItemFormResponseProps) => {
  const alertHtml = alert ? Alert(alert) : "";
  const formHtml = form ? DeleteShoppingListItemForm(form) : "";
  return `
    <div hx-swap-oob="beforeend:#alerts">
      ${alertHtml}
    </div>
    ${formHtml}
  `;
};
