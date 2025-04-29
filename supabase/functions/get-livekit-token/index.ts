
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { AccessToken } from "https://esm.sh/livekit-server-sdk@1.2.7";

const LIVEKIT_API_KEY = Deno.env.get('LIVEKIT_API_KEY') || '';
const LIVEKIT_API_SECRET = Deno.env.get('LIVEKIT_API_SECRET') || '';

// Define CORS headers allowing all origins during development
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Max-Age': '86400',
  'Content-Type': 'application/json'
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log("Handling OPTIONS preflight request");
    return new Response('ok', {
      headers: corsHeaders,
    });
  }

  try {
    console.log(`Processing ${req.method} request to get-livekit-token`);
    
    if (!LIVEKIT_API_KEY || !LIVEKIT_API_SECRET) {
      console.error("Missing LiveKit API credentials");
      return new Response(
        JSON.stringify({ error: 'LiveKit API key or secret not configured' }),
        { status: 500, headers: corsHeaders }
      );
    }

    const { room, userId, name } = await req.json();
    console.log(`Token requested for room: ${room}, user: ${userId}`);

    if (!room || !userId) {
      console.error("Missing required parameters");
      return new Response(
        JSON.stringify({ error: 'Missing required parameters: room and userId' }),
        { status: 400, headers: corsHeaders }
      );
    }

    const token = new AccessToken(LIVEKIT_API_KEY, LIVEKIT_API_SECRET, {
      identity: userId,
      name: name || userId,
    });

    token.addGrant({
      roomJoin: true,
      room,
      canPublish: true,
      canSubscribe: true,
      canPublishData: true,
    });

    const jwt = token.toJwt();
    console.log(`Token generated successfully for ${userId} in room ${room}`);

    return new Response(
      JSON.stringify({ token: jwt }),
      { 
        status: 200, 
        headers: corsHeaders 
      }
    );
  } catch (error) {
    console.error('Error generating LiveKit token:', error);
    return new Response(
      JSON.stringify({ error: `Failed to generate token: ${error && error.message ? error.message : error}` }),
      { status: 500, headers: corsHeaders }
    );
  }
});
