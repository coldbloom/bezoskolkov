/* eslint-disable @next/next/no-img-element -- Reuse the exact local SVG used to generate the favicon. */
type BrandMarkProps = { className?: string; size?: number };

export function BrandMark({ className, size = 42 }: BrandMarkProps) {
  return <img className={className} src="/icon.svg" alt="" width={size} height={size} loading="eager" aria-hidden="true" />;
}
