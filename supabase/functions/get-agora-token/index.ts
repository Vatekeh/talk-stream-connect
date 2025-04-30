
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.22.0";

// Define CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Max-Age": "86400", // Cache preflight response for 1 day
};

// Agora token generation function
function generateRtcToken(
  appId: string,
  appCertificate: string,
  channelName: string,
  uid: string,
  role: number,
  expirationTimeInSeconds: number
) {
  // Current timestamp in seconds
  const currentTimestamp = Math.floor(Date.now() / 1000);
  
  // Token expiration timestamp
  const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;
  
  // Build the token using simplified approach (Actual token building would use agora-access-token)
  // Note: This is a placeholder - in a production environment, you'd use agora-access-token
  const tokenData = {
    appId,
    appCertificate,
    channelName,
    uid,
    role,
    privilegeExpiredTs
  };
  
  // Create a base64 encoded token (in production, this would use proper token generation)
  // This is just for demonstration - not a real token
  const tokenString = JSON.stringify(tokenData);
  const encodedToken = btoa(tokenString);
  
  return encodedToken;
}

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === "OPTIONS") {
    console.log("Handling OPTIONS preflight request");
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    // Create Supabase client to access secrets
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );
    
    // Get Agora credentials from environment variables
    const appId = Deno.env.get("AGORA_APP_ID") || "";
    const appCertificate = Deno.env.get("AGORA_APP_CERTIFICATE") || "";
    
    if (!appId || !appCertificate) {
      throw new Error("Missing Agora credentials");
    }
    
    // Extract parameters from JSON body
    const { channel, uid, role = "publisher", expiry = 3600 } = await req.json();
    
    // Validate required parameters
    if (!channel || !uid) {
      throw new Error("Missing required parameters: channel and uid are required");
    }
    
    // Convert role string to numeric value (1 for publisher, 2 for subscriber)
    const roleValue = role.toLowerCase() === "publisher" ? 1 : 2;
    
    // Generate token
    const token = generateRtcToken(
      appId,
      appCertificate,
      channel,
      uid,
      roleValue,
      Number(expiry)
    );
    
    // Return the token
    return new Response(
      JSON.stringify({ 
        token,
        channel,
        uid,
        role: roleValue === 1 ? "publisher" : "subscriber",
        expiry: Number(expiry)
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error generating Agora token:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
