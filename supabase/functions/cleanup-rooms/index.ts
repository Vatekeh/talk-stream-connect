
// Follow this pattern to use Supabase client in Edge Functions
// This function cleans up "zombie" rooms - rooms that are still marked active but have no participants
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Create a Supabase client with the Auth context of the function
    const supabaseClient = createClient(
      // Supabase API URL - env var exported by default when deployed.
      Deno.env.get('SUPABASE_URL') ?? '',
      // Supabase API ANON KEY - env var exported by default when deployed.
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      // Create client with Auth context of the user that called the function.
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    // Clean up any rooms marked as active but having no participants
    const { data: rooms, error: roomsError } = await supabaseClient
      .from('rooms')
      .select('id')
      .eq('is_active', true)

    if (roomsError) {
      console.error('Error fetching active rooms:', roomsError)
      throw roomsError
    }

    // No active rooms to check
    if (!rooms || rooms.length === 0) {
      return new Response(
        JSON.stringify({ success: true, message: 'No active rooms to check' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const roomIds = rooms.map(room => room.id)
    
    // For each active room, check if it has participants
    const { data: roomsWithParticipants, error: participantsError } = await supabaseClient
      .from('room_participants')
      .select('room_id, count(*)')
      .in('room_id', roomIds)
      .group('room_id')

    if (participantsError) {
      console.error('Error checking room participants:', participantsError)
      throw participantsError
    }

    // Create a set of roomIds with participants
    const roomsWithParticipantsSet = new Set(
      roomsWithParticipants.map(room => room.room_id)
    )

    // Find rooms without participants - active but empty "zombie" rooms
    const emptyRoomIds = roomIds.filter(id => !roomsWithParticipantsSet.has(id))

    // Mark empty rooms as inactive
    if (emptyRoomIds.length > 0) {
      const { error: updateError } = await supabaseClient
        .from('rooms')
        .update({ is_active: false })
        .in('id', emptyRoomIds)

      if (updateError) {
        console.error('Error updating empty rooms:', updateError)
        throw updateError
      }

      console.log(`Marked ${emptyRoomIds.length} empty rooms as inactive`)
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Cleanup complete. Checked ${roomIds.length} active rooms, marked ${emptyRoomIds.length} empty rooms as inactive.` 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error in cleanup function:', error)
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
