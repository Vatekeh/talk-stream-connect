
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { StripeElementsForm } from "./StripeElementsForm";
import { useAuth } from "@/contexts/auth";
import { supabase } from "@/integrations/supabase/client";

// Initialize Stripe with the publishable key
const stripePromise = loadStripe("pk_test_51RMsRa2eLXgO7GQNGfjlsLK9FnzGNrhVuKPsWnjkswOf5YcPLsOLiuiCjo5CWBAddyynKjs8V480FhZhi7oWYUOP003goPRVuq");

interface StripeCheckoutModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  priceId?: string; // Allow passing a specific price ID
  initialClientSecret?: string | null; // Support pre-provided client secret
}

export function StripeCheckoutModal({ open, onOpenChange, onSuccess, priceId, initialClientSecret }: StripeCheckoutModalProps) {
  const [loading, setLoading] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [subscriptionId, setSubscriptionId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { user, checkSubscriptionStatus } = useAuth();

  // When the modal opens, create a subscription with incomplete payment
  React.useEffect(() => {
    if (open && !clientSecret && !loading) {
      setLoading(true);
      setError(null);

      // If we have a pre-provided client secret (e.g., via query param), use it directly
      if (initialClientSecret) {
        setClientSecret(initialClientSecret);
        setLoading(false);
        return;
      }
      
      const createSubscriptionIntent = async () => {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          
          if (!session) {
            throw new Error("You must be logged in to subscribe");
          }
          
          console.log("Creating subscription...", { priceId });
          
          const requestBody: any = { price_id: priceId ?? null };
          
          const { data, error } = await supabase.functions.invoke('create-subscription', {
            body: requestBody,
            headers: {
              Authorization: `Bearer ${session.access_token}`
            }
          });
          
          if (error) {
            console.error("Subscription creation error:", error);
            throw new Error(error.message);
          }
          
          if (!data?.success) {
            console.error("Invalid subscription response:", data);
            throw new Error(data?.error || "Failed to create subscription");
          }
          
          if (data.clientSecret) {
            console.log("Subscription ready, received clientSecret");
            setClientSecret(data.clientSecret);
            setSubscriptionId(data.subscriptionId ?? null);
          } else {
            console.log("Subscription already active; closing checkout.");
            onOpenChange(false);
            checkSubscriptionStatus?.().catch((e: any) => console.error("checkSubscriptionStatus error:", e));
            onSuccess?.();
          }
        } catch (err: any) {
          console.error("Error creating subscription:", err);
          setError(err.message || "Failed to initialize subscription");
        } finally {
          setLoading(false);
        }
      };
      
      createSubscriptionIntent();
    }
    
    // Keep clientSecret/subscriptionId across open/close to avoid duplicate subscriptions
  }, [open, clientSecret, loading, priceId, initialClientSecret]);

  // Reset modal state when closing to avoid stale clientSecret/loops
  React.useEffect(() => {
    if (!open) {
      setClientSecret(null);
      setSubscriptionId(null);
      setError(null);
      setLoading(false);
    }
  }, [open]);

  const handleSuccess = () => {
    // Refresh subscription status, then close
    checkSubscriptionStatus?.().catch((e: any) => console.error("checkSubscriptionStatus error:", e));
    onOpenChange(false);
    onSuccess?.();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-md bg-clutsh-navy border-clutsh-slate sm:rounded-xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-clutsh-light text-center">
            Upgrade to Clutsh Pro
          </DialogTitle>
        </DialogHeader>
        
        <div className="text-center mb-4">
          <p className="text-clutsh-light text-sm">
            Unlock premium analytics and advanced insights
          </p>
          <div className="mt-1 font-bold text-clutsh-light">
            $19.99<span className="text-sm font-normal text-clutsh-muted">/month</span>
          </div>
          <div className="text-xs text-clutsh-muted mt-1">
            30-day free trial included
          </div>
        </div>
          
        {error && (
          <div className="mb-4 p-3 bg-red-900/20 border border-red-800/30 rounded-md text-red-200 text-sm">
            {error}
          </div>
        )}
        
        {clientSecret ? (
          <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: 'night' } }}>
            <StripeElementsForm 
              onSuccess={handleSuccess} 
              subscriptionId={subscriptionId}
              clientSecret={clientSecret}
            />
          </Elements>
        ) : (
          <div className="py-8 flex items-center justify-center">
            <div className="animate-pulse text-clutsh-light">
              {loading ? "Creating subscription..." : "Initializing..."}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
