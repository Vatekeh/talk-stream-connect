
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

/**
 * Create subscription function - creates a new subscription for the user
 * with a 30-day free trial
 */
export const createSubscription = async (userId: string | undefined) => {
  if (!userId) {
    toast.error("You must be logged in to subscribe");
    return;
  }
  
  try {
    toast.loading("Setting up your subscription...");
    
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error("No active session");
    
    const { data, error } = await supabase.functions.invoke('create-subscription', {
      body: {},
      headers: {
        Authorization: `Bearer ${session.access_token}`
      }
    });
    
    if (error) throw new Error(error.message);
    if (!data.success) throw new Error(data.error || "Failed to create subscription");
    
    toast.dismiss();
    toast.success("Your 30-day free trial has been activated!");
    
    return data;
  } catch (error: any) {
    toast.dismiss();
    toast.error(error.message);
    console.error("Error creating subscription:", error);
    return null;
  }
};

/**
 * Manage subscription function - redirects the user to the Stripe billing portal
 */
export const manageSubscription = async (userId: string | undefined) => {
  if (!userId) {
    toast.error("You must be logged in to manage your subscription");
    return;
  }
  
  try {
    toast.loading("Preparing billing portal...");
    
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error("No active session");
    
    const { data, error } = await supabase.functions.invoke('billing-portal', {
      body: {},
      headers: {
        Authorization: `Bearer ${session.access_token}`
      }
    });
    
    if (error) throw new Error(error.message);
    if (!data.url) throw new Error("Failed to create billing portal session");
    
    toast.dismiss();
    
    // Redirect to Stripe billing portal
    window.location.href = data.url;
  } catch (error: any) {
    toast.dismiss();
    toast.error(error.message);
    console.error("Error managing subscription:", error);
  }
};

/**
 * Check subscription status - fetches current subscription data from the server
 */
export const checkSubscriptionStatus = async (userId: string | undefined) => {
  if (!userId) return null;
  
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return null;
    
    const { data, error } = await supabase.functions.invoke('check-subscription', {
      body: {},
      headers: {
        Authorization: `Bearer ${session.access_token}`
      }
    });
    
    if (error) {
      console.error("Error checking subscription:", error);
      return null;
    }
    
    console.log("Subscription checked:", data);
    return data;
  } catch (error) {
    console.error("Error checking subscription status:", error);
    return null;
  }
};
