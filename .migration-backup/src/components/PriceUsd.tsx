import { usePpp } from "@/hooks/usePpp";
import { cn } from "@/lib/utils";

interface PriceUsdProps {
  usd: number;
  className?: string;
  showList?: boolean;   // strike-through the list price when PPP-discounted
  suffix?: string;      // e.g. " / one-time" or "/mo"
  prefix?: string;      // e.g. "+" or "$"
}

/**
 * Renders a single USD price adjusted for the visitor's selected PPP country.
 * List price is shown struck-through when a discount applies. Stripe
 * card-country enforcement at checkout is the source of truth — this is
 * display-only.
 */
const PriceUsd = ({ usd, className, showList = true, suffix, prefix = "$" }: PriceUsdProps) => {
  const { adjust, factor } = usePpp();
  const adjusted = adjust(usd);
  const discounted = factor < 1 && adjusted !== usd;
  return (
    <span className={cn("inline-flex items-baseline gap-2", className)}>
      <span>
        {prefix}
        {adjusted}
        {suffix && <span className="text-sm text-muted-foreground font-sans font-normal">{suffix}</span>}
      </span>
      {discounted && showList && (
        <span className="text-xs font-body font-normal text-muted-foreground line-through">
          ${usd}
        </span>
      )}
    </span>
  );
};

export default PriceUsd;