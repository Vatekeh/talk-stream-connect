
import { supabase } from "@/integrations/supabase/client";

export interface DetectionLogEntry {
  id?: string;
  user_id: string;
  url: string;
  detection_type: string;
  details?: any;
  created_at?: string;
}

export class DetectionService {
  // Log a new detection
  static async logDetection(data: DetectionLogEntry): Promise<boolean> {
    const { error } = await supabase
      .from('detection_logs')
      .insert(data);
    
    if (error) {
      console.error('Error logging detection:', error);
      throw error;
    }
    return true;
  }

  // Get logs for the current user or all logs for moderators
  static async getLogs(): Promise<DetectionLogEntry[]> {
    const { data, error } = await supabase
      .from('detection_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);
    
    if (error) {
      console.error('Error fetching detection logs:', error);
      throw error;
    }
    
    return data || [];
  }

  // Get logs for a specific user (for moderators)
  static async getUserLogs(userId: string): Promise<DetectionLogEntry[]> {
    const { data, error } = await supabase
      .from('detection_logs')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50);
    
    if (error) {
      console.error('Error fetching user detection logs:', error);
      throw error;
    }
    
    return data || [];
  }
}
