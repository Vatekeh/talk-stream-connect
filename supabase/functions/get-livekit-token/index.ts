
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { AccessToken } from "https://esm.sh/livekit-server-sdk@1.2.7";

const LIVEKIT_API_KEY = Deno.env.get('LIVEKIT_API_KEY') || '';
const LIVEKIT_API_SECRET = Deno.env.get('LIVEKIT_API_SECRET') || '';

// Define proper CORS headers for all responses
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Max-Age': '86400',
  'Content-Type': 'application/json'
};

serve(async (req) => {
  // Always handle CORS preflight requests FIRST
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  try {
    // Ensure secrets are configured (but always send CORS headers!)
    if (!LIVEKIT_API_KEY || !LIVEKIT_API_SECRET) {
      return new Response(
        JSON.stringify({ error: 'LiveKit API key or secret not configured' }),
        { status: 500, headers: corsHeaders }
      );
    }

    const { room, userId, name } = await req.json();

    if (!room || !userId) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters: room and userId' }),
        { status: 400, headers: corsHeaders }
      );
    }

    // Create a new token for the user
    const token = new AccessToken(LIVEKIT_API_KEY, LIVEKIT_API_SECRET, {
      identity: userId,
      name: name || userId,
    });

    // Grant permissions
    token.addGrant({
      roomJoin: true,
      room,
      canPublish: true,
      canSubscribe: true,
      canPublishData: true,
    });

    // Return the JWT
    return new Response(
      JSON.stringify({ token: token.toJwt() }),
      { status: 200, headers: corsHeaders }
    );
  } catch (error) {
    // Always include CORS headers on error for client debugging
    console.error('Error generating LiveKit token:', error);
    return new Response(
      JSON.stringify({ error: `Failed to generate token: ${error && error.message ? error.message : error}` }),
      { status: 500, headers: corsHeaders }
    );
  }
});
