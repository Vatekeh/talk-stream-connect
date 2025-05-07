
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
    // Create Supabase client with service role key for admin access
    const supabaseUrl = Deno.env.get("SUPABASE_URL") as string;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") as string;
    
    // We use the service role key here because we need to perform administrative actions
    const adminClient = createClient(supabaseUrl, supabaseServiceKey);
    
    // Standard client for user operations
    const supabaseClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY") as string, {
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

    const { inviteId } = await req.json();
    const now = new Date();

    // 1. Get the invite and check if it's valid
    const { data: invite, error: inviteError } = await adminClient
      .from('support_invites')
      .select('*')
      .eq('id', inviteId)
      .single();

    if (inviteError || !invite) {
      console.error("Error retrieving invite:", inviteError);
      return new Response(JSON.stringify({ error: 'Invalid invite ID' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    // 2. Check if invite has expired
    const expiresAt = new Date(invite.expires_at);
    if (now > expiresAt) {
      return new Response(JSON.stringify({ 
        success: false, 
        reason: 'expired',
        message: 'Invite has expired'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    // 3. Mark the invite as joined
    await adminClient
      .from('support_invites')
      .update({ joined: true })
      .eq('id', inviteId);

    // 4. Get user's current streak
    const { data: profile } = await adminClient
      .from('profiles')
      .select('current_streak, longest_streak')
      .eq('id', invite.user_id)
      .single();

    // 5. Increment streak and update last streak timestamp
    const newStreakCount = (profile?.current_streak || 0) + 1;
    const longestStreak = Math.max(newStreakCount, profile?.longest_streak || 0);
    
    await adminClient
      .from('profiles')
      .update({ 
        current_streak: newStreakCount,
        longest_streak: longestStreak,
        streak_last_at: now.toISOString()
      })
      .eq('id', invite.user_id);

    // 6. Create or get a room for the support session
    // Check if there's already an active room
    const { data: existingRoom } = await adminClient
      .from('rooms')
      .select('id, name')
      .eq('creator_id', invite.user_id)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    
    let roomId;
    let roomName;
    
    if (existingRoom) {
      roomId = existingRoom.id;
      roomName = existingRoom.name;
    } else {
      // Create new room
      const { data: newRoom, error: roomError } = await adminClient
        .from('rooms')
        .insert({
          name: 'Support Session',
          description: 'Support session created from extension',
          host_id: user.id,  // The responder becomes the host
          creator_id: invite.user_id, // The person who needed help is the creator
          is_active: true,
        })
        .select()
        .single();
        
      if (roomError) {
        console.error("Error creating room:", roomError);
        return new Response(JSON.stringify({ error: 'Failed to create support room' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        });
      }
      
      roomId = newRoom.id;
      roomName = newRoom.name;
      
      // Add the responder as a speaker
      await adminClient
        .from('room_participants')
        .insert({
          room_id: roomId,
          user_id: user.id,
          is_speaker: true,
          is_moderator: true,
          is_muted: false
        });
      
      // Add the user who needs support as a participant
      await adminClient
        .from('room_participants')
        .insert({
          room_id: roomId,
          user_id: invite.user_id,
          is_speaker: true,
          is_creator: true,
          is_muted: false
        });
    }

    // 7. Return success with room URL
    const roomUrl = `https://clutch.live/room/${roomId}`;
    
    return new Response(JSON.stringify({ 
      success: true, 
      roomId: roomId,
      roomName: roomName,
      roomUrl: roomUrl,
      streakCount: newStreakCount,
      message: 'Successfully joined support invite'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error("Error in join-invite:", error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
