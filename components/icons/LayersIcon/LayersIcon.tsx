import { baseIconProps, type IconProps } from "../iconProps";

export function LayersIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...baseIconProps} {...props}>
      <path d="m12 3 9 4.7-9 4.7-9-4.7L12 3Z" />
      <path d="m4.8 11.4-1.8 1 9 4.7 9-4.7-1.8-1M4.8 16.1l-1.8 1 9 4.7 9-4.7-1.8-1" />
    </svg>
  );
}
