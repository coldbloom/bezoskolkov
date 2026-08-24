import { baseIconProps, type IconProps } from "../iconProps";

export function ShieldIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...baseIconProps} {...props}>
      <path d="M12 3 4.8 6v5.5c0 4.5 2.8 7.8 7.2 9.5 4.4-1.7 7.2-5 7.2-9.5V6L12 3Z" />
      <path d="m8.7 12 2.1 2.1 4.7-5" />
    </svg>
  );
}
