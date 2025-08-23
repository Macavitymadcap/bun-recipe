interface MinimiseIconProps {
  width?: number;
  height?: number;
}

export const MinimiseIcon = ({ width, height }: MinimiseIconProps) => {
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
      <path d="M4 14h6m-6 0v6m0-6L10 20M20 10h-6m6 0V4m0 6L14 4"></path>
    </svg>
  );
};