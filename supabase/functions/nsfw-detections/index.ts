
import { serve } from "https://deno.land/std@0.192.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Set up CORS headers for cross-origin requests from the Chrome extension
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

    // Parse request body
    const { pageUrl, mediaUrl, detectedClass, confidence, thumbBase64 } = await req.json();

    // Validate required fields
    if (!pageUrl || !mediaUrl || !detectedClass || confidence === undefined) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    // Insert the NSFW detection record
    const { error: insertError } = await supabaseClient
      .from('nsfw_detections')
      .insert({
        user_id: user.id,
        page_url: pageUrl,
        media_url: mediaUrl,
        detected_class: detectedClass,
        confidence: confidence,
        thumb_base64: thumbBase64 || null,
      });

    if (insertError) {
      console.error("Error inserting record:", insertError);
      return new Response(JSON.stringify({ error: 'Failed to save detection' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }

    // Return success response
    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 201,
    });

  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
