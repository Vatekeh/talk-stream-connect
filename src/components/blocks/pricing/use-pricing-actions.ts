
import { useAuth } from "@/contexts/auth";
import { useNavigate } from "react-router-dom";
import { PricingTier } from "./types";
import { useEffect, useState } from "react";

export function usePricingActions() {
  const { isSubscribed, createSubscription, manageSubscription } = useAuth();
  const navigate = useNavigate();
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
const [selectedPriceId, setSelectedPriceId] = useState<string | undefined>();
const [initialClientSecret, setInitialClientSecret] = useState<string | undefined>();
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
      // Set the price ID for the selected tier (you may want to add this to your tier type)
      // For now, we'll use undefined to let the backend create the default price
      setSelectedPriceId(undefined);
      
      // Open the checkout modal for new subscriptions
      setIsCheckoutOpen(true);
    }
  };

  // Auto-open checkout if a client_secret is present in the URL (e.g., from extension)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const cs = params.get('client_secret');
    if (cs) {
      setInitialClientSecret(cs);
      setIsCheckoutOpen(true);
      // Clean the URL
      params.delete('client_secret');
      const newUrl = window.location.pathname + (params.toString() ? `?${params.toString()}` : '');
      window.history.replaceState({}, '', newUrl);
    }
  }, []);

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
    setIsCheckoutOpen,
    selectedPriceId,
    initialClientSecret,
  };
}
