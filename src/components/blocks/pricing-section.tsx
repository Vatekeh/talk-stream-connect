
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/contexts/AuthContext"
import { useNavigate } from "react-router-dom"

interface Feature {
  name: string
  description: string
  included: boolean
}

interface PricingTier {
  name: string
  price: {
    monthly: number
    yearly: number
  }
  description: string
  features: Feature[]
  highlight?: boolean
  badge?: string
  icon: React.ReactNode
}

interface PricingSectionProps {
  tiers: PricingTier[]
  className?: string
}

function PricingSection({ tiers, className }: PricingSectionProps) {
  const [isYearly, setIsYearly] = useState(false)
  const { isSubscribed, createSubscription, manageSubscription } = useAuth()
  const navigate = useNavigate()

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
  }

  const badgeStyles = cn(
    "px-4 py-1.5 text-sm font-medium",
    "bg-clutsh-slate dark:bg-clutsh-light",
    "text-white dark:text-clutsh-navy",
    "border-none shadow-lg",
  )

  const handlePricingAction = (tier: PricingTier) => {
    if (tier.name === "Free") {
      // If they're on the free plan, redirect to home
      navigate("/");
      return;
    }

    // For the premium plan
    if (isSubscribed) {
      // If already subscribed, go to subscription management
      manageSubscription();
    } else {
      // Otherwise create a new subscription
      createSubscription();
    }
  };

  const getButtonText = (tier: PricingTier) => {
    if (tier.name === "Free") {
      return "Start your journey";
    }
    
    if (isSubscribed) {
      return "Manage subscription";
    }
    
    return "Unlock full insights";
  };

  return (
    <section
      className={cn(
        "relative bg-background text-foreground",
        "py-12 px-4 md:py-24 lg:py-32",
        "overflow-hidden",
        className,
      )}
    >
      <div className="w-full max-w-5xl mx-auto">
        <div className="flex flex-col items-center gap-4 mb-12">
          <h2 className="text-3xl font-bold text-clutsh-light">
            Simple, transparent pricing
          </h2>
          <div className="inline-flex items-center p-1.5 bg-clutsh-steel dark:bg-zinc-800/50 rounded-full border border-clutsh-slate/30 dark:border-zinc-700 shadow-sm">
            {["Monthly", "Yearly"].map((period) => (
              <button
                key={period}
                onClick={() => setIsYearly(period === "Yearly")}
                className={cn(
                  "px-8 py-2.5 text-sm font-medium rounded-full transition-all duration-300",
                  (period === "Yearly") === isYearly
                    ? "bg-clutsh-slate dark:bg-clutsh-light text-white dark:text-clutsh-navy shadow-lg"
                    : "text-clutsh-light hover:text-white",
                )}
              >
                {period}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {tiers.map((tier) => (
            <div
              key={tier.name}
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
                    <div key={feature.name} className="flex gap-4">
                      <div
                        className={cn(
                          "mt-1 p-0.5 rounded-full transition-colors duration-200",
                          feature.included
                            ? "text-emerald-400 dark:text-emerald-300"
                            : "text-zinc-500 dark:text-zinc-600",
                        )}
                      >
                        <CheckIcon className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-white">
                          {feature.name}
                        </div>
                        <div className="text-sm text-clutsh-light">
                          {feature.description}
                        </div>
                      </div>
                    </div>
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
                  onClick={() => handlePricingAction(tier)}
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {getButtonText(tier)}
                  </span>
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export { PricingSection }
