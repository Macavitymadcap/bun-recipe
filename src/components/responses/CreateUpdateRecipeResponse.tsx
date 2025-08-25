import { type AlertProps, Alert } from "../Alert";
import { DefaultContent } from "../DefaultContent";
interface CreateUpdateRecipeResponseProps {
  alert?: AlertProps;
}

export const CreateUpdateRecipeResponse = ({
  alert,
}: CreateUpdateRecipeResponseProps) => {
  const alertHtml = alert ? Alert(alert) : "";

  return `
    <div hx-swap-oob="beforeend:#alerts">
      ${alertHtml}
    </div>
    ${DefaultContent()}
  `;
};
