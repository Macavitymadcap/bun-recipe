import { type AlertProps, Alert } from "../Alert";
import { DefaultContent } from "../DefaultContent";

interface StandardResponseProps {
  alert?: AlertProps;
}

export const StandardResponse = ({
  alert,
}: StandardResponseProps) => {
  const alertHtml = alert ? Alert(alert) : "";

  return `
    <div hx-swap-oob="beforeend:#alerts">
      ${alertHtml}
    </div>
    ${DefaultContent()}
  `;
};
