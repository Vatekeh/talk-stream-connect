
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { RtcTokenBuilder, RtcRole } from "npm:agora-access-token@2.0.4";

// Define CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Max-Age": "86400", // Cache preflight response for 1 day
};

serve(async (req: Request) => {
  // Handle CORS preflight request
  if (req.method === "OPTIONS") {
    console.log("Handling OPTIONS preflight request");
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
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
    
    // Convert role string to numeric value
    const roleValue = role.toLowerCase() === "publisher" ? RtcRole.PUBLISHER : RtcRole.SUBSCRIBER;
    
    // Calculate privilege expiration time
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const privilegeExpiredTs = currentTimestamp + Number(expiry);
    
    // Generate token using the RtcTokenBuilder
    const token = RtcTokenBuilder.buildTokenWithUid(
      appId,
      appCertificate,
      channel,
      uid,
      roleValue,
      privilegeExpiredTs
    );
    
    console.log(`Token generated for channel: ${channel}, uid: ${uid}`);
    
    // Return the token
    return new Response(
      JSON.stringify({ 
        token,
        channel,
        uid,
        role: roleValue === RtcRole.PUBLISHER ? "publisher" : "subscriber",
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
