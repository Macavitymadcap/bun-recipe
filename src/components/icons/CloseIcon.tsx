interface CloseIconProps {
  width?: number;
  height?: number;
}

export const CloseIcon = ({ width, height }: CloseIconProps) => {
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
      <path d="M6 18L18 6"></path>
      <path d="M6 6l12 12"></path>
    </svg>
  );
};
