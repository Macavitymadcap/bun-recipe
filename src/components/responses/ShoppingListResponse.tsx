import { ShoppingListItemEntity } from "../../database/repositories/shopping-list-repository";
import { ShoppingListStats } from "../../database/services/shopping-list-service";
import { Alert, AlertProps } from "../Alert";
import { ShoppingList } from "../ShoppingList";

interface ShoppingListResponseProps {
  alert: AlertProps;
  items: ShoppingListItemEntity[];
  stats: ShoppingListStats;
}

export const ShoppingListResponse = ({ alert, items, stats }: ShoppingListResponseProps) => {
  return (
    <>
      <div hx-swap-oob="beforeend:#alerts">
        <Alert alertType={alert.alertType} message={alert.message} title={alert.title} />
      </div>
      <div id="shopping-list-content">
        <ShoppingList items={items} stats={stats} />
      </div>
    </>
  )
}