
import { cn } from "@/lib/utils";

interface PricingToggleProps {
  isYearly: boolean;
  setIsYearly: (isYearly: boolean) => void;
}

export function PricingToggle({ isYearly, setIsYearly }: PricingToggleProps) {
  return (
    <div className="inline-flex items-center p-1.5 bg-clutsh-steel dark:bg-zinc-800/50 rounded-full border border-clutsh-slate/30 dark:border-zinc-700 shadow-sm">
      {["Monthly", "Yearly"].map((period) => (
        <button
          key={period}
          onClick={() => setIsYearly(period === "Yearly")}
          className={cn(
            "px-8 py-2.5 text-sm font-medium rounded-full transition-all duration-300",
            (period === "Yearly") === isYearly
              ? "bg-clutsh-slate dark:bg-clutsh-light text-white dark:text-clutsh-navy shadow-lg"
              : "text-clutsh-light hover:text-white"
          )}
        >
          {period}
        </button>
      ))}
    </div>
  );
}
