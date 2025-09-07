interface ConvertIconProps {
  width?: number;
  height?: number;
}
export const ConvertIcon = ({ width, height }: ConvertIconProps) => {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      width={width}
      height={height}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLineCap="round"
      strokeLineJoin="round"
    >
      <rect x="2" y="3" width="8" height="6" rx="1"></rect>
      <rect x="14" y="15" width="8" height="6" rx="1"></rect>
      <path d="m10 6 4 4-4 4"></path>
      <line x1="10" y1="10" x2="14" y2="10"></line>
    </svg>
  );
};
