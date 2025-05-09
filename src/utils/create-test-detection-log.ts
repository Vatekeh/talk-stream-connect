
import { supabase } from "@/integrations/supabase/client";

/**
 * Creates a test detection log using the current user
 * @param detectionType The type of detection (e.g., "nsfw", "harassment", "spam")
 * @returns Promise<boolean> True if successful
 */
export async function createTestDetectionLog(detectionType: string = "test"): Promise<boolean> {
  try {
    // Get the current user
    const { data } = await supabase.auth.getUser();
    
    if (!data.user) {
      console.error("No authenticated user found");
      return false;
    }
    
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const url = `${supabaseUrl}/functions/v1/detection-logs`;
    
    // Get the session for authorization
    const { data: sessionData } = await supabase.auth.getSession();
    
    // Create a test detection log
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${sessionData?.session?.access_token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        user_id: data.user.id,
        url: "https://example.com/test-page",
        detection_type: detectionType,
        details: {
          pageTitle: "Test Detection Page",
          duration: Math.floor(Math.random() * 600) + 30, // Random duration between 30-630 seconds
          tags: ["test", "manual", detectionType],
          source: "manual test",
          timestamp: new Date().toISOString()
        }
      })
    });
    
    if (!response.ok) {
      throw new Error(`Failed to create detection log: ${response.statusText}`);
    }
    
    console.log("Test detection log created successfully!");
    return true;
  } catch (error) {
    console.error("Failed to create test detection log:", error);
    return false;
  }
}
