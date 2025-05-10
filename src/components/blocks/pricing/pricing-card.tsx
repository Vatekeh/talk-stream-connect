
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { PricingTier } from "./types";
import { FeatureItem } from "./feature-item";

interface PricingCardProps {
  tier: PricingTier;
  isYearly: boolean;
  handleAction: (tier: PricingTier) => void;
  buttonText: string;
}

export function PricingCard({ 
  tier, 
  isYearly, 
  handleAction, 
  buttonText 
}: PricingCardProps) {
  const buttonStyles = {
    default: cn(
      "h-12 bg-clutsh-steel dark:bg-zinc-800",
      "hover:bg-clutsh-slate dark:hover:bg-zinc-700",
      "text-clutsh-light dark:text-zinc-100",
      "border border-clutsh-slate/30 dark:border-zinc-700",
      "hover:border-clutsh-slate/50 dark:hover:border-zinc-600",
      "shadow-sm hover:shadow-md",
      "text-sm font-medium",
    ),
    highlight: cn(
      "h-12 bg-clutsh-slate dark:bg-clutsh-light",
      "hover:bg-clutsh-steel/80 dark:hover:bg-clutsh-muted",
      "text-white dark:text-clutsh-navy",
      "shadow-[0_2px_15px_rgba(45,69,96,0.3)]",
      "hover:shadow-[0_2px_20px_rgba(45,69,96,0.4)]",
      "font-semibold text-base",
    ),
  };

  const badgeStyles = cn(
    "px-4 py-1.5 text-sm font-medium",
    "bg-clutsh-slate dark:bg-clutsh-light",
    "text-white dark:text-clutsh-navy",
    "border-none shadow-lg",
  );

  return (
    <div
      className={cn(
        "relative group backdrop-blur-sm",
        "rounded-3xl transition-all duration-300",
        "flex flex-col",
        tier.highlight
          ? "bg-gradient-to-b from-clutsh-slate/20 to-clutsh-navy/60 shadow-[0_5px_30px_rgba(45,69,96,0.2)]"
          : "bg-clutsh-steel dark:bg-clutsh-navy",
        "border",
        tier.highlight
          ? "border-clutsh-slate/30 dark:border-clutsh-light/20"
          : "border-clutsh-slate/20 dark:border-clutsh-slate/10",
        "hover:translate-y-0 hover:shadow-lg",
      )}
    >
      {tier.badge && tier.highlight && (
        <div className="absolute -top-4 left-6">
          <Badge className={badgeStyles}>{tier.badge}</Badge>
        </div>
      )}

      <div className="p-8 flex-1">
        <div className="flex items-center justify-between mb-4">
          <div
            className={cn(
              "p-3 rounded-xl",
              tier.highlight
                ? "bg-clutsh-slate/20 dark:bg-clutsh-light/10"
                : "bg-clutsh-navy/30 dark:bg-clutsh-navy/80",
            )}
          >
            {tier.icon}
          </div>
          <h3 className="text-xl font-semibold text-clutsh-light">
            {tier.name}
          </h3>
        </div>

        <div className="mb-6">
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold text-white">
              ${isYearly ? tier.price.yearly : tier.price.monthly}
            </span>
            <span className="text-sm text-clutsh-light">
              /{isYearly ? "year" : "month"}
            </span>
          </div>
          <p className="mt-2 text-sm text-clutsh-light">
            {tier.description}
          </p>
        </div>

        <div className="space-y-4">
          {tier.features.map((feature) => (
            <FeatureItem key={feature.name} feature={feature} />
          ))}
        </div>
      </div>

      <div className="p-8 pt-0 mt-auto">
        <Button
          className={cn(
            "w-full relative transition-all duration-300",
            tier.highlight
              ? buttonStyles.highlight
              : buttonStyles.default,
          )}
          onClick={() => handleAction(tier)}
        >
          <span className="relative z-10 flex items-center justify-center gap-2">
            {buttonText}
          </span>
        </Button>
      </div>
    </div>
  );
}
