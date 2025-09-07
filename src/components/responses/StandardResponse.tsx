import { type AlertProps, Alert } from "../Alert";
import { ShoppingList, ShoppingListProps } from "../ShoppingList";

interface StandardResponseProps {
  alert?: AlertProps;
  shoppingList: ShoppingListProps
}

export const StandardResponse = ({
  alert,
  shoppingList,
}: StandardResponseProps) => {
  const alertHtml = alert ? Alert(alert) : "";

  return `
    <div hx-swap-oob="beforeend:#alerts">
      ${alertHtml}
    </div>
    ${ShoppingList(shoppingList)}
  `;
};