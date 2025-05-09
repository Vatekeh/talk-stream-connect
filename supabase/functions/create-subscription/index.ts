
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
  console.log(`[CREATE-SUBSCRIPTION] ${step}${detailsStr}`);
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    // Initialize Stripe with the secret key
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");
    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    logStep("Stripe initialized");

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

    // If user has an active subscription, return it
    if (profile.subscription_status === "active" || profile.subscription_status === "trialing") {
      logStep("User already has an active subscription", { status: profile.subscription_status });
      return new Response(
        JSON.stringify({
          success: true,
          message: "Subscription already active",
          subscription: {
            status: profile.subscription_status,
            trial_end: profile.trial_end,
            current_period_end: profile.current_period_end
          }
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    // Create or retrieve a Stripe customer
    let customerId = profile.stripe_customer_id;
    if (!customerId) {
      logStep("Creating new Stripe customer");
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          userId: user.id
        }
      });
      customerId = customer.id;
      logStep("Stripe customer created", { customerId });
    } else {
      logStep("Using existing Stripe customer", { customerId });
    }

    // Create a subscription with a 30-day trial
    logStep("Creating subscription with 30-day trial");
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [
        { price: 'price_1RMsRa2eLXgO7GQNGrcT0Cv6' }, // Replace with your actual price ID
      ],
      trial_period_days: 30,
      metadata: {
        userId: user.id
      }
    });
    logStep("Subscription created", { subscriptionId: subscription.id });

    // Calculate trial end date and current period end
    const trialEnd = subscription.trial_end 
      ? new Date(subscription.trial_end * 1000).toISOString() 
      : null;
    
    const currentPeriodEnd = subscription.current_period_end 
      ? new Date(subscription.current_period_end * 1000).toISOString() 
      : null;

    // Update user profile with subscription information
    logStep("Updating user profile with subscription data");
    const { error: updateError } = await supabaseClient
      .from("profiles")
      .update({
        stripe_customer_id: customerId,
        stripe_subscription_id: subscription.id,
        subscription_status: subscription.status,
        trial_end: trialEnd,
        current_period_end: currentPeriodEnd
      })
      .eq("id", user.id);

    if (updateError) throw new Error(`Error updating profile: ${updateError.message}`);
    logStep("User profile updated with subscription data");

    // Return success response with subscription details
    return new Response(
      JSON.stringify({
        success: true,
        message: "Subscription created successfully",
        subscription: {
          id: subscription.id,
          status: subscription.status,
          trial_end: trialEnd,
          current_period_end: currentPeriodEnd,
        }
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`[CREATE-SUBSCRIPTION] Error: ${errorMessage}`);
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
    );
  }
});
