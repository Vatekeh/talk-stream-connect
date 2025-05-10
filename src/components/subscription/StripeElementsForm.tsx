
import React, { useState, useEffect } from "react";
import { PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/contexts/auth";

interface StripeElementsFormProps {
  onSuccess: () => void;
}

export function StripeElementsForm({ onSuccess }: StripeElementsFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const { checkSubscriptionStatus } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [succeeded, setSucceeded] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      // Confirm the payment
      const { error: stripeError } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: window.location.origin + "/profile", // Fallback if client-side processing fails
        },
        redirect: 'if_required', // Only redirect when 3D Secure is required
      });

      if (stripeError) {
        setMessage(stripeError.message || "An unexpected error occurred");
        return;
      }
      
      // Payment successful, now create subscription in our backend
      toast.loading("Finalizing your subscription...");
      
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error("Session expired, please log in again");
      }
      
      // Call our create-subscription function
      const { data, error } = await supabase.functions.invoke('create-subscription', {
        body: {},
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });
      
      if (error) throw new Error(error.message);
      if (!data.success) throw new Error(data.error || "Failed to create subscription");
      
      toast.dismiss();
      toast.success("Your subscription has been activated!");
      
      // Update subscription status in context
      await checkSubscriptionStatus();
      
      setSucceeded(true);
      setTimeout(() => {
        onSuccess();
      }, 1500); // Short delay to show success message
      
    } catch (error: any) {
      console.error("Payment error:", error);
      toast.dismiss();
      toast.error(error.message || "Failed to process payment");
      setMessage(error.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (succeeded) {
    return (
      <div className="flex flex-col items-center justify-center py-8 space-y-4 text-clutsh-light">
        <CheckCircle className="h-12 w-12 text-green-500 animate-scale-in" />
        <p>Payment successful!</p>
        <p className="text-sm text-clutsh-muted">Redirecting...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Payment Element Container */}
      <div className="bg-clutsh-steel/10 rounded-md p-3 border border-clutsh-slate/30">
        <PaymentElement />
      </div>
      
      {/* Error message */}
      {message && (
        <div className="text-red-400 text-sm p-2 bg-red-900/20 border border-red-800/30 rounded-md">
          {message}
        </div>
      )}
      
      {/* Terms and conditions */}
      <div className="text-xs text-clutsh-muted">
        By subscribing, you agree to our <a href="/terms" className="text-clutsh-light hover:underline">Terms of Service</a> and authorize Clutsh to charge your card until you cancel.
      </div>
      
      {/* Submit button */}
      <Button 
        type="submit" 
        disabled={!stripe || loading} 
        className="w-full bg-clutsh-purple hover:bg-clutsh-purple/80 text-white"
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : "Subscribe Now"}
      </Button>
    </form>
  );
}
