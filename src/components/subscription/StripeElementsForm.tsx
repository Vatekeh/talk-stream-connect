
import React, { useState } from "react";
import { PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/auth";

interface StripeElementsFormProps {
  onSuccess: () => void;
  subscriptionId?: string | null;
  clientSecret?: string | null;
  mode?: 'payment' | 'setup';
}

export function StripeElementsForm({ onSuccess, subscriptionId, clientSecret, mode }: StripeElementsFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const { checkSubscriptionStatus } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [succeeded, setSucceeded] = useState(false);
  const [isElementReady, setIsElementReady] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      console.log("Confirming Stripe action...", { mode });
      // Build a return URL that allows resuming the flow in case of 3DS redirect
      const currentUrl = new URL(window.location.href);
      const baseReturn = `${currentUrl.origin}/pricing`;
      const resumeUrl = clientSecret ? `${baseReturn}?client_secret=${encodeURIComponent(clientSecret)}` : baseReturn;

      // Ensure the Payment Element is mounted and validated before confirming
      const submitRes = await elements.submit();
      if (submitRes.error) {
        console.warn('Elements submit validation error', submitRes.error);
        setMessage(submitRes.error.message || "Please complete your payment details");
        return;
      }

      let stripeError: any | null = null;
      if (mode === 'setup') {
        const { error } = await stripe.confirmSetup({
          elements,
          confirmParams: { return_url: resumeUrl },
          redirect: 'if_required',
        });
        stripeError = error ?? null;
      } else {
        const { error } = await stripe.confirmPayment({
          elements,
          confirmParams: { return_url: resumeUrl },
          redirect: 'if_required',
        });
        stripeError = error ?? null;

        // Fallback: if mode is unknown and payment confirmation fails, try setup
        if (stripeError && !mode) {
          console.warn('Payment confirmation failed, attempting setup confirmation fallback...', stripeError);
          const { error: setupErr } = await stripe.confirmSetup({
            elements,
            confirmParams: { return_url: resumeUrl },
            redirect: 'if_required',
          });
          stripeError = setupErr ?? null;
        }
      }

      if (stripeError) {
        console.error("Stripe confirmation error:", stripeError);
        setMessage(stripeError.message || "An unexpected error occurred");
        return;
      }
      
      console.log("Stripe confirmation successful");
      toast.success("Your subscription has been activated!");
      
      // Update subscription status in context
      await checkSubscriptionStatus();
      
      setSucceeded(true);
      setTimeout(() => {
        onSuccess();
      }, 1500);
      
    } catch (error: any) {
      console.error("Stripe Elements submit error:", error);
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
        <p className="text-sm text-clutsh-muted">Your subscription is now active!</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Payment Element Container */}
      <div className="bg-clutsh-steel/10 rounded-md p-3 border border-clutsh-slate/30">
        <PaymentElement onReady={() => setIsElementReady(true)} options={{ layout: 'tabs' }} />
      </div>
      
      {/* Error message */}
      {message && (
        <div className="text-red-400 text-sm p-2 bg-red-900/20 border border-red-800/30 rounded-md">
          {message}
        </div>
      )}
      
      {/* Terms and conditions */}
      <div className="text-xs text-clutsh-muted">
        By subscribing, you agree to our <a href="/terms" className="text-clutsh-light hover:underline">Terms of Service</a> and authorize Clutsh to charge your card until you cancel. Your 30-day free trial starts immediately.
      </div>
      
      {/* Submit button */}
      <Button 
        type="submit" 
        disabled={!stripe || loading || !isElementReady} 
        className="w-full bg-clutsh-purple hover:bg-clutsh-purple/80 text-white"
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : "Start Free Trial"}
      </Button>
    </form>
  );
}
