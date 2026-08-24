import type { SVGProps } from "react";

export type IconProps = SVGProps<SVGSVGElement>;

export const baseIconProps = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};
