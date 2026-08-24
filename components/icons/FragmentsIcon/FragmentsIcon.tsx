import { baseIconProps, type IconProps } from "../iconProps";

export function FragmentsIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...baseIconProps} {...props}>
      <path d="m5.2 4.2 4.3 1.1-2 4.2-3.3-1.2 1-4.1ZM14.6 3.5l4.2 2.2-3.3 3.4-2.8-2.7 1.9-2.9ZM10.8 11l4.7-.9 1.2 4.4-4.8 1.7-1.1-5.2ZM4.6 14.3l4.1-1.9 1.1 4.4-3.5 2.4-1.7-4.9ZM17.1 17.1l3 .8-1 3.1-3.6-1.4 1.6-2.5Z" />
    </svg>
  );
}
