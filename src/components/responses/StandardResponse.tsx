import { type AlertProps, Alert } from "../Alert";
import { DefaultContent } from "../DefaultContent";
import { RecipeStatistics } from "../../database/services/recipe-service";

interface StandardResponseProps {
  alert?: AlertProps;
  statistics: RecipeStatistics;
}

export const StandardResponse = ({
  alert,
  statistics,
}: StandardResponseProps) => {
  const alertHtml = alert ? Alert(alert) : "";

  return `
    <div hx-swap-oob="beforeend:#alerts">
      ${alertHtml}
    </div>
    ${DefaultContent({ statistics })}
  `;
};