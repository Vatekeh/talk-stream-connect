
import { Sparkles, ArrowDownToDot } from "lucide-react";
import { PricingSection } from "@/components/blocks/pricing-section";
import { useAuth } from "@/contexts/AuthContext";

const pricingTiers = [
  {
    name: "Free",
    price: {
      monthly: 0,
      yearly: 0,
    },
    description: "For anyone getting started with Clutsh",
    icon: (
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-zinc-400/30 to-zinc-400/30 blur-2xl rounded-full" />
        <Sparkles className="w-7 h-7 relative z-10 text-zinc-500 dark:text-zinc-400" />
      </div>
    ),
    features: [
      {
        name: "Room Access",
        description: "Join support rooms and public houses",
        included: true,
      },
      {
        name: "Basic Activity Log",
        description: "See your recent logins and time online",
        included: true,
      },
      {
        name: "Community Challenges",
        description: "Participate in public streak challenges",
        included: true,
      },
      {
        name: "Advanced Analytics",
        description: "In-depth visual tracking and streak patterns",
        included: false,
      },
    ],
  },
  {
    name: "Clutsh Pro",
    price: {
      monthly: 19.99,
      yearly: 180,
    },
    description: "Unlock advanced analytics and full control",
    highlight: true,
    badge: "Unlock Clarity",
    icon: (
      <div className="relative">
        <ArrowDownToDot className="w-7 h-7 relative z-10" />
      </div>
    ),
    features: [
      {
        name: "Everything in Free",
        description: "All basic access and features",
        included: true,
      },
      {
        name: "Analytics Dashboard",
        description: "Full access to your streak trends, relapses, triggers, and growth insights",
        included: true,
      },
      {
        name: "Export Reports",
        description: "Download CSVs of your activity log and summaries",
        included: true,
      },
      {
        name: "Early Access to Features",
        description: "Be the first to try new tools and updates",
        included: true,
      },
    ],
  },
];

export default function PricingPage() {
  const { isSubscribed } = useAuth();

  return (
    <div className="bg-clutsh-navy min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center text-clutsh-light mb-8">
          Subscription Plans
        </h1>
        
        <PricingSection tiers={pricingTiers} />
        
        {isSubscribed && (
          <div className="mt-8 p-4 bg-clutsh-steel/20 border border-clutsh-slate/50 rounded-lg text-center">
            <p className="text-clutsh-light">
              You are currently on the <strong>Pro</strong> plan. Thank you for your support!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
