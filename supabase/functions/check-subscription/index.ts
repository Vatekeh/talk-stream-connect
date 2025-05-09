
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Helper logging function for debugging
const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CHECK-SUBSCRIPTION] ${step}${detailsStr}`);
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    // Initialize Supabase client with service role key to bypass RLS
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );
    logStep("Supabase client initialized");

    // Verify authentication
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user) throw new Error("User not authenticated");
    logStep("User authenticated", { userId: user.id });

    // Get user profile from database
    const { data: profile, error: profileError } = await supabaseClient
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();
      
    if (profileError) throw new Error(`Error fetching profile: ${profileError.message}`);
    logStep("User profile fetched", { profileId: profile.id });

    // If user doesn't have a stripe_customer_id, they don't have a subscription
    if (!profile.stripe_customer_id) {
      logStep("User has no Stripe customer ID");
      return new Response(
        JSON.stringify({
          subscription_status: "none",
          is_subscribed: false,
          is_trialing: false,
          trial_end: null,
          current_period_end: null
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    // If the user has a stripe_customer_id, check their subscription in Stripe
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");
    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    logStep("Stripe initialized, fetching subscription");

    // If user has a subscription ID, fetch it from Stripe
    let subscriptionData = null;
    if (profile.stripe_subscription_id) {
      try {
        const subscription = await stripe.subscriptions.retrieve(profile.stripe_subscription_id);
        logStep("Subscription retrieved from Stripe", { 
          status: subscription.status,
          trial_end: subscription.trial_end
        });
        
        // Update subscription data
        subscriptionData = {
          subscription_status: subscription.status,
          trial_end: subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : null,
          current_period_end: subscription.current_period_end ? 
            new Date(subscription.current_period_end * 1000).toISOString() : null
        };

        // Update the database with the latest subscription status
        const { error: updateError } = await supabaseClient
          .from("profiles")
          .update(subscriptionData)
          .eq("id", user.id);

        if (updateError) {
          logStep("Error updating profile", { error: updateError.message });
        } else {
          logStep("Profile updated with latest subscription data");
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        logStep("Error retrieving subscription", { error: errorMessage });
        
        // If the subscription doesn't exist in Stripe, update our DB
        if (errorMessage.includes("No such subscription")) {
          const { error: updateError } = await supabaseClient
            .from("profiles")
            .update({
              subscription_status: "canceled",
              stripe_subscription_id: null
            })
            .eq("id", user.id);
            
          if (updateError) {
            logStep("Error updating profile after failed subscription lookup", { error: updateError.message });
          } else {
            logStep("Profile updated to canceled status");
          }
          
          subscriptionData = {
            subscription_status: "canceled",
            trial_end: null,
            current_period_end: null
          };
        }
      }
    }

    // Determine subscription state based on data
    const status = subscriptionData?.subscription_status || profile.subscription_status || "none";
    const isSubscribed = ["active", "trialing"].includes(status);
    const isTrialing = status === "trialing";
    
    // Return subscription status
    return new Response(
      JSON.stringify({
        subscription_status: status,
        is_subscribed: isSubscribed,
        is_trialing: isTrialing,
        trial_end: subscriptionData?.trial_end || profile.trial_end,
        current_period_end: subscriptionData?.current_period_end || profile.current_period_end
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`[CHECK-SUBSCRIPTION] Error: ${errorMessage}`);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
    );
  }
});
