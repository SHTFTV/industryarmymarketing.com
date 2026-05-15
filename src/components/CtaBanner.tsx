import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface CtaBannerProps {
  title: string;
  highlight?: string;
  description?: string;
  primaryLabel?: string;
  primaryTo?: string;
  secondaryLabel?: string;
  secondaryTo?: string;
}

const CtaBanner = ({
  title,
  highlight,
  description,
  primaryLabel = "Claim Your Territory",
  primaryTo = "/contact",
  secondaryLabel,
  secondaryTo,
}: CtaBannerProps) => (
  <section className="py-20 md:py-24 border-t border-border gradient-tactical">
    <div className="container mx-auto px-4 text-center max-w-3xl">
      <h2 className="font-display text-4xl md:text-6xl text-foreground leading-none">
        {title} {highlight && <span className="text-primary text-glow">{highlight}</span>}
      </h2>
      {description && (
        <p className="text-muted-foreground mt-5 text-lg leading-relaxed">{description}</p>
      )}
      <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
        <Button variant="hero" size="lg" asChild>
          <Link to={primaryTo}>{primaryLabel}</Link>
        </Button>
        {secondaryLabel && secondaryTo && (
          <Button variant="outline" size="lg" asChild>
            <Link to={secondaryTo}>{secondaryLabel}</Link>
          </Button>
        )}
      </div>
    </div>
  </section>
);

export default CtaBanner;