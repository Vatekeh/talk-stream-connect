
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

// Helper logging function for debugging
const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[STRIPE-WEBHOOK] ${step}${detailsStr}`);
};

serve(async (req) => {
  try {
    logStep("Webhook received");
    
    // Initialize Stripe with the secret key
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");
    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    
    // Initialize Supabase client with service role key to bypass RLS
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Get the stripe signature from the headers
    const signature = req.headers.get("stripe-signature");
    if (!signature) {
      throw new Error("No stripe signature in request");
    }

    // Get the raw request body
    const body = await req.text();
    
    // Get the webhook secret
    const endpointSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    if (!endpointSecret) {
      throw new Error("STRIPE_WEBHOOK_SECRET is not set");
    }
    
    // Verify the event
    let event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, endpointSecret);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      logStep("Webhook signature verification failed", { error: errorMessage });
      return new Response(`Webhook Error: ${errorMessage}`, { status: 400 });
    }
    
    logStep("Webhook verified", { type: event.type });
    
    // Handle the event
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object, supabaseClient);
        break;
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object, supabaseClient);
        break;
      case 'invoice.paid':
        await handleInvoicePaid(event.data.object, supabaseClient);
        break;
      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object, supabaseClient);
        break;
      default:
        logStep(`Unhandled event type: ${event.type}`);
    }
    
    // Return a 200 response to acknowledge receipt of the event
    return new Response(JSON.stringify({ received: true }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("Error processing webhook", { error: errorMessage });
    return new Response(`Webhook Error: ${errorMessage}`, { status: 400 });
  }
});

async function handleSubscriptionUpdated(subscription: any, supabase: any) {
  logStep("Handling subscription update", { 
    id: subscription.id, 
    status: subscription.status 
  });
  
  try {
    // Get the customer ID from the subscription
    const customerId = subscription.customer;
    
    // Get the user ID from the metadata
    let userId = subscription.metadata?.userId;
    
    // If no userId in metadata, find the profile with this customer ID
    if (!userId) {
      const { data, error } = await supabase
        .from("profiles")
        .select("id")
        .eq("stripe_customer_id", customerId)
        .single();
        
      if (error) {
        throw new Error(`Error finding user for customer ${customerId}: ${error.message}`);
      }
      
      if (data) {
        userId = data.id;
      } else {
        throw new Error(`No user found for customer ${customerId}`);
      }
    }
    
    logStep("Found user for subscription", { userId });
    
    // Update the user's subscription information
    const { error } = await supabase
      .from("profiles")
      .update({
        stripe_subscription_id: subscription.id,
        subscription_status: subscription.status,
        trial_end: subscription.trial_end ? 
          new Date(subscription.trial_end * 1000).toISOString() : null,
        current_period_end: subscription.current_period_end ? 
          new Date(subscription.current_period_end * 1000).toISOString() : null
      })
      .eq("id", userId);
      
    if (error) {
      throw new Error(`Error updating user ${userId}: ${error.message}`);
    }
    
    logStep("Successfully updated user subscription info", { userId });
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("Error handling subscription update", { error: errorMessage });
    throw error;
  }
}

async function handleSubscriptionDeleted(subscription: any, supabase: any) {
  logStep("Handling subscription deletion", { id: subscription.id });
  
  try {
    // Get the customer ID from the subscription
    const customerId = subscription.customer;
    
    // Find the profile with this customer ID
    const { data, error } = await supabase
      .from("profiles")
      .select("id")
      .eq("stripe_customer_id", customerId)
      .single();
      
    if (error) {
      throw new Error(`Error finding user for customer ${customerId}: ${error.message}`);
    }
    
    if (!data) {
      throw new Error(`No user found for customer ${customerId}`);
    }
    
    // Update the user's subscription information
    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        subscription_status: "canceled",
        trial_end: null,
        current_period_end: null
      })
      .eq("id", data.id);
      
    if (updateError) {
      throw new Error(`Error updating user ${data.id}: ${updateError.message}`);
    }
    
    logStep("Successfully marked subscription as canceled", { userId: data.id });
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("Error handling subscription deletion", { error: errorMessage });
    throw error;
  }
}

async function handleInvoicePaid(invoice: any, supabase: any) {
  logStep("Handling invoice payment", { id: invoice.id });
  
  try {
    // Get the customer ID from the invoice
    const customerId = invoice.customer;
    
    // Only process if this is for a subscription
    if (invoice.subscription) {
      // Find the profile with this customer ID
      const { data, error } = await supabase
        .from("profiles")
        .select("id")
        .eq("stripe_customer_id", customerId)
        .single();
        
      if (error) {
        throw new Error(`Error finding user for customer ${customerId}: ${error.message}`);
      }
      
      if (!data) {
        throw new Error(`No user found for customer ${customerId}`);
      }
      
      // Update the user's subscription status to active
      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          subscription_status: "active"
        })
        .eq("id", data.id);
        
      if (updateError) {
        throw new Error(`Error updating user ${data.id}: ${updateError.message}`);
      }
      
      logStep("Successfully updated subscription to active", { userId: data.id });
    }
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("Error handling invoice payment", { error: errorMessage });
    throw error;
  }
}

async function handleInvoicePaymentFailed(invoice: any, supabase: any) {
  logStep("Handling invoice payment failure", { id: invoice.id });
  
  try {
    // Get the customer ID from the invoice
    const customerId = invoice.customer;
    
    // Only process if this is for a subscription
    if (invoice.subscription) {
      // Find the profile with this customer ID
      const { data, error } = await supabase
        .from("profiles")
        .select("id")
        .eq("stripe_customer_id", customerId)
        .single();
        
      if (error) {
        throw new Error(`Error finding user for customer ${customerId}: ${error.message}`);
      }
      
      if (!data) {
        throw new Error(`No user found for customer ${customerId}`);
      }
      
      // Update the user's subscription status to past_due
      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          subscription_status: "past_due"
        })
        .eq("id", data.id);
        
      if (updateError) {
        throw new Error(`Error updating user ${data.id}: ${updateError.message}`);
      }
      
      logStep("Updated subscription to past_due", { userId: data.id });
    }
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("Error handling invoice payment failure", { error: errorMessage });
    throw error;
  }
}
