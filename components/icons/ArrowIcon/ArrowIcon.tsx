import { baseIconProps, type IconProps } from "../iconProps";

export function ArrowIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...baseIconProps} {...props}>
      <path d="M5 12h14M14 7l5 5-5 5" />
    </svg>
  );
}
