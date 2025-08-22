type AlertType = "primary" | "secondary" | "success" | "warning" | "danger";

interface AlertProps {
  alertType: AlertType;
  title: string;
  message: string;
}

const Alert = ({ alertType: alertType, title, message }: AlertProps) => {
  const alertId = `alert-${Math.random().toString(36).substring(2, 15)}`;

  return (
    <div
      className={`alert alert-${alertType}`}
      role="alert"
      id={alertId}
      x-ref="alert"
      x-init={`setTimeout(() =>  $el.remove(), 5000)`}
      aria-live="assertive"
      x-data
    >
      <strong>{title}</strong> {message}
    </div>
  );
};

export { Alert, AlertProps };
