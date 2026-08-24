import { baseIconProps, type IconProps } from "../iconProps";

export function CheckIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...baseIconProps} {...props}>
      <path d="m5 12.5 4.2 4.2L19 7" />
    </svg>
  );
}
