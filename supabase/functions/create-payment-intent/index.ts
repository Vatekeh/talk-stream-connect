
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
  console.log(`[CREATE-PAYMENT-INTENT] ${step}${detailsStr}`);
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

    // Parse request body
    let requestBody;
    try {
      requestBody = await req.json();
    } catch (parseError) {
      const error = "Invalid JSON in request body";
      logStep("ERROR", { error, parseError: parseError.message });
      return new Response(
        JSON.stringify({ error }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    const { amount, currency = "usd" } = requestBody;
    
    if (!amount || typeof amount !== 'number' || amount <= 0) {
      const error = "Valid amount in cents is required";
      logStep("ERROR", { error, receivedAmount: amount });
      return new Response(
        JSON.stringify({ error }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }
    logStep("Request validated", { amount, currency });

    // Get or create Stripe customer
    let customer;
    const existingCustomers = await stripe.customers.list({
      email: user.email,
      limit: 1
    });

    if (existingCustomers.data.length > 0) {
      customer = existingCustomers.data[0];
      logStep("Found existing customer", { customerId: customer.id });
    } else {
      customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          userId: user.id
        }
      });
      logStep("Created new customer", { customerId: customer.id });

      // Update profile with customer ID
      const { error: updateError } = await supabaseClient
        .from("profiles")
        .update({ stripe_customer_id: customer.id })
        .eq("id", user.id);

      if (updateError) {
        logStep("Warning: Could not update profile with customer ID", { error: updateError.message });
      } else {
        logStep("Updated profile with customer ID");
      }
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      customer: customer.id,
      setup_future_usage: 'off_session',
      metadata: {
        userId: user.id
      }
    });
    logStep("Payment intent created", { paymentIntentId: paymentIntent.id });

    return new Response(
      JSON.stringify({ 
        client_secret: paymentIntent.client_secret,
        payment_intent_id: paymentIntent.id
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in create-payment-intent", { error: errorMessage, stack: error.stack });
    return new Response(
      JSON.stringify({ error: `Payment intent creation failed: ${errorMessage}` }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
