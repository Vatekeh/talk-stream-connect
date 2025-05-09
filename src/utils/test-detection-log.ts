
import { DetectionService } from "@/services/DetectionService";
import { supabase } from "@/integrations/supabase/client";

/**
 * This is a utility function to test the detection logs feature.
 * It creates a sample detection log entry for the currently authenticated user.
 */
export async function createTestDetectionLog() {
  try {
    // Get the current user
    const { data } = await supabase.auth.getUser();
    
    if (!data.user) {
      console.error("No authenticated user found");
      return false;
    }
    
    // Create a test detection log
    await DetectionService.logDetection({
      user_id: data.user.id,
      url: "https://example.com/test-page",
      detection_type: "test",
      details: {
        source: "manual test",
        confidence: 0.95,
        timestamp: new Date().toISOString(),
      }
    });
    
    console.log("Test detection log created successfully!");
    return true;
  } catch (error) {
    console.error("Failed to create test detection log:", error);
    return false;
  }
}
