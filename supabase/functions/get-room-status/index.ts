
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Define CORS headers for browser requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Get the request data
  const { userId } = await req.json();
  
  if (!userId) {
    return new Response(
      JSON.stringify({ error: "User ID is required" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    // Initialize Supabase client with Deno runtime
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    );

    // Find the most appropriate support room
    // First check if there's a dedicated support room for this user
    const { data: dedicatedRooms, error: dedicatedError } = await supabaseClient
      .from('rooms')
      .select('*, room_participants(count)')
      .eq('is_support_room', true)
      .eq('dedicated_user_id', userId)
      .eq('is_active', true)
      .single();

    if (dedicatedError && dedicatedError.code !== 'PGRST116') {
      console.error("Error querying dedicated rooms:", dedicatedError);
    }

    // If dedicated room exists, return it
    if (dedicatedRooms) {
      return new Response(
        JSON.stringify({
          roomId: dedicatedRooms.id,
          roomName: dedicatedRooms.name,
          roomUrl: `https://ggbvhsuuwqwjghxpuapg.supabase.co/room/${dedicatedRooms.id}`,
          activePeers: dedicatedRooms.room_participants?.count || 0,
          isReady: true
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // If no dedicated room, find a general support room with available helpers
    const { data: generalRooms, error: generalError } = await supabaseClient
      .from('rooms')
      .select(`
        id, 
        name, 
        is_active,
        room_participants!inner(
          user_id,
          is_moderator,
          profiles:user_id(is_helper)
        )
      `)
      .eq('is_support_room', true)
      .eq('is_active', true)
      .eq('is_private', false)
      .order('created_at', { ascending: false });

    if (generalError) {
      throw generalError;
    }

    // Find rooms with helpers available
    const roomsWithHelpers = generalRooms.filter(room => 
      room.room_participants.some(p => 
        p.is_moderator || (p.profiles && p.profiles.is_helper)
      )
    );

    // Get the most active room with helpers
    const bestRoom = roomsWithHelpers.length > 0 
      ? roomsWithHelpers.reduce((prev, current) => 
          prev.room_participants.length > current.room_participants.length ? prev : current
        ) 
      : null;

    // If a suitable room was found
    if (bestRoom) {
      const helperCount = bestRoom.room_participants.filter(p => 
        p.is_moderator || (p.profiles && p.profiles.is_helper)
      ).length;

      return new Response(
        JSON.stringify({
          roomId: bestRoom.id,
          roomName: bestRoom.name,
          roomUrl: `https://ggbvhsuuwqwjghxpuapg.supabase.co/room/${bestRoom.id}`,
          activePeers: helperCount,
          isReady: helperCount > 0
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // If no suitable room found, return info that no rooms are available
    return new Response(
      JSON.stringify({
        roomId: null,
        roomName: null,
        roomUrl: null,
        activePeers: 0,
        isReady: false
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in get-room-status function:", error);
    return new Response(
      JSON.stringify({ error: "Internal Server Error", details: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
