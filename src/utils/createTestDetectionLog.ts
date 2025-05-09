
import { supabase } from "@/integrations/supabase/client";

/**
 * Creates a test detection log for development purposes.
 * This function can be called from the browser console to easily create test data.
 */
export async function createTestDetectionLog() {
  try {
    const { data: user } = await supabase.auth.getUser();
    
    if (!user?.user?.id) {
      console.error("You must be logged in to create test logs");
      return;
    }
    
    const websites = [
      "example.com", 
      "test-site.org", 
      "harmless-content.net", 
      "blocked-content.com"
    ];
    
    const detectionTypes = [
      "nsfw", 
      "nsfw_image", 
      "harassment", 
      "spam"
    ];
    
    const pageTitles = [
      "Test Page", 
      "Example Website", 
      "Sample Content", 
      "Problematic Material"
    ];
    
    // Generate random data
    const randomSite = websites[Math.floor(Math.random() * websites.length)];
    const randomType = detectionTypes[Math.floor(Math.random() * detectionTypes.length)];
    const randomTitle = pageTitles[Math.floor(Math.random() * pageTitles.length)];
    const randomDuration = Math.floor(Math.random() * 300) + 10; // 10 to 310 seconds
    
    const testLog = {
      user_id: user.user.id,
      url: `https://${randomSite}/page${Math.floor(Math.random() * 100)}`,
      detection_type: randomType,
      details: {
        pageTitle: randomTitle,
        duration: randomDuration,
        tags: [randomType, "test_data"]
      }
    };
    
    const result = await supabase
      .from('detection_logs')
      .insert(testLog);
      
    if (result.error) {
      console.error("Error creating test log:", result.error);
      return false;
    }
    
    console.log("Test log created successfully:", testLog);
    return true;
  } catch (error) {
    console.error("Error creating test detection log:", error);
    return false;
  }
}

// Make it available in the window object for easy access from the console
if (typeof window !== 'undefined') {
  (window as any).createTestDetectionLog = createTestDetectionLog;
}
