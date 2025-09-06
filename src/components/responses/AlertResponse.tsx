import { type AlertProps, Alert } from "../Alert";

interface AlertResponseProps {
  alert: AlertProps;
}

export const AlertResponse = ({
  alert
}: AlertResponseProps) => {
  const { alertType, title, message } = alert;

  return (
    <div hx-swap-oob="beforeend:#alerts">
      <Alert alertType={alertType} title={title} message={message}/>
    </div>

  )
};