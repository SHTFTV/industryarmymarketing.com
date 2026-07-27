import { cn } from "@/lib/utils";

type Size = "sm" | "md" | "lg" | "xl";

interface EyeSpyLogoProps {
  size?: Size;
  showMagnifier?: boolean;
  className?: string;
  ariaLabel?: string;
}

// Brand green for EyeSpy® — matches the reference badge and the floater rail.
// Green / white / green with a superscript ® and an optional magnifying-glass icon.
const SIZES: Record<Size, { text: string; icon: number; gap: string }> = {
  sm: { text: "text-xl md:text-2xl", icon: 18, gap: "gap-1.5" },
  md: { text: "text-3xl md:text-4xl", icon: 26, gap: "gap-2" },
  lg: { text: "text-5xl md:text-6xl", icon: 40, gap: "gap-3" },
  xl: { text: "text-6xl md:text-7xl", icon: 52, gap: "gap-4" },
};

const EyeSpyLogo = ({
  size = "md",
  showMagnifier = true,
  className,
  ariaLabel = "EyeSpy registered trademark",
}: EyeSpyLogoProps) => {
  const s = SIZES[size];
  return (
    <span
      role="img"
      aria-label={ariaLabel}
      className={cn("inline-flex items-center", s.gap, className)}
    >
      <span
        className={cn(
          "font-black italic tracking-tight leading-none",
          s.text,
        )}
        aria-hidden="true"
      >
        <span style={{ color: "#7bd44a" }}>Eye</span>
        <span className="text-foreground">Spy</span>
        <sup
          className="align-super not-italic font-bold"
          style={{ color: "#7bd44a", fontSize: "0.45em", marginLeft: "0.05em" }}
        >
          ®
        </sup>
      </span>
      {showMagnifier && (
        <svg
          width={s.icon}
          height={s.icon}
          viewBox="0 0 24 24"
          fill="none"
          stroke="#7bd44a"
          strokeWidth={2.4}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          className="shrink-0"
        >
          <circle cx="10.5" cy="10.5" r="6.5" />
          <line x1="15.2" y1="15.2" x2="21" y2="21" />
        </svg>
      )}
    </span>
  );
};

export default EyeSpyLogo;