
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
    if (!stripeKey) {
      const error = "STRIPE_SECRET_KEY is not set in environment variables";
      logStep("ERROR", { error });
      return new Response(
        JSON.stringify({ error }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }
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
    if (!authHeader) {
      const error = "No authorization header provided";
      logStep("ERROR", { error });
      return new Response(
        JSON.stringify({ error }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 401 }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) {
      const error = `Authentication error: ${userError.message}`;
      logStep("ERROR", { error });
      return new Response(
        JSON.stringify({ error }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 401 }
      );
    }

    const user = userData.user;
    if (!user?.email) {
      const error = "User not authenticated or email not available";
      logStep("ERROR", { error });
      return new Response(
        JSON.stringify({ error }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 401 }
      );
    }
    logStep("User authenticated", { userId: user.id, email: user.email });

    // Get user profile from database
    const { data: profile, error: profileError } = await supabaseClient
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();
      
    if (profileError) {
      const error = `Error fetching profile: ${profileError.message}`;
      logStep("ERROR", { error });
      return new Response(
        JSON.stringify({ error }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }
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

    // Parse request body for price_id
    let requestBody;
    try {
      requestBody = await req.json();
    } catch (parseError) {
      logStep("No request body provided, using default price");
      requestBody = {};
    }

    // PLACEHOLDER: Replace this with your actual Stripe price ID from your dashboard
    // To get this: Go to Stripe Dashboard → Products → Create a $19.99/month product → Copy the price ID
    const priceId = requestBody.price_id || 'REPLACE_WITH_YOUR_REAL_STRIPE_PRICE_ID';
    
    if (priceId === 'REPLACE_WITH_YOUR_REAL_STRIPE_PRICE_ID') {
      const error = "Please replace the placeholder price_id with your actual Stripe price ID";
      logStep("ERROR", { error });
      return new Response(
        JSON.stringify({ error }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }
    logStep("Using price ID", { priceId });

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

      // Update profile with customer ID
      const { error: updateError } = await supabaseClient
        .from("profiles")
        .update({ stripe_customer_id: customerId })
        .eq("id", user.id);

      if (updateError) {
        logStep("Warning: Could not update profile with customer ID", { error: updateError.message });
      }
    } else {
      logStep("Using existing Stripe customer", { customerId });
    }

    // Create a subscription with incomplete payment behavior to get client_secret
    logStep("Creating subscription with incomplete payment behavior");
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      payment_behavior: 'default_incomplete',
      payment_settings: { save_default_payment_method: 'on_subscription' },
      expand: ['latest_invoice.payment_intent'],
      trial_period_days: 30,
      metadata: {
        userId: user.id
      }
    });
    logStep("Subscription created", { subscriptionId: subscription.id });

    // Get the client secret from the payment intent
    const clientSecret = subscription.latest_invoice?.payment_intent?.client_secret;
    if (!clientSecret) {
      const error = "No client secret found in subscription payment intent";
      logStep("ERROR", { error });
      return new Response(
        JSON.stringify({ error }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

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

    if (updateError) {
      const error = `Error updating profile: ${updateError.message}`;
      logStep("ERROR", { error });
      return new Response(
        JSON.stringify({ error }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }
    logStep("User profile updated with subscription data");

    // Return success response with client secret for payment confirmation
    return new Response(
      JSON.stringify({
        success: true,
        clientSecret: clientSecret,
        subscriptionId: subscription.id,
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
    logStep("ERROR in create-subscription", { error: errorMessage, stack: error.stack });
    return new Response(
      JSON.stringify({ error: `Subscription creation failed: ${errorMessage}` }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
