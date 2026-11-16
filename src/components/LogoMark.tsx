// The JK Aspirant mark: a bold "A" whose top is a fountain-pen nib, with the
// nib's breather hole in chinar red. Source of truth for every logo file.
export const LOGO_A_PATH =
  "M48.2 8 L12 90 L30 90 L38 70 L62 70 L70 90 L88 90 L51.8 8 L51.8 41.5 L66 56 L59.5 60 L40.5 60 L34 56 L48.2 41.5 Z";
export const LOGO_NAVY = "#0F1E36";
export const LOGO_RED = "#C0392B";

/** Inline mark. The "A" follows the text colour, so it flips with dark mode. */
export function LogoMark({ className = "", title }: { className?: string; title?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} role={title ? "img" : undefined} aria-hidden={title ? undefined : true}>
      {title && <title>{title}</title>}
      <path d={LOGO_A_PATH} fill="currentColor" />
      <circle cx="50" cy="43" r="6" fill={LOGO_RED} />
    </svg>
  );
}
