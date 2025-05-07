
import { serve } from "https://deno.land/std@0.192.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Set up CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders,
      status: 204,
    });
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 405,
    });
  }

  try {
    // Create Supabase client with auth context from the request
    const supabaseUrl = Deno.env.get("SUPABASE_URL") as string;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") as string;
    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: req.headers.get('Authorization')! } },
      auth: { persistSession: false },
    });

    // Get the current authenticated user
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();

    // Return error if not authenticated
    if (authError || !user) {
      console.error("Authentication error:", authError);
      return new Response(JSON.stringify({ error: 'Unauthorized request' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401,
      });
    }

    // Get the request body
    const { userId } = await req.json();

    if (!userId) {
      return new Response(JSON.stringify({ error: 'userId is required' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    console.log(`Getting room status for user ${userId}`);

    // Check if there's an active support room for this user
    const { data: roomData, error: roomError } = await supabaseClient
      .from('rooms')
      .select('id, name, is_active')
      .eq('creator_id', userId)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    let roomId = null;
    let roomName = "Support Room";
    let roomUrl = null;
    let isReady = false;
    let activePeers = 0;

    // If there's no active room, we'll create data for a potential room but mark it as not ready
    if (roomError || !roomData) {
      console.log('No active room found, checking available peers');
      
      // Count available peers (users who could potentially join)
      const { count: peerCount, error: countError } = await supabaseClient
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('is_moderator', true);
      
      if (!countError && peerCount && peerCount > 0) {
        activePeers = peerCount;
        roomUrl = `https://clutch.live/room/${userId}`;
        isReady = true; // There are moderators ready to help
      }
    } else {
      // We have an existing room, let's get peer count
      roomId = roomData.id;
      roomName = roomData.name;
      roomUrl = `https://clutch.live/room/${roomData.id}`;
      
      // Count participants in the room
      const { count: participantCount, error: participantError } = await supabaseClient
        .from('room_participants')
        .select('*', { count: 'exact', head: true })
        .eq('room_id', roomId);
      
      if (!participantError) {
        // Subtract 1 to exclude the room creator
        activePeers = Math.max(0, (participantCount || 0) - 1); 
        isReady = true; // Room exists and is active
      }
    }

    return new Response(
      JSON.stringify({
        activePeers,
        roomUrl,
        roomId,
        roomName,
        isReady
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error in get-room-status:", error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
