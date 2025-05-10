
import { cn } from "@/lib/utils";
import { CheckIcon } from "lucide-react";
import { Feature } from "./types";

interface FeatureItemProps {
  feature: Feature;
}

export function FeatureItem({ feature }: FeatureItemProps) {
  return (
    <div className="flex gap-4">
      <div
        className={cn(
          "mt-1 p-0.5 rounded-full transition-colors duration-200",
          feature.included
            ? "text-emerald-400 dark:text-emerald-300"
            : "text-zinc-500 dark:text-zinc-600"
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
  );
}
