
"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { PricingSectionProps } from "./types"
import { PricingToggle } from "./pricing-toggle"
import { PricingCard } from "./pricing-card"
import { usePricingActions } from "./use-pricing-actions"

function PricingSection({ tiers, className }: PricingSectionProps) {
  const [isYearly, setIsYearly] = useState(false)
  const { handlePricingAction, getButtonText } = usePricingActions()

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
          <PricingToggle isYearly={isYearly} setIsYearly={setIsYearly} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {tiers.map((tier) => (
            <PricingCard
              key={tier.name}
              tier={tier}
              isYearly={isYearly}
              handleAction={handlePricingAction}
              buttonText={getButtonText(tier)}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

export { PricingSection }
