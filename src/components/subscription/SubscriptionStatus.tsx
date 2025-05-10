
import { useAuth } from "@/contexts/auth";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { ShieldCheck, AlertTriangle, Clock, CreditCard } from "lucide-react";
import { useState } from "react";
import { StripeCheckoutModal } from "./StripeCheckoutModal";

export const SubscriptionStatus = () => {
  const { 
    isSubscribed, 
    isTrialing, 
    subscriptionStatus, 
    trialEnd, 
    currentPeriodEnd,
    createSubscription,
    manageSubscription
  } = useAuth();
  
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  
  const getStatusDetails = () => {
    if (isTrialing && trialEnd) {
      const timeLeft = formatDistanceToNow(new Date(trialEnd), { addSuffix: true });
      return {
        icon: <Clock className="h-5 w-5 text-amber-500" />,
        title: "Free Trial",
        description: `Your trial ends ${timeLeft}`,
        color: "text-amber-500",
        buttonText: "Manage Subscription",
        buttonAction: manageSubscription
      };
    }
    
    if (isSubscribed) {
      return {
        icon: <ShieldCheck className="h-5 w-5 text-green-500" />,
        title: "Active Subscription",
        description: currentPeriodEnd ? 
          `Next billing date: ${new Date(currentPeriodEnd).toLocaleDateString()}` : 
          "Your subscription is active",
        color: "text-green-500",
        buttonText: "Manage Subscription",
        buttonAction: manageSubscription
      };
    }
    
    if (subscriptionStatus === "past_due") {
      return {
        icon: <AlertTriangle className="h-5 w-5 text-red-500" />,
        title: "Payment Failed",
        description: "Your payment method needs attention",
        color: "text-red-500",
        buttonText: "Update Payment",
        buttonAction: manageSubscription
      };
    }
    
    // No subscription
    return {
      icon: <Clock className="h-5 w-5 text-clutsh-light" />,
      title: "No Subscription",
      description: "Unlock premium features with Clutsh Pro",
      color: "text-clutsh-light",
      buttonText: "Subscribe Now",
      buttonAction: () => setIsCheckoutOpen(true)
    };
  };
  
  const statusDetails = getStatusDetails();
  
  return (
    <>
      <div className="rounded-lg border border-clutsh-slate p-4 bg-clutsh-navy">
        <div className="flex items-start space-x-3">
          <div className="mt-0.5">{statusDetails.icon}</div>
          <div className="flex-1">
            <h3 className={`font-medium ${statusDetails.color}`}>
              {statusDetails.title}
            </h3>
            <p className="text-sm text-clutsh-light mt-1">
              {statusDetails.description}
            </p>
            <div className="flex space-x-2 mt-3">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={statusDetails.buttonAction}
                className="bg-clutsh-slate text-clutsh-light hover:bg-clutsh-steel"
              >
                {statusDetails.buttonText}
              </Button>
              
              {!isSubscribed && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.location.href = '/pricing'}
                  className="bg-transparent border-clutsh-slate text-clutsh-light hover:bg-clutsh-steel/20"
                >
                  View Plans
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Stripe Checkout Modal */}
      <StripeCheckoutModal 
        open={isCheckoutOpen} 
        onOpenChange={setIsCheckoutOpen} 
      />
    </>
  );
};
