
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

/**
 * Create a new subscription for the user (now handled by StripeCheckoutModal)
 * This function is kept for compatibility but the main flow now uses the modal
 */
export const createSubscription = async (userId?: string) => {
  if (!userId) {
    toast.error("User not authenticated");
    return;
  }

  try {
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData?.session?.access_token) {
      toast.error("No authenticated session found");
      return;
    }

    console.log("Creating subscription for user:", userId);
    const { data, error } = await supabase.functions.invoke('create-subscription', {
      headers: {
        Authorization: `Bearer ${sessionData.session.access_token}`,
      },
      body: JSON.stringify({})
    });

    if (error) {
      console.error("Error creating subscription:", error);
      toast.error(`Failed to create subscription: ${error.message}`);
      return;
    }

    if (data?.error) {
      console.error("Subscription creation error:", data.error);
      toast.error(`Subscription error: ${data.error}`);
      return;
    }

    if (data?.success) {
      // For direct subscription creation, we get a client secret back
      if (data.clientSecret) {
        toast.info("Subscription created! Please complete payment to activate.");
        return data;
      } else {
        toast.success("Subscription created successfully! Your 30-day trial has started.");
        return data;
      }
    }

    console.error("Unexpected response:", data);
    toast.error("Unexpected response from subscription service");
  } catch (error) {
    console.error("Error creating subscription:", error);
    toast.error("Failed to create subscription. Please try again.");
  }
};

/**
 * Open the Stripe billing portal for subscription management
 */
export const manageSubscription = async (userId?: string) => {
  if (!userId) {
    toast.error("User not authenticated");
    return;
  }

  try {
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData?.session?.access_token) {
      toast.error("No authenticated session found");
      return;
    }

    console.log("Opening billing portal for user:", userId);
    const { data, error } = await supabase.functions.invoke('billing-portal', {
      headers: {
        Authorization: `Bearer ${sessionData.session.access_token}`,
      }
    });

    if (error) {
      console.error("Error accessing billing portal:", error);
      toast.error(`Failed to open billing portal: ${error.message}`);
      return;
    }

    if (data?.error) {
      console.error("Billing portal error:", data.error);
      toast.error(`Billing portal error: ${data.error}`);
      return;
    }

    if (data?.url) {
      // Open billing portal in new tab
      window.open(data.url, '_blank');
      return;
    }

    console.error("No URL received from billing portal:", data);
    toast.error("Failed to get billing portal URL");
  } catch (error) {
    console.error("Error opening billing portal:", error);
    toast.error("Failed to open billing portal. Please try again.");
  }
};

/**
 * Check the current subscription status
 */
export const checkSubscriptionStatus = async (userId: string) => {
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData?.session?.access_token) {
      console.error("No authenticated session found");
      return null;
    }

    console.log("Checking subscription status for user:", userId);
    const { data, error } = await supabase.functions.invoke('check-subscription', {
      headers: {
        Authorization: `Bearer ${sessionData.session.access_token}`,
      }
    });

    if (error) {
      console.error("Error checking subscription:", error);
      return null;
    }

    if (data?.error) {
      console.error("Subscription check error:", data.error);
      return null;
    }

    console.log("Subscription status data:", data);
    return data;
  } catch (error) {
    console.error("Error checking subscription status:", error);
    return null;
  }
};
