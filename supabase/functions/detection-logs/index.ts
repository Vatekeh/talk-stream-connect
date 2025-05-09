
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create a Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get the JWT from the request
    const authHeader = req.headers.get('Authorization') || '';
    const token = authHeader.replace('Bearer ', '');

    // Set the auth token
    const user = await supabase.auth.getUser(token);
    if (user.error) {
      console.error('Authentication error:', user.error);
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { 
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Check if user is a moderator for GET requests that fetch all logs
    let isModerator = false;
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('is_moderator')
      .eq('id', user.data.user?.id)
      .single();
    
    if (profileError) {
      console.error('Error fetching profile:', profileError);
      // Continue but assume not a moderator
    } else {
      isModerator = profile?.is_moderator || false;
    }

    if (req.method === 'GET') {
      const url = new URL(req.url);
      const userId = url.searchParams.get('userId');

      let query = supabase
        .from('detection_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      // If userId is specified and user is moderator, filter by userId
      if (userId && isModerator) {
        query = query.eq('user_id', userId);
      } else if (!isModerator) {
        // Regular users can only see their own logs
        query = query.eq('user_id', user.data.user?.id);
      }

      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching logs:', error);
        throw error;
      }

      return new Response(JSON.stringify(data || []), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (req.method === 'POST') {
      // Parse the request body
      const payload = await req.json();
      
      // Ensure the user can only log detections for themselves unless they're a moderator
      if (!isModerator && payload.user_id !== user.data.user?.id) {
        payload.user_id = user.data.user?.id;
      }

      // Insert the detection log
      const { error } = await supabase
        .from('detection_logs')
        .insert(payload);
      
      if (error) {
        console.error('Error inserting log:', error);
        throw error;
      }

      return new Response(JSON.stringify({ success: true }), {
        status: 201,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error processing request:', error);
    return new Response(JSON.stringify({ error: String(error) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
