
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

    const { userId } = await req.json();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 60000); // 60 seconds from now

    // 1. Check if there's an expired invite and reset streak if needed
    const { data: expiredInvites } = await adminClient
      .from('support_invites')
      .select('*')
      .eq('user_id', userId)
      .lt('expires_at', now.toISOString())
      .eq('joined', false)
      .limit(1);

    if (expiredInvites && expiredInvites.length > 0) {
      // Reset streak count if there were expired invites
      await adminClient
        .from('profiles')
        .update({ current_streak: 0 })
        .eq('id', userId);
      
      console.log(`Reset streak for user ${userId} due to expired invite`);
    }

    // 2. Create a new support invite
    const { data: invite, error: inviteError } = await adminClient
      .from('support_invites')
      .insert({
        user_id: userId,
        expires_at: expiresAt.toISOString(),
        joined: false
      })
      .select()
      .single();

    if (inviteError) {
      console.error("Error creating support invite:", inviteError);
      return new Response(JSON.stringify({ error: 'Failed to create support invite' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }

    // 3. Get user profile info for the broadcast
    const { data: profile } = await adminClient
      .from('profiles')
      .select('username')
      .eq('id', userId)
      .single();
    
    const username = profile?.username || 'Anonymous';

    // 4. Broadcast to support_requests channel
    const broadcastResult = await adminClient
      .channel('support_requests')
      .send({
        type: 'broadcast',
        event: 'NEW_INVITE',
        payload: {
          inviteId: invite.id,
          userId: userId,
          username: username,
          expiresAt: invite.expires_at
        }
      });

    console.log("Broadcast result:", broadcastResult);

    return new Response(
      JSON.stringify({
        success: true,
        invite: invite,
        message: 'Support invite created and broadcasted to support team'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error in on-edging-detected:", error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
