interface ShoppingListIconProps {
  width?: number;
  height?: number;
}

export const ShoppingListIcon = ({ width, height }: ShoppingListIconProps) => {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      width={width ?? 24}
      height={height ?? 24}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 7h14l-1 8H6l-1-8z"></path>
      <path d="M5 7L3 1H1"></path>
      <circle cx="9" cy="20" r="1"></circle>
      <circle cx="17" cy="20" r="1"></circle>
    </svg>
  );
};
