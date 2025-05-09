
import { supabase } from '@/integrations/supabase/client';

/**
 * Creates test detection logs for development and testing purposes
 * @param userId The user ID to create logs for
 * @param count The number of logs to create (default: 5)
 * @returns Promise resolving to success status
 */
export async function createTestDetectionLogs(userId: string, count: number = 5): Promise<boolean> {
  try {
    const domains = [
      'example.com', 
      'testsite.org', 
      'demo.net', 
      'sample.io', 
      'contentsite.com'
    ];
    
    const titles = [
      'Sample Content Page', 
      'Test Article', 
      'Demo Video', 
      'Example Image Gallery', 
      'Content Example'
    ];
    
    const detectionTypes = [
      'nsfw', 
      'adult_content', 
      'explicit_image', 
      'inappropriate_content'
    ];
    
    const now = new Date();
    
    for (let i = 0; i < count; i++) {
      // Create random data
      const domain = domains[Math.floor(Math.random() * domains.length)];
      const title = titles[Math.floor(Math.random() * titles.length)];
      const type = detectionTypes[Math.floor(Math.random() * detectionTypes.length)];
      const path = `/page${Math.floor(Math.random() * 100)}.html`;
      
      // Create random timestamp within the last 14 days
      const timestamp = new Date(now);
      timestamp.setDate(now.getDate() - Math.floor(Math.random() * 14));
      
      // Create random duration between 5 and 300 seconds
      const duration = Math.floor(Math.random() * 295) + 5;
      
      // Prepare log data
      const url = `https://${domain}${path}`;
      const details = {
        pageTitle: `${title} ${i + 1}`,
        duration: duration,
        tags: [type, domain.split('.')[0]]
      };
      
      // Insert log
      const { error } = await supabase
        .from('detection_logs')
        .insert({
          user_id: userId,
          url: url,
          detection_type: type,
          details: details,
          created_at: timestamp.toISOString()
        });
      
      if (error) {
        console.error('Error creating test log:', error);
        return false;
      }
    }
    
    return true;
  } catch (err) {
    console.error('Failed to create test logs:', err);
    return false;
  }
}
