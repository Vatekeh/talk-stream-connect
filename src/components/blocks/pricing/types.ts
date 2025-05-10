
export interface Feature {
  name: string;
  description: string;
  included: boolean;
}

export interface PricingTier {
  name: string;
  price: {
    monthly: number;
    yearly: number;
  };
  description: string;
  features: Feature[];
  highlight?: boolean;
  badge?: string;
  icon: React.ReactNode;
}

export interface PricingSectionProps {
  tiers: PricingTier[];
  className?: string;
}
