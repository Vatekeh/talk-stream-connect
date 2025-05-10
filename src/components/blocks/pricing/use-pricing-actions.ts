
import { useAuth } from "@/contexts/auth";
import { useNavigate } from "react-router-dom";
import { PricingTier } from "./types";
import { useState } from "react";

export function usePricingActions() {
  const { isSubscribed, createSubscription, manageSubscription } = useAuth();
  const navigate = useNavigate();
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

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
      // Open the checkout modal for new subscriptions
      setIsCheckoutOpen(true);
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

  return {
    handlePricingAction,
    getButtonText,
    isCheckoutOpen,
    setIsCheckoutOpen
  };
}
