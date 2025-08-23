interface UpdateIconProps {
  width?: number;
  height?: number;
}

export const UpdateIcon = ({ height, width }: UpdateIconProps) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      width={width ?? 20}
      height={height ?? 20}
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M2 14.5V18h3.5l10.06-10.06-3.5-3.5L2 14.5zm14.85-7.35a1.003 1.003 0 0 0 0-1.42l-2.58-2.58a1.003 1.003 0 0 0-1.42 0l-1.34 1.34 3.5 3.5 1.34-1.34z" />
    </svg>
  );
};
