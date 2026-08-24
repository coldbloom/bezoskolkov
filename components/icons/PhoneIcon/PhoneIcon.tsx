import { baseIconProps, type IconProps } from "../iconProps";

export function PhoneIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...baseIconProps} {...props}>
      <path d="M7.4 3.7 10 8 8.1 9.8c1 2.3 2.8 4.1 5.1 5.1L15 13l4.3 2.6-.8 4c-.2.8-.9 1.4-1.8 1.4C9.1 20.6 3.4 14.9 3 7.3c0-.9.6-1.6 1.4-1.8l3-.8Z" />
    </svg>
  );
}
